const { app, BrowserWindow, nativeImage } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

let mainWindow;
let ariaProcess;

const ARIA_CONF = path.join(os.homedir(), '.aria2', 'aria2.conf');

if (process.platform === 'linux') {
  app.setDesktopName('aria2-manager.desktop');
}

function startAria2() {
  console.log("Starting Aria2c background process...");

  // Spawn aria2c with the config file
  ariaProcess = spawn('aria2c', ['--conf-path', ARIA_CONF]);

  ariaProcess.stdout.on('data', (data) => console.log(`Aria2: ${data}`));
  ariaProcess.stderr.on('data', (data) => console.error(`Aria2 Err: ${data}`));

  ariaProcess.on('error', (err) => {
    console.error('Failed to start aria2c. Is it installed?', err);
  });
}

function createWindow () {

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'app', 'icon.png'),
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true
    },
    resizable: true,
    autoHideMenuBar: true
  });

  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));
}

app.whenReady().then(() => {
  startAria2();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  if (ariaProcess) {
    console.log("Killing Aria2c...");
    ariaProcess.kill();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
