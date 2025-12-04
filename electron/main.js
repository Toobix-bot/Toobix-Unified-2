/**
 * 🖥️ TOOBIX DESKTOP - Electron Main Process
 * 
 * Desktop-Anwendung für Toobix
 * - Native Window
 * - Tray Icon
 * - Auto-Updater
 * - System Integration
 */

const { app, BrowserWindow, Tray, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let tray = null;
let serviceProcesses = [];

// ============================================================================
// WINDOW CREATION
// ============================================================================

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#0a0e27',
    autoHideMenuBar: true,
    title: 'Toobix - Dein digitaler Gefährte'
  });

  // Load UI
  mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============================================================================
// SYSTEM TRAY
// ============================================================================

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'tray-icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Toobix öffnen',
      click: () => {
        if (mainWindow === null) {
          createWindow();
        } else {
          mainWindow.show();
        }
      }
    },
    {
      label: 'Services',
      submenu: [
        {
          label: 'Status anzeigen',
          click: () => {
            mainWindow?.webContents.send('show-services');
          }
        },
        { type: 'separator' },
        {
          label: 'Alle starten',
          click: startAllServices
        },
        {
          label: 'Alle stoppen',
          click: stopAllServices
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Website öffnen',
      click: () => {
        shell.openExternal('https://toobix-bot.github.io/Toobix-Unified-2/');
      }
    },
    {
      label: 'Twitter @ToobixAI',
      click: () => {
        shell.openExternal('https://twitter.com/ToobixAI');
      }
    },
    { type: 'separator' },
    {
      label: 'Beenden',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Toobix - Dein digitaler Gefährte');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
}

// ============================================================================
// SERVICE MANAGEMENT
// ============================================================================

function startAllServices() {
  console.log('Starting all Toobix services...');
  
  const servicesScript = path.join(app.getAppPath(), 'toobix-expanded-services.ts');
  
  const bunPath = process.platform === 'win32' 
    ? path.join(process.env.USERPROFILE, '.bun', 'bin', 'bun.exe')
    : 'bun';

  const serviceProcess = spawn(bunPath, ['run', servicesScript], {
    cwd: app.getAppPath(),
    stdio: 'pipe'
  });

  serviceProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    console.log('[Services]', msg);
    mainWindow?.webContents.send('service-log', msg);
  });

  serviceProcess.stderr.on('data', (data) => {
    console.error('[Services Error]', data.toString());
    mainWindow?.webContents.send('service-error', data.toString());
  });

  serviceProcess.on('exit', (code) => {
    console.log(`Services exited with code ${code}`);
    mainWindow?.webContents.send('services-stopped', code);
  });

  serviceProcesses.push(serviceProcess);
  mainWindow?.webContents.send('services-started');
}

function stopAllServices() {
  console.log('Stopping all services...');
  
  serviceProcesses.forEach(proc => {
    try {
      proc.kill('SIGTERM');
    } catch (error) {
      console.error('Error stopping service:', error);
    }
  });

  serviceProcesses = [];
  mainWindow?.webContents.send('services-stopped', 0);
}

// ============================================================================
// IPC HANDLERS
// ============================================================================

ipcMain.handle('start-services', async () => {
  startAllServices();
  return { success: true };
});

ipcMain.handle('stop-services', async () => {
  stopAllServices();
  return { success: true };
});

ipcMain.handle('get-service-status', async () => {
  return {
    running: serviceProcesses.length > 0,
    count: serviceProcesses.length
  };
});

ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});

// ============================================================================
// APP LIFECYCLE
// ============================================================================

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Auto-start services on launch
  setTimeout(startAllServices, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Don't quit on window close (keep running in tray)
  // Only quit if explicitly requested
});

app.on('before-quit', () => {
  stopAllServices();
});

app.on('will-quit', () => {
  stopAllServices();
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
