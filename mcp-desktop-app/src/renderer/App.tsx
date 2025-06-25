import React from 'react';
import ChatInterface from './components/ChatInterface'; // Ensure correct relative path

const App: React.FC = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem', background: '#222', color: '#fff' }}>
        <h1>MCP Desktop Chat</h1>
      </header>
      <main style={{ flex: 1, background: '#f5f5f5' }}>
        <ChatInterface />
      </main>
    </div>
  );
};

export default App;
