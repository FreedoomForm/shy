const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Account Management
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  addAccount: (data) => ipcRenderer.invoke('add-account', data),
  updateAccount: (data) => ipcRenderer.invoke('update-account', data),
  deleteAccount: (id) => ipcRenderer.invoke('delete-account', id),
  getDefaultCredentials: () => ipcRenderer.invoke('get-default-credentials'),
  
  // Server Control
  connectAccount: (id) => ipcRenderer.invoke('connect-account', { id }),
  disconnectAccount: (id) => ipcRenderer.invoke('disconnect-account', { id }),
  getAccountStatus: (id) => ipcRenderer.invoke('get-account-status', { id }),
  
  // Tool Control
  toggleTool: (accountId, tool, enabled) => ipcRenderer.invoke('toggle-tool', { accountId, tool, enabled }),
  setWakeupTime: (accountId, time, interval) => ipcRenderer.invoke('set-wakeup-time', { accountId, time, interval }),
  
  // AI Configuration
  updateAIConfig: (accountId, config) => ipcRenderer.invoke('update-ai-config', { accountId, config }),
  updateSystemPrompt: (accountId, prompt) => ipcRenderer.invoke('update-system-prompt', { accountId, prompt }),
  
  // Messages & Monitoring
  getMessages: (accountId, limit) => ipcRenderer.invoke('get-messages', { accountId, limit }),
  getChats: (accountId) => ipcRenderer.invoke('get-chats', { accountId }),
  
  // Telegram Login
  sendPhone: (accountId, phone) => ipcRenderer.invoke('send-phone', { accountId, phone }),
  verifyCode: (accountId, code) => ipcRenderer.invoke('verify-code', { accountId, code }),
  
  // Event Listeners
  onMessage: (callback) => ipcRenderer.on('message', (event, data) => callback(data)),
  onStatus: (callback) => ipcRenderer.on('status', (event, data) => callback(data)),
  onError: (callback) => ipcRenderer.on('error', (event, data) => callback(data)),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
