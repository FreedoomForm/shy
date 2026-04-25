const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Set ffmpeg path for telegram - simplified approach
function getFfmpegPath() {
  // For packaged app, check resources
  if (process.resourcesPath) {
    const resourcesFfmpeg = path.join(process.resourcesPath, 'ffmpeg.exe');
    if (fs.existsSync(resourcesFfmpeg)) {
      return resourcesFfmpeg;
    }
  }
  
  // Fallback to system PATH - user needs ffmpeg installed
  return 'ffmpeg';
}

const ffmpegPath = getFfmpegPath();
console.log('Using ffmpeg at:', ffmpegPath);
process.env.FFMPEG_PATH = ffmpegPath;

class MCPServer {
  constructor(options) {
    this.accountId = options.accountId;
    this.apiId = parseInt(options.apiId);
    this.apiHash = options.apiHash;
    this.systemPrompt = options.systemPrompt || 'You are a helpful Telegram assistant. Respond to messages politely and helpfully.';
    
    // AI Configuration
    this.aiProvider = options.aiProvider || 'mistral';
    this.aiBaseUrl = options.aiBaseUrl || 'https://api.mistral.ai/v1';
    this.aiApiKey = options.aiApiKey || '';
    this.aiModel = options.aiModel || 'mistral-large-latest';
    
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
    this.me = null;
    
    this.loadSession();
  }

  loadSession() {
    try {
      if (fs.existsSync(this.sessionPath)) {
        const sessionString = fs.readFileSync(this.sessionPath, 'utf8').trim();
        if (sessionString) {
          this.stringSession = new StringSession(sessionString);
          console.log('Session loaded from file');
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
      console.log('Session saved');
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  updateConfig(config) {
    if (config.systemPrompt !== undefined) this.systemPrompt = config.systemPrompt;
    if (config.aiProvider !== undefined) this.aiProvider = config.aiProvider;
    if (config.aiBaseUrl !== undefined) this.aiBaseUrl = config.aiBaseUrl;
    if (config.aiApiKey !== undefined) this.aiApiKey = config.aiApiKey;
    if (config.aiModel !== undefined) this.aiModel = config.aiModel;
    console.log('Config updated:', { provider: this.aiProvider, model: this.aiModel });
  }

  updateTools(tools) {
    this.tools = { ...this.tools, ...tools };
    console.log('Tools updated:', this.tools);
    
    // Handle wakeup scheduling
    if (tools.scheduleWakeup !== undefined) {
      if (tools.scheduleWakeup) {
        this.setupWakeupTimer();
      } else {
        this.clearWakeupTimer();
      }
    }
  }

  setupWakeupTimer() {
    this.clearWakeupTimer();
    
    if (!this.tools.scheduleWakeup) return;
    
    const [hours, minutes] = (this.tools.wakeupTime || '09:00').split(':').map(Number);
    const now = new Date();
    const wakeupDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    
    if (wakeupDate <= now) {
      wakeupDate.setDate(wakeupDate.getDate() + 1);
    }
    
    const delay = wakeupDate - now;
    
    this.wakeupTimer = setTimeout(async () => {
      console.log('Wakeup timer triggered');
      await this.processUnreadMessages();
      this.setupWakeupTimer(); // Schedule next
    }, delay);
    
    console.log(`Wakeup scheduled for ${this.tools.wakeupTime} (in ${Math.round(delay/60000)} minutes)`);
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
      useWSS: false,
      autoReconnect: true
    });

    try {
      console.log('Connecting to Telegram...');
      await this.client.connect();
      console.log('Connected to Telegram server');
      
      if (!await this.client.isUserAuthorized()) {
        this.onStatus({ connected: false, message: 'Login required', needLogin: true });
        return { needLogin: true };
      }

      this.isConnected = true;
      this.stats.startTime = Date.now();
      this.saveSession();
      
      // Get current user info
      this.me = await this.client.getMe();
      console.log('Logged in as:', this.me.firstName || this.me.username);
      
      // Set up message handler with proper filter
      this.client.addEventHandler(
        this.handleNewMessage.bind(this), 
        new NewMessage({ incoming: true, outgoing: false })
      );
      console.log('Message handler registered');
      
      // Load chats
      await this.loadChats();
      
      // Setup wakeup timer if enabled
      if (this.tools.scheduleWakeup) {
        this.setupWakeupTimer();
      }
      
      this.onStatus({ 
        connected: true, 
        message: `Connected as ${this.me.firstName || this.me.username}`,
        user: { name: this.me.firstName, username: this.me.username }
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Connection error:', error);
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
        console.log('Disconnected from Telegram');
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
      console.log(`Loaded ${this.chats.length} chats`);
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
      console.error('Send code error:', error);
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
      this.client.addEventHandler(
        this.handleNewMessage.bind(this), 
        new NewMessage({ incoming: true, outgoing: false })
      );
      
      // Load chats
      await this.loadChats();
      
      this.me = await this.client.getMe();
      this.onStatus({ 
        connected: true, 
        message: `Connected as ${this.me.firstName || this.me.username}`,
        user: { name: this.me.firstName, username: this.me.username }
      });
      
      return { success: true, user: { name: this.me.firstName, username: this.me.username } };
      
    } catch (error) {
      console.error('Verify code error:', error);
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
      
      console.log('Received message event:', {
        id: message.id,
        out: message.out,
        hasText: !!(message.message || message.text)
      });
      
      // Skip outgoing messages
      if (message.out) return;
      
      // Skip empty messages
      if (!message.message && !message.text) return;

      const sender = await message.getSender();
      const chat = await message.getChat();

      // Get proper chat ID
      const chatId = chat?.id || message.chatId || message.peerId;
      
      const msgData = {
        id: message.id?.toString(),
        chatId: chatId?.toString(),
        chatName: chat?.title || chat?.firstName || chat?.username || 'Unknown',
        from: sender?.firstName || sender?.username || 'Unknown',
        fromId: sender?.id?.toString(),
        text: message.message || message.text || '',
        timestamp: Date.now(),
        date: new Date().toISOString(),
        isOut: false,
        aiResponse: null
      };

      console.log('Processed message:', {
        from: msgData.from,
        chat: msgData.chatName,
        text: msgData.text.substring(0, 50) + '...'
      });

      this.messages.push(msgData);
      this.stats.messagesReceived++;
      
      // Keep only last 1000 messages
      if (this.messages.length > 1000) {
        this.messages = this.messages.slice(-1000);
      }

      this.onMessage(msgData);

      // Auto-respond if enabled
      if (this.tools.autoRespond) {
        console.log('Auto-respond enabled, generating response...');
        await this.generateAndSendResponse(msgData);
      }

    } catch (error) {
      console.error('Error handling message:', error);
      this.onError(error.message);
    }
  }

  async processUnreadMessages() {
    try {
      this.onStatus({ connected: true, message: 'Processing unread messages...' });
      
      for (const chat of this.chats) {
        if (chat.unread > 0) {
          console.log(`Processing ${chat.unread} unread messages from ${chat.name}`);
          
          const messages = await this.client.getMessages(chat.id, { 
            limit: chat.unread
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
      
      console.log('Calling AI API with:', {
        provider: this.aiProvider,
        model: this.aiModel,
        baseUrl: this.aiBaseUrl,
        hasApiKey: !!this.aiApiKey
      });
      
      // Use unified API call for all providers
      const aiResponse = await this.callAI(msgData.text);
      
      console.log('AI response received:', aiResponse ? aiResponse.substring(0, 50) + '...' : 'null');

      if (aiResponse && this.client && this.isConnected) {
        // Convert chatId to proper BigInt format for Telegram
        let targetChatId = msgData.chatId;
        
        // Handle different chat ID formats
        if (typeof targetChatId === 'string') {
          // Remove any non-numeric characters except minus sign
          const cleanId = targetChatId.replace(/[^0-9-]/g, '');
          if (cleanId) {
            targetChatId = BigInt(cleanId);
          }
        }
        
        console.log('Sending message to chat:', targetChatId.toString());
        
        // Send response
        await this.client.sendMessage(targetChatId, { message: aiResponse });
        
        this.stats.messagesSent++;
        this.stats.aiResponses++;
        
        console.log('Message sent successfully');
        
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
        this.onStatus({ connected: true, message: 'Connected' });
      } else {
        console.log('Cannot send message: aiResponse=', !!aiResponse, 'client=', !!this.client, 'connected=', this.isConnected);
        this.onStatus({ connected: true, message: 'AI returned empty response' });
      }
      
    } catch (error) {
      console.error('Error generating/sending response:', error);
      this.onStatus({ connected: true, message: `Error: ${error.message}` });
      this.onError(error.message);
    }
  }

  // Unified AI API call - works with all OpenAI-compatible providers
  async callAI(text) {
    try {
      if (!this.aiApiKey) {
        throw new Error('AI API key not configured. Please set your API key in AI Settings.');
      }
      
      if (!this.aiBaseUrl) {
        throw new Error('AI Base URL not configured. Please set it in AI Settings.');
      }
      
      const url = `${this.aiBaseUrl}/chat/completions`;
      console.log('Calling AI API:', url);
      
      const requestBody = {
        model: this.aiModel,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: text }
        ],
        max_tokens: 500,
        temperature: 0.7
      };
      
      const response = await axios.post(url, requestBody, {
        headers: {
          'Authorization': `Bearer ${this.aiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const content = response.data?.choices?.[0]?.message?.content;
      
      if (!content) {
        console.error('Unexpected AI response format:', response.data);
        throw new Error('Invalid AI response format');
      }
      
      return content.trim();
      
    } catch (error) {
      console.error('AI API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  getStats() {
    return {
      ...this.stats,
      uptime: this.stats.startTime ? Date.now() - this.stats.startTime : 0
    };
  }
}

module.exports = MCPServer;
