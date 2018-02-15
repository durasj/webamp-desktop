//require('babel-polyfill');
const Winamp = require('winamp2-js');
 
const winamp = new Winamp({
  initialTrack: {
    name: "1. DJ Mike Llama - Llama Whippin' Intro",
    url: "https://d38dnrh1liu4f5.cloudfront.net/projects/winamp2-js/mp3/llama-2.91.mp3"
  },
  initialSkin: {
    url: "https://d38dnrh1liu4f5.cloudfront.net/projects/winamp2-js/skins/base-2.91.wsz"
  }
});
// Render after the skin has loaded.
winamp.renderWhenReady(document.getElementById('winamp2-js'));
