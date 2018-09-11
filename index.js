const {app, BrowserWindow} = require('electron')
path = require('path')
url = require('url')

let win

function createWindow() {
    win = new BrowserWindow({
        width: 350,
        height: 380,
        resizable: false,
        frame: false
    })

    win.setMenuBarVisibility(false)

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }))
}

app.on('ready', createWindow)
