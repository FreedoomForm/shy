// DOM Elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const statsGrid = document.getElementById('statsGrid');
const statReceived = document.getElementById('statReceived');
const statSent = document.getElementById('statSent');
const statUptime = document.getElementById('statUptime');

const stepConfig = document.getElementById('stepConfig');
const stepPhone = document.getElementById('stepPhone');
const stepCode = document.getElementById('stepCode');
const tunnelInfo = document.getElementById('tunnelInfo');
const tunnelUrl = document.getElementById('tunnelUrl');

const apiIdInput = document.getElementById('apiId');
const apiHashInput = document.getElementById('apiHash');
const systemPromptInput = document.getElementById('systemPrompt');
const autoStartInput = document.getElementById('autoStart');
const phoneNumberInput = document.getElementById('phoneNumber');
const verifyCodeInput = document.getElementById('verifyCode');

const saveConfigBtn = document.getElementById('saveConfigBtn');
const startBtn = document.getElementById('startBtn');
const sendPhoneBtn = document.getElementById('sendPhoneBtn');
const verifyCodeBtn = document.getElementById('verifyCodeBtn');
const restartBtn = document.getElementById('restartBtn');
const stopBtn = document.getElementById('stopBtn');

const logContainer = document.getElementById('logContainer');

// State
let isRunning = false;
let startTime = null;
let uptimeInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  setupEventListeners();
  setupIPCListeners();
  checkStatus();
});

async function loadConfig() {
  try {
    const config = await window.electronAPI.getConfig();
    if (config.apiId) apiIdInput.value = config.apiId;
    if (config.apiHash) apiHashInput.value = config.apiHash;
    if (config.systemPrompt) systemPromptInput.value = config.systemPrompt;
    if (config.autoStart !== undefined) autoStartInput.checked = config.autoStart;
    addLog('Configuration loaded', 'info');
  } catch (error) {
    addLog('Failed to load config: ' + error.message, 'error');
  }
}

function setupEventListeners() {
  saveConfigBtn.addEventListener('click', saveConfig);
  startBtn.addEventListener('click', startServer);
  sendPhoneBtn.addEventListener('click', sendPhone);
  verifyCodeBtn.addEventListener('click', verifyCode);
  restartBtn.addEventListener('click', restartServer);
  stopBtn.addEventListener('click', stopServer);
}

function setupIPCListeners() {
  window.electronAPI.onStatus((status) => {
    updateStatus(status.message, status.type);
  });

  window.electronAPI.onMessage((msg) => {
    if (msg.type === 'message') {
      addLog(`Message from ${msg.from}: ${msg.text.substring(0, 50)}...`, 'info');
    } else if (msg.type === 'response') {
      addLog(`AI Response: ${msg.text.substring(0, 50)}...`, 'success');
    } else if (msg.type === 'system') {
      addLog(msg.text, 'success');
    }
  });

  window.electronAPI.onError((error) => {
    addLog('Error: ' + error, 'error');
    updateStatus('Error', 'error');
  });
}

async function saveConfig() {
  try {
    const config = {
      apiId: apiIdInput.value,
      apiHash: apiHashInput.value,
      systemPrompt: systemPromptInput.value,
      autoStart: autoStartInput.checked
    };
    await window.electronAPI.saveConfig(config);
    addLog('Configuration saved', 'success');
  } catch (error) {
    addLog('Failed to save config: ' + error.message, 'error');
  }
}

async function startServer() {
  try {
    await saveConfig();
    startBtn.disabled = true;
    startBtn.innerHTML = '<div class="loader"></div> Starting...';
    await window.electronAPI.startServer();
  } catch (error) {
    addLog('Failed to start server: ' + error.message, 'error');
    startBtn.disabled = false;
    startBtn.textContent = 'Start Server';
  }
}

async function sendPhone() {
  try {
    sendPhoneBtn.disabled = true;
    sendPhoneBtn.innerHTML = '<div class="loader"></div> Sending...';
    // This would call the server's send-phone endpoint
    addLog('Sending phone number...', 'info');
  } catch (error) {
    addLog('Failed to send phone: ' + error.message, 'error');
    sendPhoneBtn.disabled = false;
    sendPhoneBtn.textContent = 'Send Code';
  }
}

async function verifyCode() {
  try {
    verifyCodeBtn.disabled = true;
    verifyCodeBtn.innerHTML = '<div class="loader"></div> Verifying...';
    addLog('Verifying code...', 'info');
  } catch (error) {
    addLog('Failed to verify code: ' + error.message, 'error');
    verifyCodeBtn.disabled = false;
    verifyCodeBtn.textContent = 'Verify & Connect';
  }
}

async function restartServer() {
  try {
    restartBtn.disabled = true;
    addLog('Restarting server...', 'info');
    await window.electronAPI.stopServer();
    setTimeout(async () => {
      await window.electronAPI.startServer();
      restartBtn.disabled = false;
    }, 2000);
  } catch (error) {
    addLog('Failed to restart: ' + error.message, 'error');
    restartBtn.disabled = false;
  }
}

async function stopServer() {
  try {
    stopBtn.disabled = true;
    addLog('Stopping server...', 'info');
    await window.electronAPI.stopServer();
    isRunning = false;
    stopBtn.disabled = false;
    clearInterval(uptimeInterval);
    updateStatus('Stopped', 'warning');
  } catch (error) {
    addLog('Failed to stop server: ' + error.message, 'error');
    stopBtn.disabled = false;
  }
}

async function checkStatus() {
  try {
    const status = await window.electronAPI.getStatus();
    isRunning = status.running;
    
    if (status.running) {
      updateStatus('Running', 'success');
      startBtn.disabled = true;
      tunnelInfo.classList.add('active');
      tunnelUrl.textContent = `http://localhost:${status.port}`;
    } else {
      updateStatus('Not running', 'warning');
    }
  } catch (error) {
    console.error('Failed to check status:', error);
  }
}

function updateStatus(text, type) {
  statusText.textContent = text;
  statusDot.className = 'status-dot';
  
  if (type === 'success') {
    statusDot.classList.add('running');
    isRunning = true;
    startTime = Date.now();
    startUptimeCounter();
    showStep('running');
  } else if (type === 'error') {
    statusDot.classList.add('error');
    startBtn.disabled = false;
    startBtn.textContent = 'Start Server';
  } else if (type === 'warning') {
    isRunning = false;
    clearInterval(uptimeInterval);
  }

  if (text.includes('Phone') || text.includes('phone')) {
    showStep('phone');
  } else if (text.includes('Code') || text.includes('code') || text.includes('Verification')) {
    showStep('code');
  }
}

function showStep(step) {
  stepConfig.classList.remove('active');
  stepPhone.classList.remove('active');
  stepCode.classList.remove('active');

  switch (step) {
    case 'config':
      stepConfig.classList.add('active');
      break;
    case 'phone':
      stepPhone.classList.add('active');
      break;
    case 'code':
      stepCode.classList.add('active');
      break;
    case 'running':
      stepConfig.classList.add('active');
      break;
  }
}

function addLog(message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  
  const time = document.createElement('span');
  time.className = 'log-time';
  time.textContent = new Date().toLocaleTimeString();
  
  const msg = document.createElement('span');
  msg.className = `log-message ${type}`;
  msg.textContent = message;
  
  entry.appendChild(time);
  entry.appendChild(msg);
  logContainer.appendChild(entry);
  
  // Auto-scroll
  logContainer.scrollTop = logContainer.scrollHeight;
  
  // Keep only last 100 entries
  while (logContainer.children.length > 100) {
    logContainer.removeChild(logContainer.firstChild);
  }
}

function startUptimeCounter() {
  clearInterval(uptimeInterval);
  
  uptimeInterval = setInterval(() => {
    if (!startTime) return;
    
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    let uptime;
    if (hours > 0) {
      uptime = `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      uptime = `${minutes}m ${seconds % 60}s`;
    } else {
      uptime = `${seconds}s`;
    }
    
    statUptime.textContent = uptime;
  }, 1000);
}
