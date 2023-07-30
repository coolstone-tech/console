const { app, shell, dialog, screen, BrowserWindow, ipcMain, ShareMenu, Menu } = require('electron')
const { writeFileSync, watchFile, readFileSync } = require('original-fs')

let filePath = ''

app.on('open-file', (event, path) => {
    filePath = path
})

const run = () => {

if(!filePath) {
    const f = dialog.showOpenDialogSync({
        properties: ['openFile'],
        filters: [
            { name: 'Log Files', extensions: ['log', 'txt'] },
        ]
    })[0]
    console.log(f)
    if (!f) { app.quit() }
    filePath = f
}

let mainWin = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
        preload: `${__dirname}/preload.js`
    }
})

ipcMain.on('clear', () => {
const choice = dialog.showMessageBoxSync(mainWin, {
    type: 'question',
    message:"Do you want to temporarily clear or permanently clear the file?",
    buttons: ['Temporarily', 'Permanently', 'Cancel'],
})
if (choice === 0) {
    mainWin.webContents.send('file-changed', '')
} else if (choice === 1) {
    writeFileSync(filePath, '')
}
})

ipcMain.on('open', () => {
shell.showItemInFolder(filePath)
})


ipcMain.on('request-file-data', (event) => {
const data = readFileSync(filePath, 'utf8')
event.returnValue = data.split(require('os').EOL).join('<br>')
})

const watcher = watchFile(filePath, () => {
    const data = readFileSync(filePath, 'utf8')
    mainWin.webContents.send('file-changed', data.split(require('os').EOL).join('<br>'))
})

mainWin.setTitle(require('path').basename(filePath))
mainWin.loadFile(`${__dirname}/index.html`)
}


app.whenReady().then(run)