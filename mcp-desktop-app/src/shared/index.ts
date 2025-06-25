// Add MCP API types for window object
export interface MCPServer {
  id: string;
  name: string;
  host: string;
  port: number;
}

export interface MCPAPI {
  sendMessage: (message: string) => Promise<any>;
  onMessage: (callback: (msg: any) => void) => void;
  getServers: () => Promise<MCPServer[]>;
  connectServer: (serverId: string) => Promise<any>;
  addServer: (server: MCPServer) => Promise<any>;
  removeServer: (serverId: string) => Promise<any>;
  updateServer: (server: MCPServer) => Promise<any>;
}

declare global {
  interface Window {
    mcpAPI: MCPAPI;
  }
}