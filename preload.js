const electron = require('electron')

electron.contextBridge.exposeInMainWorld('electron', {
clear() {
    electron.ipcRenderer.send('clear')
},
requestFileData() {
document.getElementById('file-data').innerHTML = electron.ipcRenderer.sendSync('request-file-data')
},
open() {
    electron.ipcRenderer.send('open')
}
})


electron.ipcRenderer.on('file-changed', (event, data) => {
document.getElementById('file-data').innerHTML = data
})