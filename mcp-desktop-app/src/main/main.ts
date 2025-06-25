import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

// Disable GPU acceleration for compatibility on Linux/VMs
app.commandLine.appendSwitch('disable-gpu');

import '../mcp/hostClient'; // Import MCP Host/Client IPC handlers

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Try to load the built renderer HTML (production)
  const rendererHtml = path.join(__dirname, '../renderer/index.html');
  const fs = require('fs');
  if (fs.existsSync(rendererHtml)) {
    win.loadFile(rendererHtml).catch((err: any) => {
      console.error('Failed to load renderer HTML:', err);
    });
  } else {
    // Fallback: load public/index.html (dev mode)
    const fallbackHtml = path.join(__dirname, '../../public/index.html');
    win.loadFile(fallbackHtml).catch((err: any) => {
      console.error('Failed to load fallback HTML:', err);
    });
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ...MCP Host/Client IPC handlers will be added here...
