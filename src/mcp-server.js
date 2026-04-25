const express = require('express');
const cors = require('cors');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const input = require('input');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const os = require('os');

class MCPServer {
  constructor(options) {
    this.port = options.port || 9876;
    this.apiId = options.apiId;
    this.apiHash = options.apiHash;
    this.systemPrompt = options.systemPrompt || 'You are a helpful assistant.';
    this.onMessage = options.onMessage || (() => {});
    this.onStatus = options.onStatus || (() => {});
    this.onError = options.onError || (() => {});

    this.app = express();
    this.server = null;
    this.client = null;
    this.stringSession = new StringSession('');
    this.pendingPhoneAuth = null;
    this.isConnected = false;
    this.sessionPath = path.join(os.homedir(), '.telegram-mcp', 'session.txt');
    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      startTime: null
    };

    this.setupMiddleware();
    this.setupRoutes();
    this.loadSession();
  }

  setupMiddleware() {
    this.app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    this.app.use(express.json());
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        connected: this.isConnected,
        uptime: this.stats.startTime ? Date.now() - this.stats.startTime : 0,
        stats: this.stats
      });
    });

    // Status endpoint
    this.app.get('/status', (req, res) => {
      res.json({
        connected: this.isConnected,
        stats: this.stats,
        uptime: this.stats.startTime ? Date.now() - this.stats.startTime : 0
      });
    });

    // Start service
    this.app.post('/start', async (req, res) => {
      try {
        const { api_id, api_hash, system_prompt } = req.body;
        
        if (api_id) this.apiId = api_id;
        if (api_hash) this.apiHash = api_hash;
        if (system_prompt) this.systemPrompt = system_prompt;

        if (!this.apiId || !this.apiHash) {
          return res.json({ status: 'error', message: 'API credentials required' });
        }

        await this.connectTelegram();
        
        if (this.pendingPhoneAuth) {
          res.json({ status: 'phone_required' });
        } else {
          res.json({ status: 'started' });
        }
      } catch (error) {
        res.json({ status: 'error', message: error.message });
      }
    });

    // Stop service
    this.app.post('/stop', async (req, res) => {
      try {
        await this.disconnectTelegram();
        res.json({ status: 'stopped' });
      } catch (error) {
        res.json({ status: 'error', message: error.message });
      }
    });

    // Send phone number
    this.app.post('/send-phone', async (req, res) => {
      try {
        const { phone } = req.body;
        const result = await this.sendPhoneNumber(phone);
        res.json(result);
      } catch (error) {
        res.json({ status: 'error', message: error.message });
      }
    });

    // Verify code
    this.app.post('/verify-code', async (req, res) => {
      try {
        const { code, password } = req.body;
        const result = await this.verifyCode(code, password);
        res.json(result);
      } catch (error) {
        res.json({ status: 'error', message: error.message });
      }
    });

    // Get chats
    this.app.get('/chats', async (req, res) => {
      try {
        if (!this.client || !this.isConnected) {
          return res.json({ status: 'error', message: 'Not connected' });
        }

        const dialogs = await this.client.getDialogs({ limit: 50 });
        const chats = dialogs.map(d => ({
          id: d.id?.toString() || d.entity?.id?.toString(),
          name: d.name || d.title || 'Unknown',
          unread: d.unreadCount || 0,
          isUser: d.isUser,
          isGroup: d.isGroup,
          isChannel: d.isChannel
        }));
        res.json({ status: 'ok', chats });
      } catch (error) {
        res.json({ status: 'error', message: error.message });
      }
    });

    // Send message
    this.app.post('/send-message', async (req, res) => {
      try {
        const { chatId, message } = req.body;
        if (!this.client || !this.isConnected) {
          return res.json({ status: 'error', message: 'Not connected' });
        }

        await this.client.sendMessage(chatId, { message });
        this.stats.messagesSent++;
        res.json({ status: 'ok' });
      } catch (error) {
        res.json({ status: 'error', message: error.message });
      }
    });

    // Get messages
    this.app.get('/messages/:chatId', async (req, res) => {
      try {
        const { chatId } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        if (!this.client || !this.isConnected) {
          return res.json({ status: 'error', message: 'Not connected' });
        }

        const messages = await this.client.getMessages(chatId, { limit });
        const formatted = messages.map(m => ({
          id: m.id?.toString(),
          text: m.message || m.text || '',
          from: m.senderId?.toString(),
          date: m.date,
          isOut: m.out
        }));
        res.json({ status: 'ok', messages: formatted });
      } catch (error) {
        res.json({ status: 'error', message: error.message });
      }
    });
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

  async connectTelegram() {
    if (this.client && this.isConnected) {
      return;
    }

    this.onStatus({ message: 'Connecting to Telegram...', type: 'info' });

    this.client = new TelegramClient(this.stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
      useWSS: false,
      proxy: process.env.TELEGRAM_PROXY || null
    });

    await this.client.start({
      phoneNumber: async () => {
        this.pendingPhoneAuth = 'phone';
        this.onStatus({ message: 'Phone number required', type: 'warning' });
        throw new Error('Phone number required');
      },
      phoneCode: async () => {
        this.pendingPhoneAuth = 'code';
        this.onStatus({ message: 'Verification code required', type: 'warning' });
        throw new Error('Code required');
      },
      password: async () => {
        this.pendingPhoneAuth = 'password';
        this.onStatus({ message: '2FA password required', type: 'warning' });
        throw new Error('Password required');
      },
      onError: (err) => {
        this.onError(err.message);
      }
    });

    this.isConnected = true;
    this.stats.startTime = Date.now();
    this.saveSession();
    this.onStatus({ message: 'Connected to Telegram', type: 'success' });

    // Set up message handler
    this.client.addEventHandler(this.handleNewMessage.bind(this), new NewMessage({}));

    // Get user info
    const me = await this.client.getMe();
    this.onMessage({
      type: 'system',
      text: `Logged in as ${me.firstName || me.username || 'Unknown'}`,
      timestamp: Date.now()
    });
  }

  async disconnectTelegram() {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
    }
  }

  async sendPhoneNumber(phone) {
    if (!this.client) {
      return { status: 'error', message: 'Client not initialized' };
    }

    try {
      const result = await this.client.invoke({
        _: 'auth.sendCode',
        phoneNumber: phone,
        apiId: this.apiId,
        apiHash: this.apiHash,
        settings: { _: 'codeSettings' }
      });

      this.pendingPhoneAuth = 'code';
      this.phoneNumber = phone;
      this.phoneCodeHash = result.phoneCodeHash;

      return { status: 'code_sent', phone_code_hash: result.phoneCodeHash };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async verifyCode(code, password) {
    if (!this.client) {
      return { status: 'error', message: 'Client not initialized' };
    }

    try {
      if (this.pendingPhoneAuth === 'code') {
        await this.client.invoke({
          _: 'auth.signIn',
          phoneNumber: this.phoneNumber,
          phoneCodeHash: this.phoneCodeHash,
          phoneCode: code
        });

        this.pendingPhoneAuth = null;
        this.isConnected = true;
        this.stats.startTime = Date.now();
        this.saveSession();

        const me = await this.client.getMe();
        this.onStatus({ message: 'Connected to Telegram', type: 'success' });
        this.onMessage({
          type: 'system',
          text: `Logged in as ${me.firstName || me.username || 'Unknown'}`,
          timestamp: Date.now()
        });

        // Set up message handler
        this.client.addEventHandler(this.handleNewMessage.bind(this), new NewMessage({}));

        return { status: 'success', user: { name: me.firstName, username: me.username } };
      } else if (this.pendingPhoneAuth === 'password') {
        await this.client.invoke({
          _: 'auth.checkPassword',
          password: { _: 'inputCheckPasswordSRP', srpId: 0, A: Buffer.alloc(0), M1: Buffer.alloc(0) }
        });
        // Simplified - actual implementation needs proper SRP
        return { status: 'success' };
      }

      return { status: 'error', message: 'No pending verification' };
    } catch (error) {
      if (error.message.includes('SESSION_PASSWORD_NEEDED')) {
        this.pendingPhoneAuth = 'password';
        return { status: 'password_required' };
      }
      return { status: 'error', message: error.message };
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
        type: 'message',
        id: message.id?.toString(),
        chatId: chat?.id?.toString() || message.chatId?.toString(),
        chatName: chat?.title || chat?.firstName || chat?.username || 'Unknown',
        from: sender?.firstName || sender?.username || 'Unknown',
        fromId: sender?.id?.toString(),
        text: message.message || message.text || '',
        timestamp: message.date * 1000
      };

      this.stats.messagesReceived++;
      this.onMessage(msgData);

      // Auto-respond using AI
      await this.generateAndSendResponse(msgData);

    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async generateAndSendResponse(msgData) {
    try {
      // Call AI API to generate response
      const response = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        model: 'glm-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: msgData.text }
        ],
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.ZAI_API_KEY || ''}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data?.choices?.[0]?.message?.content;

      if (aiResponse && this.client && this.isConnected) {
        // Send response
        await this.client.sendMessage(msgData.chatId, { message: aiResponse });
        this.stats.messagesSent++;

        this.onMessage({
          type: 'response',
          chatId: msgData.chatId,
          chatName: msgData.chatName,
          text: aiResponse,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error generating response:', error);
      // Try fallback response
      try {
        const fallbackResponse = "I received your message! I'm currently having trouble connecting to my AI backend, but I'll respond properly once that's fixed.";
        await this.client.sendMessage(msgData.chatId, { message: fallbackResponse });
      } catch (e) {
        console.error('Failed to send fallback:', e);
      }
    }
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`MCP Server running on port ${this.port}`);
        this.onStatus({ message: `Server started on port ${this.port}`, type: 'success' });
        resolve();
      });

      this.server.on('error', (error) => {
        this.onError(error.message);
        reject(error);
      });
    });
  }

  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(async () => {
          await this.disconnectTelegram();
          this.onStatus({ message: 'Server stopped', type: 'warning' });
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = MCPServer;
