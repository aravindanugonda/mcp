import { IpcMainInvokeEvent, ipcMain, WebContents } from 'electron';
import net from 'net';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// MCP Server/Client interfaces and extensible host logic
interface MCPServerInfo {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol?: 'tcp' | 'http'; // Optional: default to tcp
}

const SERVER_LIST_PATH = path.join(__dirname, '../../mcp-server-list.json');

function loadServers(): MCPServerInfo[] {
  try {
    const data = fs.readFileSync(SERVER_LIST_PATH, 'utf-8');
    return JSON.parse(data) as MCPServerInfo[];
  } catch (err) {
    return [];
  }
}

function saveServers(servers: MCPServerInfo[]) {
  fs.writeFileSync(SERVER_LIST_PATH, JSON.stringify(servers, null, 2), 'utf-8');
}

class MCPClient {
  private socket: net.Socket | null = null;
  constructor(public server: MCPServerInfo) {}

  connect(): Promise<void> {
    if (this.server.protocol === 'http') {
      // No persistent connection needed for HTTP
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection({ host: this.server.host, port: this.server.port }, resolve);
      this.socket.on('error', reject);
    });
  }

  async sendMessage(message: string): Promise<string> {
    if (this.server.protocol === 'http') {
      // HTTP POST to /mcp/message
      const url = `http://${this.server.host}:${this.server.port}/mcp/message`;
      try {
        const res = await axios.post(url, { message });
        const data = res.data as { reply?: string };
        return data.reply || '';
      } catch (err: any) {
        throw new Error(err.response?.data?.error || err.message);
      }
    }
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Not connected'));
      this.socket.write(message + '\n');
      this.socket.once('data', (data) => resolve(data.toString()));
      this.socket.once('error', reject);
    });
  }

  disconnect() {
    if (this.server.protocol === 'http') return;
    this.socket?.end();
    this.socket = null;
  }
}

let connectedClient: MCPClient | null = null;

// IPC handlers for dynamic server management
ipcMain.handle('mcp:getServers', async () => loadServers());
ipcMain.handle('mcp:addServer', async (_event: IpcMainInvokeEvent, server: MCPServerInfo) => {
  const servers = loadServers();
  if (servers.find((s) => s.id === server.id)) {
    return { error: 'Server ID already exists' };
  }
  servers.push(server);
  saveServers(servers);
  return { success: true };
});
ipcMain.handle('mcp:removeServer', async (_event: IpcMainInvokeEvent, serverId: string) => {
  let servers = loadServers();
  servers = servers.filter((s) => s.id !== serverId);
  saveServers(servers);
  return { success: true };
});
ipcMain.handle('mcp:updateServer', async (_event: IpcMainInvokeEvent, server: MCPServerInfo) => {
  let servers = loadServers();
  const idx = servers.findIndex((s) => s.id === server.id);
  if (idx === -1) return { error: 'Server not found' };
  servers[idx] = server;
  saveServers(servers);
  return { success: true };
});
ipcMain.handle('mcp:connectServer', async (_event: IpcMainInvokeEvent, serverId: string) => {
  const servers = loadServers();
  const server = servers.find((s) => s.id === serverId);
  if (!server) return { error: 'Server not found' };
  if (connectedClient) connectedClient.disconnect();
  connectedClient = new MCPClient(server);
  try {
    await connectedClient.connect();
    return { success: true, serverId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    connectedClient = null;
    return { error: 'Failed to connect: ' + msg };
  }
});
ipcMain.handle('mcp:sendMessage', async (event: IpcMainInvokeEvent, message: string) => {
  if (!connectedClient) return { error: 'No MCP server connected.' };
  try {
    const response = await connectedClient.sendMessage(message);
    // Send response back to renderer
    const webContents: WebContents = event.sender;
    webContents.send('mcp:message', {
      sender: 'system',
      content: response,
      timestamp: new Date().toLocaleTimeString(),
    });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: 'Failed to send message: ' + msg };
  }
});
