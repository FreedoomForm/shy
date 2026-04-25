# Telegram MCP Manager

Complete desktop application for managing multiple Telegram accounts with AI auto-respond capabilities.

## Features

### 📱 Multi-Account Management
- Add unlimited Telegram accounts
- Monitor all accounts from one dashboard
- Individual settings per account

### 🤖 AI Integration
- **GLM-4** (default) - Zhipu AI
- **OpenAI** - GPT models
- **Custom** - Any OpenAI-compatible API
- Configure base URL and API key
- Customize system prompt per account

### ⚙️ Tool Controls
- **Auto-Respond** - Toggle on/off
- **Schedule Wakeup** - Set time for AI to process unread messages
- Check interval configuration

### 📊 Monitoring
- View all messages per account
- See AI responses for each message
- Track connected status

## Installation

1. Download `Telegram MCP Manager Setup.exe`
2. Run the installer
3. Launch from Start Menu

## Setup

### 1. Get Telegram API Credentials
1. Go to https://my.telegram.org
2. Login with your phone number
3. Go to "API development tools"
4. Create a new application
5. Copy API ID and API Hash

### 2. Add Account
1. Click "Add Account"
2. Enter account name (any name you want)
3. Enter API ID and API Hash
4. Click "Add"

### 3. Connect & Login
1. Select the account
2. Click "Connect"
3. Enter phone number when prompted
4. Enter verification code from Telegram

### 4. Configure AI
1. Go to "AI Settings" tab
2. Select AI provider (GLM, OpenAI, or Custom)
3. Enter API key
4. Customize system prompt
5. Save configuration

### 5. Enable Tools
1. Go to "Tools" tab
2. Toggle "Auto-Respond" to enable AI responses
3. Optionally enable "Schedule Wakeup"

## Configuration

### AI Providers

| Provider | Base URL | Models |
|----------|----------|--------|
| GLM | https://open.bigmodel.cn/api/paas/v4 | glm-4, glm-4-flash |
| OpenAI | https://api.openai.com/v1 | gpt-4, gpt-3.5-turbo |
| Custom | Your URL | Any model |

### System Prompt Examples

**Professional Assistant:**
```
You are a professional assistant. Respond politely and concisely. 
Help users with their queries in a professional manner.
```

**Friendly Helper:**
```
You are a friendly and helpful assistant. Be casual but helpful.
Use emojis occasionally to make responses more engaging.
```

**Business Bot:**
```
You represent a business. Be professional and informative.
Direct users to contact support for complex issues.
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Telegram MCP Manager (EXE)                 │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Account 1  │  │  Account 2  │  │  Account N  │    │
│  │             │  │             │  │             │    │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │    │
│  │ │Telegram │ │  │ │Telegram │ │  │ │Telegram │ │    │
│  │ │ Client  │ │  │ │ Client  │ │  │ │ Client  │ │    │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │    │
│  │      ↓      │  │      ↓      │  │      ↓      │    │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │    │
│  │ │   AI    │ │  │ │   AI    │ │  │ │   AI    │ │    │
│  │ │ Engine  │ │  │ │ Engine  │ │  │ │ Engine  │ │    │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Dashboard UI                        │   │
│  │  - Account list  - Tool controls                │   │
│  │  - Messages      - AI settings                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Building from Source

```bash
# Clone
git clone https://github.com/FreedoomForm/shy.git
cd shy

# Install
npm install

# Run dev
npm start

# Build EXE
npm run build:win
```

## Security

- API credentials stored encrypted locally
- Session data stored in user directory
- No data sent to external servers (except AI API)
- All AI communication uses HTTPS

## Troubleshooting

### "Connection Failed"
- Check internet connection
- Verify API credentials are correct
- Try using a VPN if Telegram is blocked

### "AI Not Responding"
- Verify API key is correct
- Check base URL for your provider
- Ensure AI provider is accessible

### "Code Not Received"
- Make sure phone number has country code
- Check if you already have an active session
- Try logging out from other Telegram clients

## License

MIT
