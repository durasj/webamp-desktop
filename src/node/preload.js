import handleThumbnail from './thumbnail.js'
import handleThumbar from './thumbar.js'

// TODO: Port to Tauri
window.webampRendered = function () {
    handleThumbnail()
    handleThumbar(
        'stopped',
        window.webampPlay,
        window.webampPause,
        window.webampPrevious,
        window.webampNext,
    )
}

// TODO: Port to Tauri
window.webampOnTrackDidChange = function(track) {
    let state

    if (!track) {
        state = 'paused'
    } else if (track) {
        state = 'playing'
    }

    handleThumbar(
        state,
        window.webampPlay,
        window.webampPause,
        window.webampPrevious,
        window.webampNext,
    )
}
