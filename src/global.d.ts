declare module 'preload' {
    global {
        interface Window {
            minimizeElectronWindow: () => void
            closeElectronWindow: () => void
            rendered: () => void
        }
    }
}