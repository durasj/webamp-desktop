const { remote } = require('electron')
const leftClicky = require('left-clicky')

// We want to completely disable the eval() for security reasons
// ESLint will warn about any use of eval(), even this one
// eslint-disable-next-line
window.eval = global.eval = function () {
    throw new Error(`Sorry, this app does not support window.eval().`)
}

// Handle transparency of skin or are around windows
// by catching each mouse click and triggering it again
// on click-through window if it was done on transparent pixel
document.addEventListener('click', function() {
    const cursorPoint = electron.screen.getCursorScreenPoint()
    const windowBounds = remote.getCurrentWindow().getBounds()

    const cursorWithinBounds =
      (cursorPoint.x >= windowBounds.x && cursorPoint.x <= (windowBounds.x + windowBounds.width)) &&
      (cursorPoint.y >= windowBounds.y && cursorPoint.y <= (windowBounds.y + windowBounds.height))

    if (!cursorWithinBounds) {
        return;
    }

    mainWindow.webContents.capturePage({
        x: cursorPoint.x - windowBounds.x,
        y: cursorPoint.y - windowBounds.y,
        width: 1,
        height: 1
    }, (image) => {
        const buffer = image.getBitmap()

        if (buffer[3] && buffer[3] === 0) {
            mainWindow.setIgnoreMouseEvents(true)
            leftClicky.click()
            mainWindow.setIgnoreMouseEvents(false)
        }
    })
})

/**
 * Electron API wrappers passed to the renderer
 *
 * Only implementation of the selected APIs is available
 * to greatly reduce the attack surface
 * See https://github.com/electron/electron/blob/master/docs/tutorial/security.md#2-disable-nodejs-integration-for-remote-content
 */

window.minimizeElectronWindow = function () {
    return remote.getCurrentWindow().minimize()
}

window.closeElectronWindow = function () {
    return remote.getCurrentWindow().close()
}
