const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const convert = require('heic-convert');

function createWindow() {
    const win = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    return result.filePaths[0];
});

ipcMain.handle('convert-images', async (event, { sourceDir, destDir }) => {
    try {
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir);
        }

        const files = await promisify(fs.readdir)(sourceDir);
        let converted = 0;
        let total = files.filter(file => path.extname(file).toLowerCase() === '.heic').length;

        for (let file of files) {
            if (path.extname(file).toLowerCase() === '.heic') {
                const sourceFilePath = path.join(sourceDir, file);
                const inputBuffer = await promisify(fs.readFile)(sourceFilePath);

                const images = await convert.all({
                    buffer: inputBuffer,
                    format: 'JPEG'
                });

                for (let idx in images) {
                    const image = images[idx];
                    const outputBuffer = await image.convert();
                    await promisify(fs.writeFile)(
                        path.join(destDir, `${path.parse(file).name}-${idx}.jpg`),
                        outputBuffer
                    );
                }
                converted++;
                event.sender.send('progress-update', { converted, total });
            }
        }
        return { success: true, converted };
    } catch (error) {
        return { success: false, error: error.message };
    }
});
