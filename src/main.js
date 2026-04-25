const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');
const MCPServer = require('./mcp-server');

// Initialize secure storage
const store = new Store({
  encryptionKey: 'telegram-mcp-secure-key-2024',
  name: 'telegram-mcp-config'
});

let mainWindow = null;
const accounts = new Map(); // account_id -> { mcpServer, status }

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Telegram MCP Manager',
    backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function sendToRenderer(channel, data) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, data);
  }
}

function showNotification(title, body) {
  if (Notification.isSupported()) {
    const notification = new Notification({ title, body });
    notification.show();
  }
}

// ============== Account Management ==============

ipcMain.handle('get-accounts', async () => {
  const savedAccounts = store.get('accounts') || [];
  return savedAccounts.map(acc => ({
    ...acc,
    connected: accounts.has(acc.id)
  }));
});

ipcMain.handle('add-account', async (event, { name, apiId, apiHash, phone }) => {
  const accountId = Date.now().toString();
  const savedAccounts = store.get('accounts') || [];
  
  const newAccount = {
    id: accountId,
    name,
    apiId,
    apiHash,
    phone: phone || '',
    systemPrompt: 'You are a helpful Telegram assistant. Respond to messages politely and helpfully.',
    aiProvider: 'glm',
    aiBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    aiApiKey: '',
    aiModel: 'glm-4',
    tools: {
      autoRespond: true,
      scheduleWakeup: false,
      wakeupTime: '09:00',
      wakeupInterval: 5
    },
    enabled: true
  };
  
  savedAccounts.push(newAccount);
  store.set('accounts', savedAccounts);
  
  return { success: true, account: newAccount };
});

ipcMain.handle('update-account', async (event, { id, updates }) => {
  const savedAccounts = store.get('accounts') || [];
  const index = savedAccounts.findIndex(a => a.id === id);
  
  if (index !== -1) {
    savedAccounts[index] = { ...savedAccounts[index], ...updates };
    store.set('accounts', savedAccounts);
    
    // Update running server if exists
    if (accounts.has(id)) {
      const accountData = accounts.get(id);
      if (accountData.mcpServer) {
        accountData.mcpServer.updateConfig(savedAccounts[index]);
      }
    }
    
    return { success: true };
  }
  
  return { success: false, error: 'Account not found' };
});

ipcMain.handle('delete-account', async (event, { id }) => {
  // Stop server if running
  if (accounts.has(id)) {
    const accountData = accounts.get(id);
    if (accountData.mcpServer) {
      await accountData.mcpServer.stop();
    }
    accounts.delete(id);
  }
  
  // Remove from storage
  const savedAccounts = store.get('accounts') || [];
  const filtered = savedAccounts.filter(a => a.id !== id);
  store.set('accounts', filtered);
  
  return { success: true };
});

// ============== Server Control ==============

ipcMain.handle('connect-account', async (event, { id }) => {
  const savedAccounts = store.get('accounts') || [];
  const account = savedAccounts.find(a => a.id === id);
  
  if (!account) {
    return { success: false, error: 'Account not found' };
  }
  
  if (accounts.has(id)) {
    return { success: false, error: 'Already connected' };
  }
  
  try {
    const mcpServer = new MCPServer({
      accountId: id,
      apiId: account.apiId,
      apiHash: account.apiHash,
      systemPrompt: account.systemPrompt,
      aiProvider: account.aiProvider,
      aiBaseUrl: account.aiBaseUrl,
      aiApiKey: account.aiApiKey,
      aiModel: account.aiModel,
      tools: account.tools,
      onMessage: (msg) => {
        sendToRenderer('message', { accountId: id, ...msg });
      },
      onStatus: (status) => {
        sendToRenderer('status', { accountId: id, ...status });
        if (accounts.has(id)) {
          accounts.get(id).status = status;
        }
      },
      onError: (err) => {
        sendToRenderer('error', { accountId: id, error: err });
      }
    });
    
    await mcpServer.start();
    
    accounts.set(id, {
      mcpServer,
      status: { connected: true, message: 'Connected' }
    });
    
    showNotification('Account Connected', `${account.name} is now connected`);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('disconnect-account', async (event, { id }) => {
  if (!accounts.has(id)) {
    return { success: false, error: 'Not connected' };
  }
  
  try {
    const accountData = accounts.get(id);
    if (accountData.mcpServer) {
      await accountData.mcpServer.stop();
    }
    accounts.delete(id);
    
    showNotification('Account Disconnected', 'Account has been disconnected');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-account-status', async (event, { id }) => {
  if (accounts.has(id)) {
    return accounts.get(id).status;
  }
  return { connected: false, message: 'Not connected' };
});

// ============== Tool Control ==============

ipcMain.handle('toggle-tool', async (event, { accountId, tool, enabled }) => {
  const savedAccounts = store.get('accounts') || [];
  const index = savedAccounts.findIndex(a => a.id === accountId);
  
  if (index !== -1) {
    if (!savedAccounts[index].tools) {
      savedAccounts[index].tools = {};
    }
    savedAccounts[index].tools[tool] = enabled;
    store.set('accounts', savedAccounts);
    
    // Update running server
    if (accounts.has(accountId)) {
      const accountData = accounts.get(accountId);
      if (accountData.mcpServer) {
        accountData.mcpServer.updateTools(savedAccounts[index].tools);
      }
    }
    
    return { success: true };
  }
  
  return { success: false, error: 'Account not found' };
});

ipcMain.handle('set-wakeup-time', async (event, { accountId, time, interval }) => {
  const savedAccounts = store.get('accounts') || [];
  const index = savedAccounts.findIndex(a => a.id === accountId);
  
  if (index !== -1) {
    if (!savedAccounts[index].tools) {
      savedAccounts[index].tools = {};
    }
    savedAccounts[index].tools.wakeupTime = time;
    savedAccounts[index].tools.wakeupInterval = interval;
    store.set('accounts', savedAccounts);
    
    // Update running server
    if (accounts.has(accountId)) {
      const accountData = accounts.get(accountId);
      if (accountData.mcpServer) {
        accountData.mcpServer.updateTools(savedAccounts[index].tools);
      }
    }
    
    return { success: true };
  }
  
  return { success: false, error: 'Account not found' };
});

// ============== AI Configuration ==============

ipcMain.handle('update-ai-config', async (event, { accountId, config }) => {
  const savedAccounts = store.get('accounts') || [];
  const index = savedAccounts.findIndex(a => a.id === accountId);
  
  if (index !== -1) {
    savedAccounts[index] = { ...savedAccounts[index], ...config };
    store.set('accounts', savedAccounts);
    
    // Update running server
    if (accounts.has(accountId)) {
      const accountData = accounts.get(accountId);
      if (accountData.mcpServer) {
        accountData.mcpServer.updateConfig(savedAccounts[index]);
      }
    }
    
    return { success: true };
  }
  
  return { success: false, error: 'Account not found' };
});

ipcMain.handle('update-system-prompt', async (event, { accountId, prompt }) => {
  const savedAccounts = store.get('accounts') || [];
  const index = savedAccounts.findIndex(a => a.id === accountId);
  
  if (index !== -1) {
    savedAccounts[index].systemPrompt = prompt;
    store.set('accounts', savedAccounts);
    
    // Update running server
    if (accounts.has(accountId)) {
      const accountData = accounts.get(accountId);
      if (accountData.mcpServer) {
        accountData.mcpServer.updateConfig(savedAccounts[index]);
      }
    }
    
    return { success: true };
  }
  
  return { success: false, error: 'Account not found' };
});

// ============== Messages & Monitoring ==============

ipcMain.handle('get-messages', async (event, { accountId, limit = 100 }) => {
  if (accounts.has(accountId)) {
    const accountData = accounts.get(accountId);
    if (accountData.mcpServer) {
      return await accountData.mcpServer.getMessages(limit);
    }
  }
  return [];
});

ipcMain.handle('get-chats', async (event, { accountId }) => {
  if (accounts.has(accountId)) {
    const accountData = accounts.get(accountId);
    if (accountData.mcpServer) {
      return await accountData.mcpServer.getChats();
    }
  }
  return [];
});

// ============== Telegram Login ==============

ipcMain.handle('send-phone', async (event, { accountId, phone }) => {
  if (accounts.has(accountId)) {
    const accountData = accounts.get(accountId);
    if (accountData.mcpServer) {
      return await accountData.mcpServer.sendPhoneNumber(phone);
    }
  }
  return { success: false, error: 'Account not connected' };
});

ipcMain.handle('verify-code', async (event, { accountId, code }) => {
  if (accounts.has(accountId)) {
    const accountData = accounts.get(accountId);
    if (accountData.mcpServer) {
      return await accountData.mcpServer.verifyCode(code);
    }
  }
  return { success: false, error: 'Account not connected' };
});

// ============== App Lifecycle ==============

app.whenReady().then(() => {
  createWindow();
  
  // Auto-connect enabled accounts
  const savedAccounts = store.get('accounts') || [];
  savedAccounts.forEach(async (account) => {
    if (account.enabled && account.autoConnect) {
      // Delay to let UI load first
      setTimeout(async () => {
        try {
          await ipcMain.invoke('connect-account', { id: account.id });
        } catch (e) {
          console.error('Auto-connect failed:', e);
        }
      }, 2000);
    }
  });
});

app.on('window-all-closed', () => {
  // Stop all servers
  accounts.forEach(async (data) => {
    if (data.mcpServer) {
      await data.mcpServer.stop();
    }
  });
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  // Stop all servers
  for (const [id, data] of accounts) {
    if (data.mcpServer) {
      await data.mcpServer.stop();
    }
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
