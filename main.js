const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// MOCK MOUSE CONTROL (Dependency issues with nut.js/robotjs on this environment)
// const { mouse, Point, straightTo } = require('@nut-tree/nut-js');
// mouse.config.autoDelayMs = 0;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools(); // Open DevTools to see logs
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

// IPC Handlers
const http = require('http');

function sendToBridge(endpoint, data) {
    const dataString = JSON.stringify(data || {});
    const options = {
        hostname: '127.0.0.1',
        port: 5000,
        path: endpoint,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length
        }
    };

    const req = http.request(options, (res) => {});
    req.on('error', (e) => {
        // console.error(`Problem with bridge: ${e.message}`);
    });
    req.write(dataString);
    req.end();
}

ipcMain.handle('mouse:move', async (event, { x, y }) => {
    // console.log(`[Bridge] Move: ${x.toFixed(2)}, ${y.toFixed(2)}`);
    sendToBridge('/move', { x, y });
});

ipcMain.handle('mouse:click', async () => {
    console.log('[Bridge] Click!');
    sendToBridge('/click', {});
});

const { interpretGesture } = require('./agent');

ipcMain.handle('agent:trigger', async (event, gesture) => {
    console.log(`[Main] Agent triggered with gesture: ${gesture}`);
    const r = await interpretGesture(gesture);
    console.log(`[Agent Response] ${r}`);
    return r;
});

