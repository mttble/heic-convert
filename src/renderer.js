const { ipcRenderer } = require('electron');

async function selectSource() {
    const path = await ipcRenderer.invoke('select-directory');
    if (path) {
        document.getElementById('sourceDir').value = path;
    }
}

async function selectDest() {
    const path = await ipcRenderer.invoke('select-directory');
    if (path) {
        document.getElementById('destDir').value = path;
    }
}

async function convertImages() {
    const sourceDir = document.getElementById('sourceDir').value;
    const destDir = document.getElementById('destDir').value;

    if (!sourceDir || !destDir) {
        document.getElementById('status').innerHTML = 'Please select both directories';
        return;
    }

    document.getElementById('status').innerHTML = 'Converting...';
    document.querySelector('.progress').style.display = 'block';
    
    const result = await ipcRenderer.invoke('convert-images', { sourceDir, destDir });
    
    if (result.success) {
        document.getElementById('status').innerHTML = `Successfully converted ${result.converted} images!`;
    } else {
        document.getElementById('status').innerHTML = `Error: ${result.error}`;
    }
}

ipcRenderer.on('progress-update', (event, { converted, total }) => {
    const percentage = (converted / total) * 100;
    document.querySelector('.progress-bar').style.width = `${percentage}%`;
});
