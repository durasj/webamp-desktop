const { ipcRenderer, contextBridge } = require("electron");

/**
 * Electron API wrappers passed to the renderer
 *
 * Only implementation of the selected APIs is available
 * to greatly reduce the attack surface
 * See https://github.com/electron/electron/blob/master/docs/tutorial/security.md#2-disable-nodejs-integration-for-remote-content
 */

contextBridge.exposeInMainWorld("minimizeElectronWindow", function () {
  ipcRenderer.send("minimize");
});

contextBridge.exposeInMainWorld("closeElectronWindow", function () {
  ipcRenderer.send("close");
});

contextBridge.exposeInMainWorld("setupRendered", function () {
  const setIgnore = (should) => ipcRenderer.send("ignoreMouseEvents", should);
  const setThumbnailClip = (clip) => ipcRenderer.send("setThumbnailClip", clip);
  const getBounds = () => ipcRenderer.invoke("getBounds");
  const getCursorScreenPoint = () => ipcRenderer.invoke("getCursorScreenPoint");
  const onMinimized = (callback) =>
    ipcRenderer.on("minimized", () => callback());
  const onRestored = (callback) => ipcRenderer.on("restored", () => callback());
  const onClosed = (callback) => ipcRenderer.on("closed", () => callback());

  // Transparency
  if (process.platform === "win32") {
    handleTransparencyWindows(setIgnore);
  } else if (process.platform !== "darwin") {
    // Mac OS already handles transparency around the UI (windows and context menu) well.
    // TODO: Check if forward: true still doesn't work reliably if the webamp windows is not in the foreground (no events triggered).
    // TODO: Check if skin transparency can be implemented without performance hit.

    handleTransparencyLinux(
      setIgnore,
      getBounds,
      getCursorScreenPoint,
      onMinimized,
      onRestored,
      onClosed
    );
  }

  // Thumbnail and thumbar
  handleThumbnail(setThumbnailClip);

  // handleThumbar(
  //   "stopped",
  //   window.webampPlay,
  //   window.webampPause,
  //   window.webampPrevious,
  //   window.webampNext
  // );
});

// window.webampOnTrackDidChange = function (track) {
//   let state;

//   if (!track) {
//     state = "paused";
//   } else if (track) {
//     state = "playing";
//   }

//   handleThumbar(
//     state,
//     window.webampPlay,
//     window.webampPause,
//     window.webampPrevious,
//     window.webampNext
//   );
// };

/**
 * MS Windows
 *
 * Ignore mouse events outside the UI (windows and context menu).
 * Works by using mousein and mouseout and forwarding when ignoring.
 *
 * @param {(should: boolean) => void} setIgnore
 */
function handleTransparencyWindows(setIgnore) {
  setIgnore(true);
  let ignored = true;

  const mouseEnterHandler = () => {
    if (ignored) {
      setIgnore(false);
      ignored = false;
    }
  };
  const mouseLeaveHandler = (e) => {
    if (
      !e.toElement ||
      !e.toElement.offsetParent ||
      e.toElement.offsetParent.id === "webamp"
    ) {
      setIgnore(true);
      ignored = true;
    }
    // We want to schedule events again for context menu.
    // Context menu can "stick out" of windows.
    if (e.toElement.classList.contains("context-menu")) {
      e.toElement.addEventListener("mouseenter", mouseEnterHandler);
      e.toElement.addEventListener("mouseleave", mouseLeaveHandler);
      e.toElement.addEventListener("click", () => {
        // Removing context menu means we have to trigger leave too
        setIgnore(true);
        ignored = true;
      });
    }
  };

  const rebindMouseEvents = () => {
    const webampWindows = document.querySelectorAll("#webamp .window");
    for (webampWindow of webampWindows) {
      webampWindow.removeEventListener("mouseenter", mouseEnterHandler);
      webampWindow.removeEventListener("mouseleave", mouseLeaveHandler);
      webampWindow.addEventListener("mouseenter", mouseEnterHandler);
      webampWindow.addEventListener("mouseleave", mouseLeaveHandler);
    }
  };

  const observer = new MutationObserver(() => {
    rebindMouseEvents();
  });
  observer.observe(
    document.querySelector("#main-window").parentElement.parentElement,
    { childList: true }
  );

  rebindMouseEvents();
}

/**
 * Linux
 *
 * Ignore mouse events around the UI (windows and context menu).
 * We'll track and save position of webamp windows and context menu
 * and poll mouse to see if it is within the saved bounds.
 *
 * TODO: Check if we can use forward: true on this platform too.
 *
 * @param {(should: boolean) => void} setIgnore
 * @param {() => unknown} getBounds
 * @param {() => unknown} getCursorScreenPoint
 * @param {(() => void) => void} onMinimized
 * @param {(() => void) => void} onRestored
 * @param {(() => void) => void} onClosed
 */
function handleTransparencyLinux(
  setIgnore,
  getBounds,
  getCursorScreenPoint,
  onMinimized,
  onRestored,
  onClosed
) {
  /**
   * @type {[id: string]: {minX: number, maxX: number, minY: number, maxY: number} }
   */
  const elementPositions = {};
  let ignored = false;
  let interval;

  const setupWatchingElements = () => {
    const watchWindowAttributes = (webampWindowWrapper) => {
      // Removed from the DOM
      if (webampWindowWrapper.parentElement === null) {
        delete elementPositions[webampWindowWrapper.children[0].id];
        return;
      }

      const recalculateElementPositions = (windowWrapper) => {
        const recalcWindow = windowWrapper.children[0];
        const boundingRect = recalcWindow.getBoundingClientRect();

        elementPositions[recalcWindow.id] = {
          minX: boundingRect.x,
          minY: boundingRect.y,
          maxX: boundingRect.x + boundingRect.width,
          maxY: boundingRect.y + boundingRect.height,
        };
      };

      const observer = new MutationObserver((mutationsList) =>
        recalculateElementPositions(mutationsList[0].target)
      );
      observer.observe(webampWindowWrapper, { attributes: true });
      recalculateElementPositions(webampWindowWrapper);
    };

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        const changedNodes =
          mutation.addedNodes.length > 0
            ? mutation.addedNodes
            : mutation.removedNodes;
        for (const changedNode of changedNodes) {
          watchWindowAttributes(changedNode);
        }
      }
    });
    observer.observe(
      document.querySelector("#main-window").parentElement.parentElement,
      { childList: true }
    );

    for (const webampWindow of document.querySelectorAll("#webamp .window")) {
      watchWindowAttributes(webampWindow.parentElement);
    }

    // Context menu is watched just by observing adding and removing of the node.
    // When added, whole body is position of the contet menu.
    const contextMenuObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.addedNodes.length > 0 &&
          mutation.addedNodes[0].id === "webamp-context-menu"
        ) {
          elementPositions["webamp-context-menu"] = {
            minX: 0,
            minY: 0,
            maxX: 9999,
            maxY: 9999,
          };
        }

        if (
          mutation.removedNodes.length > 0 &&
          mutation.removedNodes[0].id === "webamp-context-menu"
        ) {
          delete elementPositions["webamp-context-menu"];
        }
      }
    });
    contextMenuObserver.observe(document.querySelector("body"), {
      childList: true,
    });
  };

  const enableTransparencyChecking = () => {
    clearInterval(interval);
    interval = setInterval(async () => {
      const cursorPoint = await getCursorScreenPoint();
      const windowBounds = await getBounds();

      const cursorWithinBounds =
        cursorPoint.x >= windowBounds.x &&
        cursorPoint.x <= windowBounds.x + windowBounds.width &&
        cursorPoint.y >= windowBounds.y &&
        cursorPoint.y <= windowBounds.y + windowBounds.height;
      if (!cursorWithinBounds) {
        return;
      }

      const positionInWindow = {
        x: cursorPoint.x - windowBounds.x,
        y: cursorPoint.y - windowBounds.y,
      };

      for (const elementId of Object.keys(elementPositions)) {
        const elementPosition = elementPositions[elementId];

        const withinX =
          positionInWindow.x > elementPosition.minX &&
          positionInWindow.x < elementPosition.maxX;
        if (!withinX) {
          continue;
        }
        const withinY =
          positionInWindow.y > elementPosition.minY &&
          positionInWindow.y < elementPosition.maxY;
        const within = withinX && withinY;

        if (within) {
          if (ignored) {
            setIgnore(false);
            ignored = false;
          }
          return;
        }
      }

      if (!ignored) {
        setIgnore(true);
        ignored = true;
      }
    }, 200);
  };

  const disableTransparencyChecking = () => {
    clearInterval(interval);
  };

  onMinimized(() => disableTransparencyChecking());
  onRestored(() => enableTransparencyChecking());
  onClosed(() => disableTransparencyChecking());

  setupWatchingElements();
  enableTransparencyChecking();
}

function handleThumbnail(setThumbnailClip) {
  // Currently only supported on Windows
  // TODO: Add support for other platforms?
  if (process.platform !== 'win32') return

  const mainWebampWindow = document.querySelector('#main-window')

  const setClip = () => {
    const boundingRect = mainWebampWindow.getBoundingClientRect()

    setThumbnailClip({
      x: boundingRect.x,
      y: boundingRect.y,
      width: boundingRect.width,
      height: boundingRect.height,
    })
  }

  const observer = new MutationObserver(debounce(setClip))
  observer.observe(
    mainWebampWindow.parentElement,
    { attributes: true }
  )
  setClip()
}

function debounce(fn, time = 100) {
  let timeout;

  return (...args) => {
    const ctx = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(ctx, args), time);
  };
}
