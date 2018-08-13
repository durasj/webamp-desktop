declare global {
    interface Window {
        minimizeElectronWindow: () => void
        closeElectronWindow: () => void
    }
}
