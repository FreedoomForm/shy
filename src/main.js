const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const MCPServer = require('./mcp-server');
const TunnelClient = require('./tunnel-client');

// Initialize secure storage
const store = new Store({
  encryptionKey: 'telegram-mcp-secure-key-2024',
  name: 'telegram-mcp-config'
});

let mainWindow = null;
let tray = null;
let mcpServer = null;
let tunnelClient = null;
let isQuitting = false;

// Frontend URL - this connects to the cloud frontend
const FRONTEND_URL = 'https://mine207.space.z.ai';
const BACKEND_PORT = 9876;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../resources/icon.png'),
    title: 'Telegram MCP Server',
    backgroundColor: '#0a0a0f',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../resources/icon.png'));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Server Status',
      enabled: false,
      click: () => {}
    },
    { type: 'separator' },
    {
      label: 'Start Server',
      click: () => startMCPServer()
    },
    {
      label: 'Stop Server',
      click: () => stopMCPServer()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Telegram MCP Server');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function updateTrayStatus(status) {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: `Status: ${status}`,
      enabled: false
    },
    { type: 'separator' },
    {
      label: status === 'Running' ? 'Restart Server' : 'Start Server',
      click: () => startMCPServer()
    },
    {
      label: 'Stop Server',
      enabled: status === 'Running',
      click: () => stopMCPServer()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

async function startMCPServer() {
  try {
    const config = store.get('telegramConfig');
    
    if (!config || !config.apiId || !config.apiHash) {
      sendToRenderer('error', 'Please configure your Telegram API credentials first');
      return;
    }

    sendToRenderer('status', { message: 'Starting MCP server...', type: 'info' });
    updateTrayStatus('Starting...');

    // Start local MCP server
    mcpServer = new MCPServer({
      port: BACKEND_PORT,
      apiId: config.apiId,
      apiHash: config.apiHash,
      systemPrompt: config.systemPrompt || 'You are a helpful assistant.',
      onMessage: (msg) => sendToRenderer('message', msg),
      onStatus: (status) => {
        sendToRenderer('status', status);
        updateTrayStatus(status.message);
      },
      onError: (err) => sendToRenderer('error', err)
    });

    await mcpServer.start();

    // Connect to frontend via tunnel
    tunnelClient = new TunnelClient({
      localPort: BACKEND_PORT,
      frontendUrl: FRONTEND_URL,
      onConnect: () => {
        sendToRenderer('status', { message: 'Connected to frontend', type: 'success' });
        showNotification('Server Connected', 'MCP server is now connected to the frontend');
      },
      onDisconnect: () => {
        sendToRenderer('status', { message: 'Disconnected from frontend', type: 'warning' });
      }
    });

    await tunnelClient.connect();

    sendToRenderer('status', { message: 'Running', type: 'success' });
    updateTrayStatus('Running');
    showNotification('Server Started', 'MCP server is running and connected');

  } catch (error) {
    console.error('Failed to start MCP server:', error);
    sendToRenderer('error', error.message);
    updateTrayStatus('Error');
  }
}

async function stopMCPServer() {
  try {
    sendToRenderer('status', { message: 'Stopping server...', type: 'info' });
    updateTrayStatus('Stopping...');

    if (tunnelClient) {
      await tunnelClient.disconnect();
      tunnelClient = null;
    }

    if (mcpServer) {
      await mcpServer.stop();
      mcpServer = null;
    }

    sendToRenderer('status', { message: 'Stopped', type: 'warning' });
    updateTrayStatus('Stopped');
    showNotification('Server Stopped', 'MCP server has been stopped');

  } catch (error) {
    console.error('Failed to stop MCP server:', error);
    sendToRenderer('error', error.message);
  }
}

function sendToRenderer(channel, data) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, data);
  }
}

function showNotification(title, body) {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      icon: path.join(__dirname, '../resources/icon.png')
    });
    notification.show();
  }
}

// IPC Handlers
ipcMain.handle('get-config', async () => {
  return store.get('telegramConfig') || {};
});

ipcMain.handle('save-config', async (event, config) => {
  store.set('telegramConfig', config);
  return { success: true };
});

ipcMain.handle('start-server', async () => {
  await startMCPServer();
  return { success: true };
});

ipcMain.handle('stop-server', async () => {
  await stopMCPServer();
  return { success: true };
});

ipcMain.handle('get-status', async () => {
  return {
    running: mcpServer !== null,
    connected: tunnelClient !== null && tunnelClient.isConnected(),
    port: BACKEND_PORT
  };
});

ipcMain.handle('send-phone', async (event, phone) => {
  if (mcpServer) {
    return await mcpServer.sendPhoneNumber(phone);
  }
  throw new Error('Server not running');
});

ipcMain.handle('verify-code', async (event, code) => {
  if (mcpServer) {
    return await mcpServer.verifyCode(code);
  }
  throw new Error('Server not running');
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();

  // Auto-start server if configured
  const config = store.get('telegramConfig');
  if (config && config.autoStart) {
    setTimeout(() => startMCPServer(), 2000);
  }
});

app.on('window-all-closed', (event) => {
  // Prevent app from closing - minimize to tray
  event.preventDefault();
});

app.on('before-quit', async () => {
  isQuitting = true;
  await stopMCPServer();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
