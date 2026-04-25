const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Configuration
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),

  // Server control
  startServer: () => ipcRenderer.invoke('start-server'),
  stopServer: () => ipcRenderer.invoke('stop-server'),
  getStatus: () => ipcRenderer.invoke('get-status'),

  // Authentication
  sendPhone: (phone) => ipcRenderer.invoke('send-phone', phone),
  verifyCode: (code) => ipcRenderer.invoke('verify-code', code),

  // Event listeners
  onStatus: (callback) => ipcRenderer.on('status', (event, data) => callback(data)),
  onMessage: (callback) => ipcRenderer.on('message', (event, data) => callback(data)),
  onError: (callback) => ipcRenderer.on('error', (event, data) => callback(data)),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
