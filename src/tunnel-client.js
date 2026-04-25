const { io } = require('socket.io-client');
const axios = require('axios');

class TunnelClient {
  constructor(options) {
    this.localPort = options.localPort || 9876;
    this.frontendUrl = options.frontendUrl || 'http://localhost:3000';
    this.onConnect = options.onConnect || (() => {});
    this.onDisconnect = options.onDisconnect || (() => {});
    this.onError = options.onError || (() => {});
    this.onData = options.onData || (() => {});

    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000;
    this.tunnelId = null;
    this.localUrl = `http://localhost:${this.localPort}`;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // Connect to the frontend tunnel server
        this.socket = io(`${this.frontendUrl}/tunnel`, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay
        });

        this.socket.on('connect', () => {
          console.log('Connected to frontend tunnel server');
          this.connected = true;
          this.reconnectAttempts = 0;

          // Register this tunnel
          this.socket.emit('register', {
            type: 'mcp-server',
            port: this.localPort,
            capabilities: ['telegram', 'ai-responder']
          });

          this.onConnect();
          resolve();
        });

        this.socket.on('tunnel-id', (id) => {
          this.tunnelId = id;
          console.log(`Tunnel ID: ${id}`);
        });

        this.socket.on('request', async (data) => {
          try {
            // Forward request to local MCP server
            const response = await this.forwardToLocal(data);
            this.socket.emit('response', {
              requestId: data.requestId,
              response: response
            });
          } catch (error) {
            this.socket.emit('response', {
              requestId: data.requestId,
              error: error.message
            });
          }
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from frontend tunnel server');
          this.connected = false;
          this.onDisconnect();
        });

        this.socket.on('error', (error) => {
          console.error('Tunnel error:', error);
          this.onError(error);
        });

        this.socket.on('reconnect_failed', () => {
          console.error('Failed to reconnect after maximum attempts');
          this.onError(new Error('Failed to reconnect to tunnel server'));
        });

      } catch (error) {
        this.onError(error);
        reject(error);
      }
    });
  }

  async forwardToLocal(data) {
    try {
      const { method, path, body, headers, query } = data;

      const url = new URL(path, this.localUrl);
      if (query) {
        Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
      }

      const config = {
        method: method || 'GET',
        url: url.toString(),
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        timeout: 30000
      };

      if (body && method !== 'GET') {
        config.data = body;
      }

      const response = await axios(config);
      return {
        status: response.status,
        data: response.data
      };

    } catch (error) {
      return {
        status: error.response?.status || 500,
        error: error.message,
        data: error.response?.data
      };
    }
  }

  async disconnect() {
    return new Promise((resolve) => {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.connected = false;
        this.onDisconnect();
      }
      resolve();
    });
  }

  isConnected() {
    return this.connected;
  }

  getTunnelId() {
    return this.tunnelId;
  }

  // Emit an event to the frontend
  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    }
  }
}

module.exports = TunnelClient;
