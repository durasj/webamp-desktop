const isDev = require('electron-is-dev')
const path = require('path')
const url = require('url')

const checkForUpdatesAndNotify = require('./src/node/updates.js')
const interceptStreamProtocol = require('./src/node/protocol.js')

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

if (isDev) {
  require('electron-debug')({ showDevTools: 'undocked' })
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  electron.protocol.interceptStreamProtocol(
    'file',
    interceptStreamProtocol(),
    (error) => {
      if (error) {
        console.error('Failed to register protocol')
      }
    },
  )

  const {
    width,
    height
  } = electron.screen.getPrimaryDisplay().workAreaSize

  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: width,
    height: height,
    transparent: true,
    frame: false,
    hasShadow: false,
    show: false,
    resizable: false,
    movable: false,
    fullscreenable: false,
    icon: path.join(__dirname, 'res/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'src/node/preload.js'),
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: './dist/index.html',
    protocol: 'file:',
    slashes: true
  }))

  // and show window once it's ready (to prevent flashing)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    checkForUpdatesAndNotify()
  })

  mainWindow.on('closed', function () {
    // Dereference the window object
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// Linux has transparency disabled and window creation delayed
// due to issues with transparency of Chromium on Linux.
// See https://bugs.chromium.org/p/chromium/issues/detail?id=854601#c7
if (process.platform === 'linux') {
  app.disableHardwareAcceleration()
  app.on('ready', () => setTimeout(createWindow, 100))
} else {
  app.on('ready', createWindow)
}

// Prevent all navigation for security reasons
// See https://github.com/electron/electron/blob/master/docs/tutorial/security.md#13-disable-or-limit-navigation
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    event.preventDefault()
  })
})
// Prevent new window creation for security reasons
// and open the URLs in the default browser instead
// See https://github.com/electron/electron/blob/master/docs/tutorial/security.md#14-disable-or-limit-creation-of-new-windows
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    const parsedUrl = url.parse(navigationUrl)

    if (parsedUrl.protocol === 'file:' || parsedUrl.protocol === 'chrome-devtools:') {
      return
    }

    event.preventDefault()
    electron.shell.openExternal(navigationUrl)
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
