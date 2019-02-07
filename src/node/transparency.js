const { remote } = require('electron')

function handleTransparency() {
    const mainWindow = remote.getCurrentWindow()

    // Mac OS already handles it around the UI (windows and context menu) well.
    // TODO: Check if forward: true still doesn't work reliably
    // if the webamp windows is not in the foreground (no events triggered).
    // TODO: Check if skin transparency can be implemented without performance hit.

    if (process.platform === 'win32' || process.platform === 'linux') {
        /**
         * @type {[id: string]: {x: number, y: number, width: number, height: number} }
         */
        const elementPositions = {}

        const setupWatchingElements = () => {
            const watchWindowAttributes = (webampWindowWrapper) => {
                // Removed from the DOM
                if (webampWindowWrapper.parentElement === null) {
                    delete elementPositions[webampWindowWrapper.children[0].id]
                    return
                }

                const recalculateElementPositions = (windowWrapper) => {
                    const recalcWindow = windowWrapper.children[0]
                    const boundingRect = recalcWindow.getBoundingClientRect()

                    elementPositions[recalcWindow.id] = boundingRect
                    mainWindow.setShape(Object.values(elementPositions))
                }

                const observer = new MutationObserver(
                    (mutationsList) => recalculateElementPositions(
                        mutationsList[0].target
                    )
                )
                observer.observe(
                    webampWindowWrapper,
                    { attributes: true }
                )
                recalculateElementPositions(webampWindowWrapper)
            }

            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    const changedNodes =
                        mutation.addedNodes.length > 0 ? mutation.addedNodes : mutation.removedNodes
                    for (const changedNode of changedNodes) {
                        watchWindowAttributes(changedNode)
                    }
                }
            })
            observer.observe(
                document.querySelector('#main-window').parentElement.parentElement,
                { childList: true }
            )

            for (const webampWindow of document.querySelectorAll('#webamp .window')) {
                watchWindowAttributes(webampWindow.parentElement)
            }

            // Context menu is watched just by observing adding and removing of the node.
            // When added, whole body is position of the contet menu.
            const contextMenuObserver = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.addedNodes.length > 0
                        && mutation.addedNodes[0].id === 'webamp-context-menu'
                    ) {
                        elementPositions['webamp-context-menu'] = {
                            minX: 0,
                            minY: 0,
                            maxX: 9999,
                            maxY: 9999,
                        }
                    }

                    if (mutation.removedNodes.length > 0
                        && mutation.removedNodes[0].id === 'webamp-context-menu'
                    ) {
                        delete elementPositions['webamp-context-menu']
                    }
                }
            })
            contextMenuObserver.observe(
                document.querySelector('body'),
                { childList: true }
            )
        }

        setupWatchingElements()
    }
}

module.exports = handleTransparency
