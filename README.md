<p align="center">
  <a href="https://desktop.webamp.org/">
    <img src="./res/logo.svg" alt="Webamp on desktop logo" width=384 height=128>
  </a>

  <h3 align="center">Webamp on desktop</h3>

  <p align="center">
    Just like the original, now on your Mac, Windows or a Linux!
  </p>

  <p align="center">
    <a href="https://desktop.webamp.org" title="Downloads"><img src="https://img.shields.io/github/downloads/durasj/webamp-desktop/total.svg" /></a>
    <a href="https://travis-ci.org/durasj/webamp-desktop" title="Build"><img src="https://img.shields.io/travis/durasj/webamp-desktop/master.svg" alt="Build badge" /></a>
    <a href="https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fdurasj%2Fwebamp-desktop" title="Tweet"><img src="https://img.shields.io/twitter/url/https/github.com/durasj/webamp-desktop.svg?style=social" alt="Tweet badge" /></a>
  </p>
</p>

<br>

[![Screenshot of webamp desktop on Windows](./res/screen-win.gif)](https://desktop.webamp.org/) [![Screenshot of Webamp on Linux](./res/screen-linux.png)](https://desktop.webamp.org/) [![Screenshot of Webamp on Mac OS X](./res/screen-mac.png)](https://desktop.webamp.org/)

Unofficial app. It has most of the functionality of the original Winamp, but it's still more of a proof of concept. Based on the [Webamp](https://github.com/captbaritone/webamp) - "A reimplementation of Winamp 2.9 in HTML5 and JavaScript." by the [@captbaritone](https://github.com/captbaritone). Linux support via AppImage and .deb package tested on the Ubuntu 18.04.

## Downloads
Head over to the [desktop.webamp.org](https://desktop.webamp.org/) for the latest download files for your platform.

## Ideas for the future
- Automatic updates (prepared, notifications already done)
- Implement Taskbar media control buttons
- Media Keys support (Play, Pause, Stop, Previous, Next)
- Implement Windows.Media.Playback.MediaPlayer WinRT API
- Support for multiple displays
- Support file associations
- Add features that are not in the web version (via the API)
- Try to integrate [winampify-js](https://github.com/remigallego/winampify-js), milkdrop can be integrated using microphone (?) due to problems with the DRM

## Known issues

### Installation files are not trusted

Some operating systems, especially Windows or some browsers do not trust the installation files because they are not digitally signed and/or commonly used yet. Unfortunately, code signing certificates that would help us overcome this cost hundreds of euro per year. This project does not have any funding and therefore can't afford it. It's recommended to verify the checksum of the files if you are worried. Every commit (and therefore published checksum) is signed in this repository.

### Poor performance on Linux

Caused by the disabled hardware acceleration on the Linux. The reason is [issues with the transparency on the Chromium project](https://bugs.chromium.org/p/chromium/issues/detail?id=854601#c7).

## Developing

### Prerequisites

Make sure you have latest [node.js](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/lang/en/).

### Installing

Clone this repository, install dependencies and run the start script:

```
git clone https://github.com/durasj/webamp-desktop.git
cd webamp-desktop
yarn install
yarn start
```

After the build has completed, you should see one window with the app and one with developer tools. To try some changes, you can: change the code in the `./src` dir, close the current window and run the `yarn start` again.

## Disclaimer
Not affiliated with the [Winamp](http://www.winamp.com/). All product names, logos, and brands are property of their respective owners.