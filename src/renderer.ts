const Winamp = require('winamp2-js');

const remote = require('electron').remote;

const winamp = new Winamp({
  initialTrack: {
    name: "1. DJ Mike Llama - Llama Whippin' Intro",
    url: "https://d38dnrh1liu4f5.cloudfront.net/projects/winamp2-js/mp3/llama-2.91.mp3"
  },
  initialSkin: {
    url: "https://d38dnrh1liu4f5.cloudfront.net/projects/winamp2-js/skins/base-2.91.wsz"
  }
});

const winampJsEl = document.getElementById('winamp2-js');

// Render after the skin has loaded.
winamp.renderWhenReady(winampJsEl);

// Hacky way to control minimizing and closing
// TODO: Replace with API on the Winamp
winampJsEl.addEventListener('click', function(e) {
  let found, el = e.target || e.srcElement;
  while (el && !(found = ['minimize', 'close'].indexOf((<HTMLElement> el).id) != -1)) el = (<HTMLElement> el).parentElement;
  if (found) {
    if (((<HTMLElement> el).id) === 'minimize') {
      // Minimize
      remote.getCurrentWindow().minimize(); 
    } else {
      // Close
      remote.getCurrentWindow().close();
    }

    e.stopImmediatePropagation();
  }
});