# MCP Desktop App

This project demonstrates a modular Model Context Protocol (MCP) architecture with clear separation of MCP Host, MCP Client, and MCP Server components. It features:

- **Electron-based MCP Client**: Desktop chat UI that can connect to multiple MCP servers (TCP or HTTP/LLM).
- **Node.js/TypeScript MCP Host**: HTTP server that connects to OpenAI LLM and exposes a simple MCP-compatible API.
- **MCP Server List**: Easily add, edit, and connect to different MCP servers (including Context7 and LLM Host).

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- OpenAI API key (for LLM Host)

### Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Create a `.env` file** in `mcp-desktop-app/`:
   ```env
   OPENAI_API_KEY=sk-...
   MCP_HOST_PORT=5005
   ```
3. **Start the LLM Host (OpenAI backend):**
   ```bash
   npx ts-node src/mcp/llmHost.ts
   ```
4. **Start the Electron app:**
   ```bash
   npm start
   ```

### MCP Server List Example
Edit `mcp-server-list.json` to add servers:
```json
[
  {
    "id": "context7",
    "name": "Context7 MCP",
    "host": "localhost",
    "port": 8080
  },
  {
    "id": "openai-llm",
    "name": "OpenAI LLM Host",
    "host": "localhost",
    "port": 5005,
    "protocol": "http"
  }
]
```

## Security
- **Never commit your `.env` file or API keys.**
- The `.gitignore` is set to exclude `.env`.

## License
MIT
