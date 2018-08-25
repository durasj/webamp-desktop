const { remote } = require('electron')

function handleTransparency() {
    const mainWindow = remote.getCurrentWindow()

    // Mac OS already handles transparent area around UI well
    // TODO: Only problem is it doesn't handle it well within the UI (skin)
    // TODO: Also, only clicks will get propagated. forward: true doesn't work
    // if the webamp windows is not in the foreground (no events triggered)

    // Windows
    // Ignoring mouse events (propagating "mouseover" to UI below)
    // on transparent areas around webamp UI (windows and context menu).
    // Works by using mousein and mouseout na forwarding when ignoring.
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
            if (!e.toElement
                || !e.toElement.offsetParent
                || e.toElement.offsetParent.id === 'webamp'
            ) {
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

        const rebindMouseEvents = () => {
            const webampWindows = document.querySelectorAll('#webamp .window')
            for (webampWindow of webampWindows) {
                webampWindow.removeEventListener('mouseenter', mouseenterHandler)
                webampWindow.removeEventListener('mouseleave', mouseleaveHandler)
                webampWindow.addEventListener('mouseenter', mouseenterHandler)
                webampWindow.addEventListener('mouseleave', mouseleaveHandler)
            }
        }

        const observer = new MutationObserver(() => {
            rebindMouseEvents()
        })
        observer.observe(
            document.querySelector('#main-window').parentElement.parentElement,
            { childList: true }
        )

        rebindMouseEvents()
    }

    // Mac OS and Linux
    // Ignoring mouse events when not over windows and context menu
    // and propagating clicks if they happen on the transparent area of skin.
    // We'll track and mark position of webamp windows and context menu
    // and poll mouse to see if it is within the bounds.
    // TODO: Check if we can use forward: true on these platforms too.
    if (process.platform === 'darwin' || process.platform === 'linux') {
        /**
         * @type {[id: string]: {minX: number, maxX: number, minY: number, maxY: number} }
         */
        const elementPositions = {}
        let ignored = false
        let interval

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

                    elementPositions[recalcWindow.id] = {
                        minX: boundingRect.x,
                        minY: boundingRect.y,
                        maxX: boundingRect.x + boundingRect.width,
                        maxY: boundingRect.y + boundingRect.height,
                    }
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
        }

        const enableTransparencyChecking = () => {
            clearInterval(interval)
            interval = setInterval(() => {
                const cursorPoint = remote.screen.getCursorScreenPoint()
                const windowBounds = mainWindow.getBounds()
    
                const cursorWithinBounds =
                    (cursorPoint.x >= windowBounds.x
                        && cursorPoint.x <= (windowBounds.x + windowBounds.width)
                    ) &&
                    (cursorPoint.y >= windowBounds.y
                        && cursorPoint.y <= (windowBounds.y + windowBounds.height)
                    )
                if (!cursorWithinBounds) {
                    return
                }
    
                const positionInWindow = {
                    x: cursorPoint.x - windowBounds.x,
                    y: cursorPoint.y - windowBounds.y,
                }
    
                for (const elementId of Object.keys(elementPositions)) {
                    const elementPosition = elementPositions[elementId]
    
                    const withinX = (positionInWindow.x > elementPosition.minX)
                        && (positionInWindow.x < elementPosition.maxX)
                    if (!withinX) {
                        continue
                    }
                    const withinY = (positionInWindow.y > elementPosition.minY)
                        && (positionInWindow.y < elementPosition.maxY)
                    const within = withinX && withinY
    
                    if (within) {
                        if (ignored) {
                            mainWindow.setIgnoreMouseEvents(false)
                            ignored = false
                            console.log('Enabling')
                        }
                        return
                    }
                }
    
                if (!ignored) {
                    mainWindow.setIgnoreMouseEvents(true)
                    ignored = true
                    console.log('Disabling')
                }
            }, 200)
        }

        const disableTransparencyChecking = () => {
            clearInterval(interval)
        }

        mainWindow.on('restore', () => {
            enableTransparencyChecking()
        })
        mainWindow.on('minimize', () => {
            disableTransparencyChecking()
        })
        mainWindow.on('closed', () => {
            disableTransparencyChecking()
        })

        setupWatchingElements()
        enableTransparencyChecking()
    }
}

module.exports = handleTransparency
