// State
let accounts = [];
let selectedAccountId = null;
let currentTab = 'overview';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadAccounts();
  setupEventListeners();
});

function setupEventListeners() {
  // Listen for updates from main process
  window.electronAPI.onMessage((data) => {
    if (selectedAccountId === data.accountId) {
      renderMessages();
    }
  });
  
  window.electronAPI.onStatus((data) => {
    updateAccountStatus(data.accountId, data);
    if (selectedAccountId === data.accountId) {
      renderContent();
    }
  });
  
  window.electronAPI.onError((data) => {
    console.error('Error:', data);
    alert(`Error: ${data.error}`);
  });
}

// ============== Account Management ==============

async function loadAccounts() {
  accounts = await window.electronAPI.getAccounts();
  renderAccountsList();
  
  if (accounts.length > 0 && !selectedAccountId) {
    selectAccount(accounts[0].id);
  }
}

function renderAccountsList() {
  const container = document.getElementById('accountsList');
  
  if (accounts.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #666;">
        <p>No accounts yet</p>
        <p style="font-size: 12px; margin-top: 8px;">Click below to add one</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = accounts.map(acc => `
    <div class="account-item ${acc.id === selectedAccountId ? 'active' : ''}" onclick="selectAccount('${acc.id}')">
      <div class="account-header">
        <span class="account-name">${acc.name}</span>
        <span class="account-status ${acc.connected ? 'connected' : 'disconnected'}">
          ${acc.connected ? 'Connected' : 'Offline'}
        </span>
      </div>
      ${acc.phone ? `<div class="account-phone">${acc.phone}</div>` : ''}
    </div>
  `).join('');
}

async function selectAccount(id) {
  selectedAccountId = id;
  renderAccountsList();
  renderContent();
}

function updateAccountStatus(accountId, status) {
  const acc = accounts.find(a => a.id === accountId);
  if (acc) {
    acc.connected = status.connected;
  }
  renderAccountsList();
}

// ============== Modal Management ==============

function showAddAccountModal() {
  document.getElementById('addAccountModal').classList.add('active');
  document.getElementById('newAccountName').value = '';
  document.getElementById('newApiId').value = '';
  document.getElementById('newApiHash').value = '';
  document.getElementById('newPhone').value = '';
}

function hideAddAccountModal() {
  document.getElementById('addAccountModal').classList.remove('active');
}

function showLoginModal(needCode = false) {
  document.getElementById('loginModal').classList.add('active');
  document.getElementById('phoneStep').style.display = needCode ? 'none' : 'block';
  document.getElementById('codeStep').style.display = needCode ? 'block' : 'none';
  document.getElementById('loginTitle').textContent = needCode ? 'Enter Code' : 'Login to Telegram';
}

function hideLoginModal() {
  document.getElementById('loginModal').classList.remove('active');
}

// ============== Account Actions ==============

async function addAccount() {
  const name = document.getElementById('newAccountName').value.trim();
  const apiId = document.getElementById('newApiId').value.trim();
  const apiHash = document.getElementById('newApiHash').value.trim();
  const phone = document.getElementById('newPhone').value.trim();
  
  if (!name || !apiId || !apiHash) {
    alert('Please fill in name, API ID, and API Hash');
    return;
  }
  
  const result = await window.electronAPI.addAccount({ name, apiId, apiHash, phone });
  
  if (result.success) {
    hideAddAccountModal();
    await loadAccounts();
    selectAccount(result.account.id);
  } else {
    alert('Failed to add account');
  }
}

async function deleteAccount() {
  if (!selectedAccountId) return;
  
  if (!confirm('Are you sure you want to delete this account?')) return;
  
  await window.electronAPI.deleteAccount({ id: selectedAccountId });
  selectedAccountId = null;
  await loadAccounts();
}

async function connectAccount() {
  if (!selectedAccountId) return;
  
  const result = await window.electronAPI.connectAccount(selectedAccountId);
  
  if (result.needLogin) {
    showLoginModal(false);
  } else if (!result.success) {
    alert('Failed to connect: ' + result.error);
  } else {
    await loadAccounts();
    renderContent();
  }
}

async function disconnectAccount() {
  if (!selectedAccountId) return;
  await window.electronAPI.disconnectAccount(selectedAccountId);
  await loadAccounts();
  renderContent();
}

async function sendLoginPhone() {
  const phone = document.getElementById('loginPhone').value.trim();
  if (!phone) {
    alert('Please enter your phone number');
    return;
  }
  
  const result = await window.electronAPI.sendPhone(selectedAccountId, phone);
  
  if (result.success) {
    showLoginModal(true);
  } else {
    alert('Failed to send code: ' + result.error);
  }
}

async function verifyLoginCode() {
  const code = document.getElementById('loginCode').value.trim();
  if (!code) {
    alert('Please enter the verification code');
    return;
  }
  
  const result = await window.electronAPI.verifyCode(selectedAccountId, code);
  
  if (result.success) {
    hideLoginModal();
    await loadAccounts();
    renderContent();
  } else {
    alert('Failed to verify: ' + result.error);
  }
}

// ============== Content Rendering ==============

function renderContent() {
  const container = document.getElementById('mainContent');
  const account = accounts.find(a => a.id === selectedAccountId);
  
  if (!account) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📱</div>
        <div class="empty-title">No Account Selected</div>
        <div class="empty-desc">Add a Telegram account to get started</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="content-header">
      <h1 class="content-title">${account.name}</h1>
      <div class="content-actions">
        ${account.connected 
          ? '<button class="btn btn-danger" onclick="disconnectAccount()">Disconnect</button>'
          : '<button class="btn btn-success" onclick="connectAccount()">Connect</button>'
        }
        <button class="btn btn-secondary" onclick="deleteAccount()">Delete</button>
      </div>
    </div>
    
    <div class="content-body">
      ${renderTabs()}
      ${renderTabContent()}
    </div>
  `;
}

function renderTabs() {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tools', label: 'Tools' },
    { id: 'ai', label: 'AI Settings' },
    { id: 'messages', label: 'Messages' }
  ];
  
  return `
    <div class="tabs">
      ${tabs.map(t => `
        <button class="tab ${t.id === currentTab ? 'active' : ''}" onclick="setTab('${t.id}')">
          ${t.label}
        </button>
      `).join('')}
    </div>
  `;
}

function setTab(tab) {
  currentTab = tab;
  renderContent();
}

function renderTabContent() {
  const account = accounts.find(a => a.id === selectedAccountId);
  
  switch (currentTab) {
    case 'overview': return renderOverview(account);
    case 'tools': return renderTools(account);
    case 'ai': return renderAISettings(account);
    case 'messages': return renderMessages();
    default: return '';
  }
}

function renderOverview(account) {
  return `
    <div class="card">
      <h3 class="card-title">Connection Status</h3>
      <div class="card-grid">
        <div class="stat-card">
          <div class="stat-value">${account.connected ? '✓' : '✗'}</div>
          <div class="stat-label">${account.connected ? 'Connected' : 'Disconnected'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${account.aiProvider?.toUpperCase() || 'GLM'}</div>
          <div class="stat-label">AI Provider</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${account.tools?.autoRespond ? 'ON' : 'OFF'}</div>
          <div class="stat-label">Auto-Respond</div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h3 class="card-title">API Credentials</h3>
      <div class="form-group">
        <label>API ID</label>
        <input type="text" value="${account.apiId}" readonly>
      </div>
      <div class="form-group">
        <label>API Hash</label>
        <input type="password" value="${account.apiHash}" readonly>
      </div>
    </div>
  `;
}

function renderTools(account) {
  const tools = account.tools || {};
  
  return `
    <div class="card">
      <h3 class="card-title">Tool Controls</h3>
      
      <div class="toggle-row">
        <div>
          <div class="toggle-label">Auto-Respond</div>
          <div class="toggle-desc">Automatically respond to incoming messages</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${tools.autoRespond ? 'checked' : ''} onchange="toggleTool('autoRespond', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
      
      <div class="toggle-row">
        <div>
          <div class="toggle-label">Schedule Wakeup</div>
          <div class="toggle-desc">Wake up at scheduled time to process messages</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${tools.scheduleWakeup ? 'checked' : ''} onchange="toggleTool('scheduleWakeup', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    
    <div class="card">
      <h3 class="card-title">Wakeup Schedule</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Wakeup Time</label>
          <input type="time" id="wakeupTime" value="${tools.wakeupTime || '09:00'}" onchange="updateWakeupTime()">
        </div>
        <div class="form-group">
          <label>Check Interval (minutes)</label>
          <input type="number" id="wakeupInterval" value="${tools.wakeupInterval || 5}" min="1" max="60" onchange="updateWakeupTime()">
        </div>
      </div>
    </div>
  `;
}

function renderAISettings(account) {
  const providers = [
    { id: 'glm', name: 'GLM', desc: 'Zhipu AI' },
    { id: 'openai', name: 'OpenAI', desc: 'GPT Models' },
    { id: 'custom', name: 'Custom', desc: 'Your API' }
  ];
  
  return `
    <div class="card">
      <h3 class="card-title">AI Provider</h3>
      <div class="ai-provider-grid">
        ${providers.map(p => `
          <div class="ai-provider-option ${account.aiProvider === p.id ? 'selected' : ''}" onclick="selectAIProvider('${p.id}')">
            <div class="ai-provider-name">${p.name}</div>
            <div class="ai-provider-desc">${p.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="card">
      <h3 class="card-title">API Configuration</h3>
      <div class="form-group">
        <label>Base URL</label>
        <input type="text" id="aiBaseUrl" value="${account.aiBaseUrl || ''}" placeholder="https://api.openai.com/v1">
      </div>
      <div class="form-group">
        <label>API Key</label>
        <input type="password" id="aiApiKey" value="${account.aiApiKey || ''}" placeholder="sk-...">
      </div>
      <div class="form-group">
        <label>Model</label>
        <input type="text" id="aiModel" value="${account.aiModel || 'glm-4'}" placeholder="glm-4, gpt-4, etc.">
      </div>
      <button class="btn btn-primary" onclick="saveAIConfig()">Save AI Configuration</button>
    </div>
    
    <div class="card">
      <h3 class="card-title">System Prompt</h3>
      <div class="form-group">
        <label>How AI should respond to messages</label>
        <textarea id="systemPrompt" placeholder="You are a helpful assistant...">${account.systemPrompt || ''}</textarea>
      </div>
      <button class="btn btn-primary" onclick="saveSystemPrompt()">Save Prompt</button>
    </div>
  `;
}

async function renderMessages() {
  if (!selectedAccountId) return '<div class="card"><p>No account selected</p></div>';
  
  const messages = await window.electronAPI.getMessages(selectedAccountId, 50);
  
  if (!messages || messages.length === 0) {
    return `
      <div class="card">
        <h3 class="card-title">Messages</h3>
        <p style="color: #666; text-align: center; padding: 40px;">
          No messages yet. Connect to start receiving messages.
        </p>
      </div>
    `;
  }
  
  return `
    <div class="card">
      <h3 class="card-title">Recent Messages</h3>
      <div class="messages-list">
        ${messages.map(msg => `
          <div class="message-item">
            <div class="message-header">
              <span class="message-from">${msg.isOut ? '→ ' + msg.chatName : msg.from}</span>
              <span class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="message-text">${msg.text}</div>
            ${msg.aiResponse ? `
              <div class="ai-response">
                <div class="ai-response-label">AI Response:</div>
                <div class="message-text">${msg.aiResponse}</div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============== Tool Actions ==============

async function toggleTool(tool, enabled) {
  await window.electronAPI.toggleTool(selectedAccountId, tool, enabled);
}

async function updateWakeupTime() {
  const time = document.getElementById('wakeupTime').value;
  const interval = parseInt(document.getElementById('wakeupInterval').value);
  await window.electronAPI.setWakeupTime(selectedAccountId, time, interval);
}

// ============== AI Actions ==============

async function selectAIProvider(provider) {
  const defaults = {
    glm: { baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4' },
    openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4' },
    custom: { baseUrl: '', model: '' }
  };
  
  const def = defaults[provider] || defaults.glm;
  
  await window.electronAPI.updateAIConfig(selectedAccountId, {
    aiProvider: provider,
    aiBaseUrl: def.baseUrl,
    aiModel: def.model
  });
  
  renderContent();
}

async function saveAIConfig() {
  const baseUrl = document.getElementById('aiBaseUrl').value;
  const apiKey = document.getElementById('aiApiKey').value;
  const model = document.getElementById('aiModel').value;
  
  await window.electronAPI.updateAIConfig(selectedAccountId, {
    aiBaseUrl: baseUrl,
    aiApiKey: apiKey,
    aiModel: model
  });
  
  alert('AI configuration saved!');
}

async function saveSystemPrompt() {
  const prompt = document.getElementById('systemPrompt').value;
  await window.electronAPI.updateSystemPrompt(selectedAccountId, prompt);
  alert('System prompt saved!');
}
