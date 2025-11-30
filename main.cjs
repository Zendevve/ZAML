const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs').promises;
const { simpleGit } = require('simple-git');

// ===== IPC Handlers =====

// Directory picker
ipcMain.handle('open-directory-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

// Scan addon folder
ipcMain.handle('scan-addon-folder', async (event, folderPath) => {
  try {
    const addons = [];
    const entries = await fs.readdir(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const addonPath = path.join(folderPath, entry.name);
        const tocPath = path.join(addonPath, `${entry.name}.toc`);

        try {
          await fs.access(tocPath);
          const tocContent = await fs.readFile(tocPath, 'utf-8');

          // Parse .toc file for addon info
          const addon = parseTocFile(entry.name, tocContent, addonPath);
          addons.push(addon);
        } catch (err) {
          // No .toc file or error reading it, skip
        }
      }
    }

    return { success: true, addons };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Clone Git repository
ipcMain.handle('git-clone', async (event, { repoUrl, targetPath, branchName }) => {
  try {
    const git = simpleGit();
    await git.clone(repoUrl, targetPath, branchName ? ['--branch', branchName] : []);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Pull latest changes
ipcMain.handle('git-pull', async (event, addonPath) => {
  try {
    const git = simpleGit(addonPath);
    await git.pull();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Switch branch
ipcMain.handle('git-checkout', async (event, { addonPath, branchName }) => {
  try {
    const git = simpleGit(addonPath);
    await git.checkout(branchName);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get available branches
ipcMain.handle('git-branches', async (event, addonPath) => {
  try {
    const git = simpleGit(addonPath);
    const branches = await git.branch();
    return {
      success: true,
      branches: branches.all,
      current: branches.current
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Check Git remote for updates
ipcMain.handle('git-check-updates', async (event, addonPath) => {
  try {
    const git = simpleGit(addonPath);
    await git.fetch();
    const status = await git.status();
    const hasUpdates = status.behind > 0;
    return { success: true, hasUpdates, behind: status.behind };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Delete addon folder
ipcMain.handle('delete-addon', async (event, addonPath) => {
  try {
    await fs.rm(addonPath, { recursive: true, force: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ===== Helper Functions =====

function parseTocFile(addonName, tocContent, addonPath) {
  const lines = tocContent.split('\n');
  const addon = {
    name: addonName,
    title: addonName,
    version: 'Unknown',
    author: 'Unknown',
    description: '',
    path: addonPath
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## Title:')) {
      addon.title = trimmed.replace('## Title:', '').trim();
    } else if (trimmed.startsWith('## Version:')) {
      addon.version = trimmed.replace('## Version:', '').trim();
    } else if (trimmed.startsWith('## Author:')) {
      addon.author = trimmed.replace('## Author:', '').trim();
    } else if (trimmed.startsWith('## Notes:')) {
      addon.description = trimmed.replace('## Notes:', '').trim();
    }
  }

  return addon;
}

// ===== Electron Window Setup =====

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    autoHideMenuBar: true,
    backgroundColor: '#1a1a1a',
    show: false
  });

  const distPath = path.join(__dirname, 'dist', 'index.html');
  const isDev = process.argv.includes('--dev');

  if (isDev) {
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
  } else {
    win.loadURL(url.format({
      pathname: distPath,
      protocol: 'file:',
      slashes: true
    }));
  }

  win.once('ready-to-show', () => {
    win.show();
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
