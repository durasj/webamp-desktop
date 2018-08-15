<p align="center">
  <a href="https://webamp-desktop.duras.me/">
    <img src="./res/logo.svg" alt="Webamp on desktop logo" width=384 height=128>
  </a>

  <h3 align="center">Webamp on desktop</h3>

  <p align="center">
    Just like the original, now on your Mac, Windows or a Linux!
  </p>
</p>

<br>

[![Screenshot of webamp desktop on Windows](./res/screen-win.gif)](https://webamp-desktop.duras.me/) [![Screenshot of Webamp on Linux](./res/screen-linux.png)](https://webamp-desktop.duras.me/) [![Screenshot of Webamp on Mac OS X](./res/screen-mac.png)](https://webamp-desktop.duras.me/)

Unofficial app. It has most of the functionality of the original Winamp, but it's still more of a proof of concept. Based on the [Webamp](https://github.com/captbaritone/webamp) - "A reimplementation of Winamp 2.9 in HTML5 and JavaScript." by the [@captbaritone](https://github.com/captbaritone). Linux support via AppImage and .deb package tested on the Ubuntu 18.04.

## Downloads
Head over to the [webamp-desktop.duras.me](https://webamp-desktop.duras.me/) for the latest download files for your platform.

## Ideas for the future
- Change packages to installablers (partly done)
- Automatic updates / update notifications
- Implement Windows.Media WinRT API (Taskbar media controls)
- Support for multiple displays
- Support file associations
- Media Keys support (Play, Pause, Stop, Previous, Next)
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