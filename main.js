const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

require('electron-debug')({showDevTools: 'undocked'});

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let ignoringMouseEvents = false;
let interval;

function enableTransparencyChecking() {
  clearInterval(interval);
  interval = setInterval(() => {
    const cursorPoint = electron.screen.getCursorScreenPoint();
    const windowBounds = mainWindow.getBounds();

    const cursorWithinBounds =
      (cursorPoint.x >= windowBounds.x && cursorPoint.x <= (windowBounds.x + windowBounds.width)) &&
      (cursorPoint.y >= windowBounds.y && cursorPoint.y <= (windowBounds.y + windowBounds.height));

    if (cursorWithinBounds) {
      mainWindow.webContents.capturePage({
        x: cursorPoint.x - windowBounds.x,
        y: cursorPoint.y - windowBounds.y,
        width: 1,
        height: 1
      }, (image) => {
        const buffer = image.getBitmap();

        if (buffer[3] && buffer[3] > 0) {
          if (ignoringMouseEvents) {
            mainWindow.setIgnoreMouseEvents(false);
            ignoringMouseEvents = false;
          }
        } else {
          if (!ignoringMouseEvents) {
            mainWindow.setIgnoreMouseEvents(true);
            ignoringMouseEvents = true;
          }
        }
      });
    }
  }, 100);
}

function disableTransparencyChecking() {
  clearInterval(interval);
}

function createWindow () {
  const {
    width,
    height
  } = electron.screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: width,
    height: height,
    transparent: true,
    frame: false,
    show: false,
    resizable: false,
    movable: false,
    fullscreenable: false,
    icon: path.join(__dirname, 'res/icon.png')
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('restore', () => {
    enableTransparencyChecking();
  });

  mainWindow.on('minimize', () => {
    disableTransparencyChecking();
  });

  // and show window once it's ready (to prevent flashing)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    enableTransparencyChecking();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    disableTransparencyChecking();

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
