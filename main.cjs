const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simple IPC if needed, though contextIsolation: true is better security
      webSecurity: false // Allow loading local resources if needed
    },
    autoHideMenuBar: true,
    titleBarStyle: 'hidden', // For custom title bar if we want, or just standard
    titleBarOverlay: {
      color: '#171717',
      symbolColor: '#e5e5e5'
    }
  });

  // In production, load the built file.
  // In dev, you might want to load 'http://localhost:4200'
  // For this setup, we'll assume we build the angular app first.

  const distPath = path.join(__dirname, 'dist', 'index.html');

  // Check if we are in dev mode (you can set an env var or just check args)
  const isDev = process.argv.includes('--dev');

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadURL(url.format({
      pathname: distPath,
      protocol: 'file:',
      slashes: true
    }));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
