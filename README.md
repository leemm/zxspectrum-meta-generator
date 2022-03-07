# ZX Spectrum Frontend Meta Generator

--verbose -v
--emulator /usr/test/cake
--roms /usr/roms
--output /usr/cake

<h1 align="center">ZX Spectrum Frontend Meta Generator</h1>

<p align="center">Create your <b>metadata</b> for your favourite emulator <b>backend</b> using the ZXInfo API<br/><br/>Fast, efficient, modern... just like Windows 98<sup>tm</sup></p>

[![GitHub Issues](https://img.shields.io/github/issues/leemm/zxspectrum-meta-generator.svg)](https://github.com/leemm/zxspectrum-meta-generator/issues) [![Current Version](https://img.shields.io/badge/version-0.4.4-green.svg)](https://github.com/leemm/zxspectrum-meta-generator)

![Preview](https://i.imgur.com/rJj1i0n.gif)

---

## Features

-   Uses [ZXInfo API](https://api.zxinfo.dk/v3/)
-   Command Line application
-   Progress Bars that range from 0 to 100%!
-   Supports all known spectrum roms, such as the TOSEC set
-   Supports Linux, MacOS, and Windows
-   Supports arm, so can be used on RaspberryPI (under linux e.h. RaspOS)
-   Supports image assets such as screenshots and box art
-   Uses Wikipedia API to find synopsis for game, if available
-   ~~Generates for multiple emulator frontends~~ (currently only supports [Pegasus](https://pegasus-frontend.org/))
-   A lovely [48k Speccy ASCII art](https://github.com/redcode/ASCII-Art/) from https://github.com/redcode/ASCII-Art/
-   Other features coming at some point in the future

---

## Install

TBC

---

## Usage

```bash
zxgenerator [OPTIONS]
```

| Option           | Description                                                                                   | Type      | Default                                                  | Required? |
| ---------------- | --------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------- | --------- |
| `--launch`       | Emulator/Script launch path. Game path is automatically added to the end of the process.      | `string`  | `<retropiepath>/runcommand.sh 0 _SYS_ zxspectrum <game>` | No        |
| `--src`          | Root directory of your spectrum tape/disk images.                                             | `string`  |                                                          | Yes       |
| `--output`       | Destination directory and filename of your meta file.                                         | `string`  |                                                          | Yes       |
| `--assets`       | Destination directory of media assets.                                                        | `string`  | `same as --output`                                       | No        |
| `--platform`     | Generate meta files for your chosen platform. Supported values: pegasus. Defaults to pegasus. | `string`  | `pegasus`                                                | No        |
| `--clear`        | Clears the local api cache.                                                                   | `boolean` | `false`                                                  | No        |
| `-v, --verbose`  | Turn on debugging output.                                                                     | `boolean` | `false`                                                  | No        |
| `--verbose-save` | Saves the verbose log to the --output directory.                                              | `boolean` | `false`                                                  | No        |
| `--version`      | Print version info.                                                                           | `boolean` | `false`                                                  | No        |
| `--help`         | Shows this help screen.                                                                       | `boolean` | `false`                                                  | No        |

---

## License

This project is licensed under the terms of the **ISC** license.
