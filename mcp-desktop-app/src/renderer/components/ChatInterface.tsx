import React, { useState, useRef, useEffect } from 'react';
import type { MCPServer } from '../../shared';

interface Message {
  id: string;
  sender: 'user' | 'system';
  content: string;
  timestamp: string;
}

interface MCPServerFull extends MCPServer {
  host: string;
  port: number;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [servers, setServers] = useState<MCPServerFull[]>([]);
  const [connected, setConnected] = useState<string | null>(null);
  const [serverForm, setServerForm] = useState({ id: '', name: '', host: '', port: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    refreshServers();
    window.mcpAPI.onMessage((msg) => {
      setMessages((prev: Message[]) => [
        ...prev,
        { id: Date.now().toString(), sender: 'system', content: msg.content, timestamp: msg.timestamp },
      ]);
    });
  }, []);

  const refreshServers = () => {
    window.mcpAPI.getServers().then(setServers);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !connected) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev: Message[]) => [...prev, newMessage]);
    setInput('');
    await window.mcpAPI.sendMessage(input);
  };

  const handleConnect = async (serverId: string) => {
    await window.mcpAPI.connectServer(serverId);
    setConnected(serverId);
  };

  const handleAddOrUpdateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    const { id, name, host, port } = serverForm;
    if (!id || !name || !host || !port) return;
    const server = { id, name, host, port: Number(port) };
    if (editId) {
      await window.mcpAPI.updateServer(server);
      setEditId(null);
    } else {
      await window.mcpAPI.addServer(server);
    }
    setServerForm({ id: '', name: '', host: '', port: '' });
    refreshServers();
  };

  const handleEditServer = (srv: MCPServerFull) => {
    setServerForm({ id: srv.id, name: srv.name, host: srv.host, port: String(srv.port) });
    setEditId(srv.id);
  };

  const handleRemoveServer = async (id: string) => {
    await window.mcpAPI.removeServer(id);
    if (connected === id) setConnected(null);
    refreshServers();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '0.5rem', background: '#eee', borderBottom: '1px solid #ccc' }}>
        <span>Connect to MCP Server: </span>
        <select
          value={connected || ''}
          onChange={(e) => handleConnect(e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        >
          <option value="" disabled>Select server...</option>
          {servers.map((srv) => (
            <option key={srv.id} value={srv.id}>{srv.name} ({srv.host}:{srv.port})</option>
          ))}
        </select>
        {connected && <span style={{ marginLeft: '1rem', color: 'green' }}>Connected</span>}
      </div>
      <div style={{ padding: '0.5rem', background: '#f9f9f9', borderBottom: '1px solid #ccc' }}>
        <form style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onSubmit={handleAddOrUpdateServer}>
          <input type="text" placeholder="ID" value={serverForm.id} onChange={e => setServerForm(f => ({ ...f, id: e.target.value }))} disabled={!!editId} style={{ width: 80 }} />
          <input type="text" placeholder="Name" value={serverForm.name} onChange={e => setServerForm(f => ({ ...f, name: e.target.value }))} style={{ width: 120 }} />
          <input type="text" placeholder="Host" value={serverForm.host} onChange={e => setServerForm(f => ({ ...f, host: e.target.value }))} style={{ width: 120 }} />
          <input type="number" placeholder="Port" value={serverForm.port} onChange={e => setServerForm(f => ({ ...f, port: e.target.value }))} style={{ width: 80 }} />
          <button type="submit">{editId ? 'Update' : 'Add'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setServerForm({ id: '', name: '', host: '', port: '' }); }}>Cancel</button>}
        </form>
        <div style={{ marginTop: 4, fontSize: 12, color: '#888' }}>Add or edit MCP server connection details above.</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#fff' }}>
        {servers.length > 0 && (
          <table style={{ width: '100%', marginBottom: 16, fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th>ID</th><th>Name</th><th>Host</th><th>Port</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {servers.map(srv => (
                <tr key={srv.id}>
                  <td>{srv.id}</td>
                  <td>{srv.name}</td>
                  <td>{srv.host}</td>
                  <td>{srv.port}</td>
                  <td>
                    <button onClick={() => handleEditServer(srv)} style={{ marginRight: 4 }}>Edit</button>
                    <button onClick={() => handleRemoveServer(srv.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '0.75rem', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', background: msg.sender === 'user' ? '#d1e7dd' : '#f8d7da', borderRadius: '8px', padding: '0.5rem 1rem' }}>
              <span>{msg.content}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#888' }}>{msg.timestamp}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form
        style={{ display: 'flex', padding: '1rem', background: '#eee', borderTop: '1px solid #ccc' }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={connected ? "Type your message..." : "Connect to a server first"}
          disabled={!connected}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ marginLeft: '0.5rem', padding: '0.5rem 1.5rem', borderRadius: '4px', background: '#222', color: '#fff', border: 'none' }} disabled={!connected}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
