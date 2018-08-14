<p align="center">
  <a href="https://github.com/durasj/webamp-desktop">
    <img src="./res/logo.svg" alt="Webamp on desktop logo" width=384 height=128>
  </a>

  <h3 align="center">Webamp on desktop</h3>

  <p align="center">
    Just like the original, now on your Mac, Windows or a Linux!
  </p>
</p>

<br>

[![Screenshot of webamp desktop on Windows](./res/screen-win.gif)](https://github.com/durasj/webamp-desktop) [![Screenshot of Webamp on Linux](./res/screen-linux.png)](https://github.com/durasj/webamp-desktop) [![Screenshot of Webamp on Mac OS X](./res/screen-mac.png)](https://github.com/durasj/webamp-desktop)

Unofficial app. It has most of the functionality of the original Winamp, but it's still more of a proof of concept. Based on the [Webamp](https://github.com/captbaritone/webamp) - "A reimplementation of Winamp 2.9 in HTML5 and JavaScript." by the [@captbaritone](https://github.com/captbaritone). Linux support via AppImage and .deb package tested on the Ubuntu.

## Downloads
- Windows - [portable 64-bit](https://github.com/durasj/webamp-desktop/releases/download/v0.2.0/webamp-desktop-0.2.0.exe)
- Linux - [AppImage 64-bit](https://github.com/durasj/webamp-desktop/releases/download/v0.2.0/webamp-desktop-0.2.0-x86_64.AppImage), [deb 64-bit](https://github.com/durasj/webamp-desktop/releases/download/v0.2.0/webamp-desktop_0.2.0_amd64.deb)
- MacOS X - [dmg 64-bit](https://github.com/durasj/webamp-desktop/releases/download/v0.2.0/webamp-desktop-0.2.0.dmg)

## Ideas for the future
- Establish proper integration with the webamp-js by using its API
- Change packages to installable versions with automatic updates
- Implement Windows.Media WinRT API
- Support for multiple displays
- Support file associations
- Add features that are not in the web version (via the API)
- Try to integrate [winampify-js](https://github.com/remigallego/winampify-js), milkdrop can be integrated using microphone (?) due to problems with the DRM

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