const { remote } = require('electron')

function handleTransparency() {
    const mainWindow = remote.getCurrentWindow()

    // Mac OS already handles transparent area around UI well
    // TODO: Only problem is it doesn't handle it well within the UI (skin)

    // Windows
    // Ignoring mouse events (propagating "mouseover" to UI below)
    // on transparent areas around webamp UI (windows and context menu).
    if (process.platform === 'win32') {
        mainWindow.setIgnoreMouseEvents(true, { forward: true })
        let ignored = true

        const mouseenterHandler = () => {
            if (ignored) {
                mainWindow.setIgnoreMouseEvents(false)
                ignored = false
            }
        }
        const mouseleaveHandler = (e) => {
            if (e.toElement.offsetParent.id === 'webamp') {
                mainWindow.setIgnoreMouseEvents(true, { forward: true })
                ignored = true
            }
            // We want to schedule events again for context menu.
            // Context menu can "stick out" of windows.
            if (e.toElement.classList.contains('context-menu')) {
                e.toElement.addEventListener('mouseenter', mouseenterHandler)
                e.toElement.addEventListener('mouseleave', mouseleaveHandler)
                e.toElement.addEventListener('click', () => {
                    // Removing context menu means we have to trigger leave too
                    mainWindow.setIgnoreMouseEvents(true, { forward: true })
                    ignored = true
                })
            }
        }

        const webampWindows = document.querySelectorAll('#webamp .window')
        for (webampWindow of webampWindows) {
            webampWindow.addEventListener('mouseenter', mouseenterHandler)
            webampWindow.addEventListener('mouseleave', mouseleaveHandler)
        }
    }

    // Linux
    // TODO: Check if { forward: true } on ignoreMouseEvents is available on Linux
    // We need to poll pixel under cusor till there is better solution
    if (process.platform === 'linux') {
        let ignored = false
        let transparencyInterval

        function enableTransparencyChecking() {
          clearInterval(transparencyInterval)
          transparencyInterval = setInterval(() => {
            const cursorPoint = remote.screen.getCursorScreenPoint()
            const windowBounds = mainWindow.getBounds()

            const cursorWithinBounds =
              (cursorPoint.x >= windowBounds.x && cursorPoint.x <= (windowBounds.x + windowBounds.width)) &&
              (cursorPoint.y >= windowBounds.y && cursorPoint.y <= (windowBounds.y + windowBounds.height))

            if (cursorWithinBounds) {
              mainWindow.webContents.capturePage({
                x: cursorPoint.x - windowBounds.x,
                y: cursorPoint.y - windowBounds.y,
                width: 1,
                height: 1
              }, (image) => {
                if (!mainWindow) {
                  return;
                }

                const buffer = image.getBitmap()

                if (buffer[3] && buffer[3] > 0) {
                  if (ignored) {
                    mainWindow.setIgnoreMouseEvents(false)
                    ignored = false
                  }
                } else {
                  if (!ignored) {
                    mainWindow.setIgnoreMouseEvents(true)
                    ignored = true
                  }
                }
              })
            }
          }, 200)
        }

        function disableTransparencyChecking() {
          clearInterval(transparencyInterval)
        }

        mainWindow.on('restore', () => {
            enableTransparencyChecking()
        })
        mainWindow.on('minimize', () => {
            disableTransparencyChecking()
        })
        mainWindow.on('closed', function () {
            disableTransparencyChecking()
        })
        enableTransparencyChecking()
    }
}

module.exports = handleTransparency
