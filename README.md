<h1 align="center">ZX Spectrum Frontend Meta Generator</h1>

<p align="center">Create your <b>metadata</b> for your favourite emulator <b>backend</b> using the ZXInfo API<br/><br/>Fast, efficient, modern... just like Windows 98<sup>tm</sup></p>

[![GitHub Issues](https://img.shields.io/github/issues/leemm/zxspectrum-meta-generator.svg)](https://github.com/leemm/zxspectrum-meta-generator/issues) [![Current Version](https://img.shields.io/badge/version-0.6.1-green.svg)](https://github.com/leemm/zxspectrum-meta-generator)

![Preview](https://i.imgur.com/rJj1i0n.gif)

---

## Table of contents

-   [Features](#features)
-   Build & Install
    -   [Prerequisites](#prerequisites)
    -   [Build](#build)
    -   [Install](#install)
    -   [Arm (RaspberryPi)](#raspberrypi)
-   [Usage](#usage)
-   [Examples](#examples)
-   [License](#license)

---

## Features

-   Uses [ZXInfo API](https://api.zxinfo.dk/v3/)
-   Command Line application
-   Zip, 7z archive support
-   Progress Bars that range from 0 to 100%!
-   Supports all known spectrum roms, such as the TOSEC set
-   Supports Linux, MacOS, and Windows
-   Supports arm, so can be used on RaspberryPI (under linux e.h. RaspOS)
-   Supports image assets such as screenshots and box art
-   Uses Wikipedia API to find synopsis for game, if available
-   Generates for multiple emulator frontends (currently only supports [Pegasus](https://pegasus-frontend.org/), and partial support for [LaunchBox](https://www.launchbox-app.com/))
-   A lovely [48k Speccy ASCII art](https://github.com/redcode/ASCII-Art/) from https://github.com/redcode/ASCII-Art/
-   Other features coming at some point in the future

---

## Prerequisites

Tools are required for the application to function.

**p7zip** - to install 7z command, required for archive based file support e.g. zip, 7z, rar

### OSX

```bash
brew update && brew doctor && brew install p7zip
```

### Debian/Ubuntu

```bash
sudo apt-get install p7zip-full
```

### Windows

The easiest way is to visit https://www.7-zip.org/download.html and download the latest 7z-extra (https://www.7-zip.org/a/7z2107-extra.7z is the latest at the time of writing).
Then extract and copy _7za.exe_ into your **PATH**.

---

## Build

NodeJS is required so please install according to their [documentation](https://nodejs.org/en/download/package-manager/) for your system. It should be fully backwards compatible this version was written with NodeJS v16+.

The final complicated executable is build using [pkg](https://www.npmjs.com/package/pkg). Their documentation outlines other options you can use when building.

To build locally:

```bash
git clone https://github.com/leemm/zxspectrum-meta-generator.git
npm i
npm run build
```

To start locally:

```bash
npm start -- <switches>

// For example
npm start -- --src ~/Downloads/Games/roms --output '~/Downloads/Games/metadata.pegasus.txt'
```

To package locally:

```bash
npm run package
```

To deploy your build there is a script. It will install to _/usr/local/bin_.

```bash
npm run install-package
```

The packaged version can then run as normal from the _./dist_ directory e.g. _./dist/zxgenerator_. See [Examples](#examples).

If developing there is a helper script increase the version number, as it's in 3 different places. Simply run this to increase the version but keep them in sync:

```bash
npm run version -- --type major, minor, or patch
```

If you wish to add functionality feel free to PR.

---

## RaspberryPi

The build and install process is slightly different, but is easy to do.

```bash
git clone https://github.com/leemm/zxspectrum-meta-generator.git
npm i
npm run build
npx pkg ./dist/zxgenerator.js --out-path ./dist
npm run install-package
```

This will build and deploy to _/usr/local/bin/zxgenerator_.

## Install

Ensure you have the tooling you need from [prerequisites](#prerequisites).

Then download your binary from [releases](https://github.com/leemm/zxspectrum-meta-generator/releases). There are builds for linux (tested on debian based distro), MacOS, and Windows.

Copy the download to your prefered location. For example:

```bash
gzip -d ~/Downloads/zxgenerator-linux.gz
cp ~/Downloads/zxgenerator-linux /usr/local/bin/zxgenerator && chmod +x /usr/local/bin/zxgenerator
```

ARM users, it's recommended you [build](#build). Tested on Pi400.

---

## Usage

```bash
zxgenerator [OPTIONS]
```

| Option           | Description                                                                                                                                                                                                                      | Type      | Default                                                  | Required? |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------- | --------- |
| `--launch`       | Emulator/Script launch path. Game path is automatically added to the end of the process.                                                                                                                                         | `string`  | `<retropiepath>/runcommand.sh 0 _SYS_ zxspectrum <game>` | No        |
| `--src`          | Root directory of your spectrum tape/disk images.                                                                                                                                                                                | `string`  |                                                          | Yes       |
| `--output`       | Destination directory and filename of your meta file.                                                                                                                                                                            | `string`  |                                                          | Yes       |
| `--assets`       | Destination directory of media assets.                                                                                                                                                                                           | `string`  | `same directory as --output`                             | No        |
| `--platform`     | Generate meta files for your chosen platform. Supported values: _pegasus_, _launchbox_. Defaults to pegasus.                                                                                                                     | `string`  | `pegasus`                                                | No        |
| `--clear`        | Clears the local api cache.                                                                                                                                                                                                      | `boolean` | `false`                                                  | No        |
| `-v, --verbose`  | Turn on debugging output.                                                                                                                                                                                                        | `boolean` | `false`                                                  | No        |
| `--verbose-save` | Saves the verbose log to the --output directory.                                                                                                                                                                                 | `boolean` | `false`                                                  | No        |
| `--audit-assets` | Assets will be audited for missing files, incorrectly ratio'd covers. (Comma-separated) valid values are _titles_, _screens_, and _covers_. Assets will be same directory as **--output** or via value supplied in **--assets**. | `string`  |                                                          | No        |
| `--move-failed`  | Specify a directory to move files that have not been found via the API                                                                                                                                                           | `string`  |                                                          | No        |
| `--version`      | Print version info.                                                                                                                                                                                                              | `boolean` | `false`                                                  | No        |
| `--help`         | Shows this help screen.                                                                                                                                                                                                          | `boolean` | `false`                                                  | No        |

---

## Examples

This is the most _basic usage_. **--src** will be recursively scanned for valid spectrum tape/disk images, and the file **~/Downloads/meta.txt** will be generated. If **~/Downloads/meta.txt** already exists it will be backed up in the format **~/Downloads/meta-_YYYYMMDDHHmmss_.txt**.
Assets will be downloaded to the same directory as **--output**, where a new directory called _assets_ will be created.

```bash
zxgenerator --src ~/Downloads/tapes --output '~/Downloads/meta.txt'
```

Same as _basic usage_ but assets will be downloaded to the directory specified as _--assets_, **~/Desktop/assets**.

```bash
zxgenerator --src ~/Downloads/tapes --output '~/Downloads/meta.txt' --assets '~/Desktop/assets'
```

Same as _basic usage_ but the generated metafile will launch games using **'/usr/bin/fuse {path_to_game}'**.

```bash
zxgenerator --src ~/Downloads/tapes --output '~/Downloads/meta.txt' --launch '/usr/bin/fuse'
```

Same as _basic usage_ but the generated metafile will be structured for usage in [launchbox](https://www.launchbox-app.com/).

```bash
zxgenerator --src ~/Downloads/tapes --output '~/Downloads/meta.txt' --platform 'launchbox'
```

A cache exists to prevent calling the APIs repeatedly on subsequent runs of the app. If you want to ensure the next time you run _zxgenerator_ uses the apis then run **--clear** first.

```bash
zxgenerator --clear
```

Same as _basic usage_ but with (very) verbose output.

```bash
zxgenerator --src ~/Downloads/tapes --output '~/Downloads/meta.txt' --verbose
```

Same as _basic usage_ but with (very) verbose output **AND** the verbose output is saved to a log file instead in the same directory as **--output**.

```bash
zxgenerator --src ~/Downloads/tapes --output '~/Downloads/meta.txt' --verbose --verbose-save
```

Audit your covers and screenshots directories (_~/Desktop/assets'_). This will check the images for valid or missing values, including prompting to allow you to download a new cover.

```bash
zxgenerator --src ~/Downloads/tapes --output '~/Downloads/meta.txt' --assets '~/Desktop/assets' --audit-assets covers,screens
```

---

## License

This project is licensed under the terms of the **ISC** license.
