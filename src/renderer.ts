import Webamp from 'webamp'

const DEFAULT_DOCUMENT_TITLE = document.title

const webamp = new Webamp({
  initialTracks: [
    {
      metaData: {
        artist: 'DJ Mike Llama',
        title: 'Llama Whippin\' Intro',
      },
      url: './mp3/llama-2.91.mp3'
    }
  ],
  initialSkin: {
    url: './skins/base-2.91.wsz'
  },
  availableSkins: [
    { url: './skins/base-2.91.wsz', name: 'Base v2.91' },
    { url: './skins/Green-Dimension-V2.wsz', name: 'Green Dimension V2' },
    { url: './skins/MacOSXAqua1-5.wsz', name: 'Mac OSX v1.5 (Aqua)' },
    { url: './skins/Skinner_Atlas.wsz', name: 'Skinner Atlas' },
    { url: './skins/TopazAmp1-2.wsz', name: 'TopazAmp v1.2' },
    { url: './skins/Vizor1-01.wsz', name: 'Vizor v1.01' },
    { url: './skins/XMMS-Turquoise.wsz', name: 'XMMS Turquoise' },
    { url: './skins/ZaxonRemake1-0.wsz', name: 'Zaxon Remake v1.0' },
  ],
  enableHotkeys: true,
})

const unsubscribeOnMinimize = webamp.onMinimize(() => {
  window.minimizeElectronWindow()
})

const unsubscribeOnClose = webamp.onClose(() => {
  window.closeElectronWindow()
  unsubscribeOnMinimize()
  unsubscribeOnClose()
})

webamp.onTrackDidChange(track => {
  window.webampOnTrackDidChange(track)

  if (track && 'metaData' in track && track.metaData.title && track.metaData.artist) {
    document.title = `${track.metaData.title} - ${track.metaData.artist}`
  } else {
    document.title = DEFAULT_DOCUMENT_TITLE
  }
})

// Render after the skin has loaded.
webamp.renderWhenReady(document.getElementById('app')).then(
  () => window.webampRendered()
)

// Expose some webamp API on the window for the main process
window.webampPlay = function () {
  webamp.play()
}

window.webampPlay = function () {
  webamp.play()
}

window.webampPause = function () {
  webamp.pause()
}

window.webampNext = function () {
  webamp.nextTrack()
}

window.webampPrevious = function () {
  webamp.previousTrack()
}
