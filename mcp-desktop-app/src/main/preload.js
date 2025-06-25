const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mcpAPI', {
  sendMessage: (message) => ipcRenderer.invoke('mcp:sendMessage', message),
  onMessage: (callback) => ipcRenderer.on('mcp:message', (_, msg) => callback(msg)),
  getServers: () => ipcRenderer.invoke('mcp:getServers'),
  connectServer: (serverId) => ipcRenderer.invoke('mcp:connectServer', serverId),
  addServer: (server) => ipcRenderer.invoke('mcp:addServer', server),
  removeServer: (serverId) => ipcRenderer.invoke('mcp:removeServer', serverId),
  updateServer: (server) => ipcRenderer.invoke('mcp:updateServer', server),
});
