const {app, BrowserWindow} = require('electron')
path = require('path')
url = require('url')

let win

function createWindow() {
    win = new BrowserWindow({
        minHeight: 600,
        minWidth: 800,
        resizable: true,
        frame: true
    })

    win.setMenuBarVisibility(false)

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }))
}

app.on('ready', createWindow)
