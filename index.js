const {app, BrowserWindow} = require('electron')
path = require('path')
url = require('url')

let win

function createWindow() {
    win = new BrowserWindow({
        minHeight: 665,
        minWidth: 950,
        resizable: true,
        frame: true,
        icon: path.join(__dirname, 'icon/P.png')
    })

    win.setMenuBarVisibility(false)

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'dist/app.html'),
        protocol: 'file',
        slashes: true
    }))
}

app.on('ready', createWindow)
