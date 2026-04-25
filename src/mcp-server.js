const express = require('express');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const os = require('os');

class MCPServer {
  constructor(options) {
    this.accountId = options.accountId;
    this.apiId = options.apiId;
    this.apiHash = options.apiHash;
    this.systemPrompt = options.systemPrompt || 'You are a helpful assistant.';
    
    // AI Configuration
    this.aiProvider = options.aiProvider || 'glm';
    this.aiBaseUrl = options.aiBaseUrl || 'https://open.bigmodel.cn/api/paas/v4';
    this.aiApiKey = options.aiApiKey || '';
    this.aiModel = options.aiModel || 'glm-4';
    
    // Tools
    this.tools = options.tools || {
      autoRespond: true,
      scheduleWakeup: false,
      wakeupTime: '09:00',
      wakeupInterval: 5
    };
    
    // Callbacks
    this.onMessage = options.onMessage || (() => {});
    this.onStatus = options.onStatus || (() => {});
    this.onError = options.onError || (() => {});
    
    // State
    this.client = null;
    this.stringSession = new StringSession('');
    this.isConnected = false;
    this.sessionPath = path.join(os.homedir(), '.telegram-mcp', `session_${this.accountId}.txt`);
    this.messages = [];
    this.chats = [];
    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      aiResponses: 0,
      startTime: null
    };
    this.wakeupTimer = null;
    
    this.loadSession();
  }

  loadSession() {
    try {
      if (fs.existsSync(this.sessionPath)) {
        const sessionString = fs.readFileSync(this.sessionPath, 'utf8').trim();
        if (sessionString) {
          this.stringSession = new StringSession(sessionString);
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  }

  saveSession() {
    try {
      const dir = path.dirname(this.sessionPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.sessionPath, this.stringSession.save());
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  updateConfig(config) {
    if (config.systemPrompt) this.systemPrompt = config.systemPrompt;
    if (config.aiProvider) this.aiProvider = config.aiProvider;
    if (config.aiBaseUrl) this.aiBaseUrl = config.aiBaseUrl;
    if (config.aiApiKey) this.aiApiKey = config.aiApiKey;
    if (config.aiModel) this.aiModel = config.aiModel;
  }

  updateTools(tools) {
    this.tools = { ...this.tools, ...tools };
    
    // Handle wakeup scheduling
    if (tools.scheduleWakeup) {
      this.setupWakeupTimer();
    } else {
      this.clearWakeupTimer();
    }
  }

  setupWakeupTimer() {
    this.clearWakeupTimer();
    
    if (!this.tools.scheduleWakeup) return;
    
    const [hours, minutes] = this.tools.wakeupTime.split(':').map(Number);
    const now = new Date();
    const wakeupDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    
    if (wakeupDate <= now) {
      wakeupDate.setDate(wakeupDate.getDate() + 1);
    }
    
    const delay = wakeupDate - now;
    
    this.wakeupTimer = setTimeout(async () => {
      await this.processUnreadMessages();
      this.setupWakeupTimer(); // Schedule next
    }, delay);
    
    this.onStatus({ 
      connected: true, 
      message: `Wakeup scheduled for ${this.tools.wakeupTime}` 
    });
  }

  clearWakeupTimer() {
    if (this.wakeupTimer) {
      clearTimeout(this.wakeupTimer);
      this.wakeupTimer = null;
    }
  }

  async start() {
    this.onStatus({ connected: false, message: 'Connecting to Telegram...' });

    this.client = new TelegramClient(this.stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
      useWSS: false
    });

    try {
      await this.client.connect();
      
      if (!await this.client.isUserAuthorized()) {
        this.onStatus({ connected: false, message: 'Login required', needLogin: true });
        return { needLogin: true };
      }

      this.isConnected = true;
      this.stats.startTime = Date.now();
      this.saveSession();
      
      // Set up message handler
      this.client.addEventHandler(this.handleNewMessage.bind(this), new NewMessage({}));
      
      // Load chats
      await this.loadChats();
      
      // Setup wakeup timer if enabled
      if (this.tools.scheduleWakeup) {
        this.setupWakeupTimer();
      }
      
      const me = await this.client.getMe();
      this.onStatus({ 
        connected: true, 
        message: `Connected as ${me.firstName || me.username}`,
        user: { name: me.firstName, username: me.username }
      });
      
      return { success: true };
      
    } catch (error) {
      this.onError(error.message);
      this.onStatus({ connected: false, message: `Error: ${error.message}` });
      throw error;
    }
  }

  async stop() {
    this.clearWakeupTimer();
    
    if (this.client) {
      try {
        await this.client.disconnect();
      } catch (e) {
        console.error('Disconnect error:', e);
      }
      this.client = null;
      this.isConnected = false;
    }
    
    this.onStatus({ connected: false, message: 'Disconnected' });
  }

  async loadChats() {
    try {
      const dialogs = await this.client.getDialogs({ limit: 50 });
      this.chats = dialogs.map(d => ({
        id: d.id?.toString() || d.entity?.id?.toString(),
        name: d.name || d.title || 'Unknown',
        unread: d.unreadCount || 0,
        isUser: d.isUser,
        isGroup: d.isGroup,
        isChannel: d.isChannel
      }));
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  }

  getChats() {
    return this.chats;
  }

  getMessages(limit = 100) {
    return this.messages.slice(-limit);
  }

  async sendPhoneNumber(phone) {
    try {
      const result = await this.client.invoke({
        _: 'auth.sendCode',
        phoneNumber: phone,
        apiId: this.apiId,
        apiHash: this.apiHash,
        settings: { _: 'codeSettings' }
      });

      this.phoneNumber = phone;
      this.phoneCodeHash = result.phoneCodeHash;
      
      this.onStatus({ connected: false, message: 'Code sent to Telegram', needCode: true });
      
      return { success: true, phoneCodeHash: result.phoneCodeHash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async verifyCode(code) {
    try {
      await this.client.invoke({
        _: 'auth.signIn',
        phoneNumber: this.phoneNumber,
        phoneCodeHash: this.phoneCodeHash,
        phoneCode: code
      });

      this.isConnected = true;
      this.stats.startTime = Date.now();
      this.saveSession();
      
      // Set up message handler
      this.client.addEventHandler(this.handleNewMessage.bind(this), new NewMessage({}));
      
      // Load chats
      await this.loadChats();
      
      const me = await this.client.getMe();
      this.onStatus({ 
        connected: true, 
        message: `Connected as ${me.firstName || me.username}`,
        user: { name: me.firstName, username: me.username }
      });
      
      return { success: true, user: { name: me.firstName, username: me.username } };
      
    } catch (error) {
      if (error.message.includes('SESSION_PASSWORD_NEEDED')) {
        this.onStatus({ connected: false, message: '2FA password required', needPassword: true });
        return { success: false, needPassword: true };
      }
      return { success: false, error: error.message };
    }
  }

  async handleNewMessage(event) {
    try {
      const message = event.message;
      
      // Skip outgoing messages
      if (message.out) return;
      
      // Skip empty messages
      if (!message.message && !message.text) return;

      const sender = await message.getSender();
      const chat = await message.getChat();

      const msgData = {
        id: message.id?.toString(),
        chatId: chat?.id?.toString() || message.chatId?.toString(),
        chatName: chat?.title || chat?.firstName || chat?.username || 'Unknown',
        from: sender?.firstName || sender?.username || 'Unknown',
        fromId: sender?.id?.toString(),
        text: message.message || message.text || '',
        timestamp: Date.now(),
        date: new Date().toISOString(),
        isOut: false,
        aiResponse: null
      };

      this.messages.push(msgData);
      this.stats.messagesReceived++;
      
      // Keep only last 1000 messages
      if (this.messages.length > 1000) {
        this.messages = this.messages.slice(-1000);
      }

      this.onMessage(msgData);

      // Auto-respond if enabled
      if (this.tools.autoRespond) {
        await this.generateAndSendResponse(msgData);
      }

    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async processUnreadMessages() {
    try {
      this.onStatus({ connected: true, message: 'Processing unread messages...' });
      
      for (const chat of this.chats) {
        if (chat.unread > 0) {
          const messages = await this.client.getMessages(chat.id, { 
            limit: chat.unread,
            filter: { _: 'inputMessagesFilterEmpty' }
          });
          
          for (const msg of messages) {
            if (!msg.out && msg.message) {
              const msgData = {
                id: msg.id?.toString(),
                chatId: chat.id,
                chatName: chat.name,
                from: 'Unknown',
                text: msg.message,
                timestamp: Date.now(),
                isOut: false
              };
              
              this.messages.push(msgData);
              this.stats.messagesReceived++;
              
              if (this.tools.autoRespond) {
                await this.generateAndSendResponse(msgData);
              }
            }
          }
        }
      }
      
      this.onStatus({ connected: true, message: 'Connected' });
      
    } catch (error) {
      console.error('Error processing unread messages:', error);
    }
  }

  async generateAndSendResponse(msgData) {
    try {
      this.onStatus({ connected: true, message: 'Generating AI response...' });
      
      let aiResponse;
      
      // Different AI providers
      if (this.aiProvider === 'glm') {
        aiResponse = await this.callGLMAPI(msgData.text);
      } else if (this.aiProvider === 'openai') {
        aiResponse = await this.callOpenAIAPI(msgData.text);
      } else if (this.aiProvider === 'custom') {
        aiResponse = await this.callCustomAPI(msgData.text);
      } else {
        aiResponse = await this.callGLMAPI(msgData.text);
      }

      if (aiResponse && this.client && this.isConnected) {
        // Send response
        await this.client.sendMessage(msgData.chatId, { message: aiResponse });
        
        this.stats.messagesSent++;
        this.stats.aiResponses++;
        
        // Record the AI response
        const responseMsgData = {
          id: Date.now().toString(),
          chatId: msgData.chatId,
          chatName: msgData.chatName,
          from: 'AI Assistant',
          text: aiResponse,
          timestamp: Date.now(),
          date: new Date().toISOString(),
          isOut: true,
          aiResponse: true,
          originalMessage: msgData.text
        };
        
        this.messages.push(responseMsgData);
        
        // Update original message with AI response
        msgData.aiResponse = aiResponse;
        
        this.onMessage(responseMsgData);
      }
      
      this.onStatus({ connected: true, message: 'Connected' });
      
    } catch (error) {
      console.error('Error generating response:', error);
      this.onStatus({ connected: true, message: `AI Error: ${error.message}` });
    }
  }

  async callGLMAPI(text) {
    const response = await axios.post(`${this.aiBaseUrl}/chat/completions`, {
      model: this.aiModel,
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: text }
      ],
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${this.aiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data?.choices?.[0]?.message?.content;
  }

  async callOpenAIAPI(text) {
    const response = await axios.post(`${this.aiBaseUrl}/chat/completions`, {
      model: this.aiModel,
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: text }
      ],
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${this.aiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data?.choices?.[0]?.message?.content;
  }

  async callCustomAPI(text) {
    const response = await axios.post(`${this.aiBaseUrl}/chat/completions`, {
      model: this.aiModel,
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: text }
      ],
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${this.aiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data?.choices?.[0]?.message?.content;
  }

  getStats() {
    return {
      ...this.stats,
      uptime: this.stats.startTime ? Date.now() - this.stats.startTime : 0
    };
  }
}

module.exports = MCPServer;
