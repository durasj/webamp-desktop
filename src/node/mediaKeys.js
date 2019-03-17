const os = require('os')

function registerMediaKeys(onPause, onPrevious, onNext) {
    // According to https://electronjs.org/docs/api/global-shortcut
    //
    // > The following accelerators will not be registered successfully on macOS
    // > 10.14 Mojave (Darwin 18.x.y) unless the app has been authorized as a trusted
    // > accessibility client:
    if (process.platform === 'darwin' && os.release().indexOf('18') !== 0) {
        electron.globalShortcut.register('MediaPlayPause', onPause)
        electron.globalShortcut.register('MediaNextTrack', onNext)
        electron.globalShortcut.register('MediaPreviousTrack', onPrevious)
    }
}

module.exports = registerMediaKeys
