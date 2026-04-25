# Telegram MCP Local Server

Windows application that runs the MCP (Model Context Protocol) server locally on your computer and connects to a cloud-hosted frontend.

## Features

- 🖥️ **Local Server**: Runs entirely on your computer
- ☁️ **Cloud Frontend**: Connects to web frontend for remote access
- 🤖 **AI Auto-Responder**: Automatically responds to Telegram messages using GLM AI
- 🔐 **Secure Storage**: Credentials stored encrypted on your device
- 📊 **Dashboard UI**: Monitor messages, stats, and server status
- 🔄 **Auto-Start**: Option to start automatically on boot
- 📌 **System Tray**: Runs in background, accessible from tray

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR COMPUTER                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Telegram MCP Server (EXE)                  │ │
│  │                                                         │ │
│  │  ┌─────────────────┐    ┌─────────────────────────┐    │ │
│  │  │   Electron UI   │    │   MCP Backend Server    │    │ │
│  │  │   (Dashboard)   │◄──►│   - Telegram Client     │    │ │
│  │  │                 │    │   - AI Integration      │    │ │
│  │  │                 │    │   - Message Handler     │    │ │
│  │  └─────────────────┘    └─────────────────────────┘    │ │
│  │                                  │                      │ │
│  │                                  │ Tunnel Connection    │ │
│  └──────────────────────────────────┼──────────────────────┘ │
│                                     │                        │
└─────────────────────────────────────┼────────────────────────┘
                                      │
                                      ▼ WebSocket/HTTP
┌─────────────────────────────────────────────────────────────┐
│                    CLOUD FRONTEND                            │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Web Dashboard                           ││
│  │   - View messages                                        ││
│  │   - Configure settings                                   ││
│  │   - Monitor server status                                ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Tunnel Server                           ││
│  │   - Accept connections from local servers                ││
│  │   - Forward requests to connected servers                ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Installation

### Download EXE

1. Go to the [Releases](https://github.com/FreedoomForm/shy/releases) page
2. Download the latest installer or portable version
3. Run the installer (or portable EXE directly)
4. Launch the application

### Get Telegram API Credentials

1. Go to https://my.telegram.org
2. Log in with your phone number
3. Go to "API development tools"
4. Create a new application
5. Copy the `api_id` and `api_hash`

### Configure & Start

1. Open the application
2. Enter your Telegram API ID and Hash
3. Optionally customize the system prompt for AI responses
4. Click "Start Server"
5. Follow the prompts to log in to Telegram

## Building from Source

### Prerequisites

- Node.js 20+
- npm or yarn

### Build Steps

```bash
# Clone the repository
git clone https://github.com/FreedoomForm/shy.git
cd shy

# Install dependencies
npm install

# Run in development mode
npm start

# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux
```

## GitHub Actions

The project includes automatic EXE building via GitHub Actions:

- **On push to main**: Triggers a build
- **Manual dispatch**: Choose installer, portable, or all platforms
- **Automatic release**: Creates a GitHub release with the EXE

## Configuration

### Environment Variables

The application uses these environment variables (optional):

```env
ZAI_API_KEY=your_api_key_for_ai
TELEGRAM_PROXY=your_proxy_url  # Optional proxy
```

### Settings

Settings are stored in:
- Windows: `%APPDATA%/telegram-mcp-config.json`
- macOS: `~/Library/Application Support/telegram-mcp-config.json`
- Linux: `~/.config/telegram-mcp-config.json`

### Session Data

Telegram session is stored in:
- Windows: `%USERPROFILE%/.telegram-mcp/session.txt`
- macOS/Linux: `~/.telegram-mcp/session.txt`

## API Endpoints

The local server exposes these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/status` | GET | Server status and stats |
| `/start` | POST | Start the MCP service |
| `/stop` | POST | Stop the MCP service |
| `/send-phone` | POST | Send phone number for auth |
| `/verify-code` | POST | Verify authentication code |
| `/chats` | GET | Get list of chats |
| `/messages/:chatId` | GET | Get messages from a chat |
| `/send-message` | POST | Send a message |

## Troubleshooting

### "Failed to connect to Telegram"
- Check your internet connection
- Verify your API credentials are correct
- Try using a VPN if Telegram is blocked in your region

### "Port already in use"
- Close any other applications using port 9876
- Or change the port in the configuration

### "Session expired"
- Delete the session file and re-authenticate
- Session is stored in `~/.telegram-mcp/session.txt`

### AI not responding
- Check if the ZAI_API_KEY is set
- The app will fall back to a simple response if AI is unavailable

## Security Notes

- Your Telegram session is stored locally and encrypted
- API credentials are stored securely using electron-store with encryption
- The tunnel connection uses secure WebSocket
- No data is sent to third-party servers except:
  - Telegram API (for messaging)
  - AI API (for generating responses)

## License

MIT

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/FreedoomForm/shy/issues) page.
