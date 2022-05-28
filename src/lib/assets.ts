import path from 'path';
import fs from 'fs';
import { IIniObject } from 'js-ini/lib/interfaces/ini-object';
import { download } from './request.js';
import { load as loadMetafile, saveMetaFile } from './generate.js';
import {
    directoryExists,
    gameTitleByAssetFile,
    generateAuditPrompt,
    thirdPartyDownloadUrl,
    validInputValue,
} from './helpers.js';
import {
    Descriptions,
    FoundGame,
    LogType,
    MediaFolders,
    MetaFile,
    PromptNewImage,
} from '../types/app.js';
import { log } from './log.js';
import chalk from 'chalk';
import sizeOf from 'image-size';
import terminalImage from 'terminal-image';
import promptly from 'promptly';
import open from 'open';
import boxen from 'boxen';
import { findCacheFileByGameMD5, save as saveCache } from './cache.js';

const root = 'https://zxinfo.dk';

/**
 * Ensures local media asset directories exist
 * @private
 */
const _makeAssetDirectories = (): MediaFolders => {
    const titles = path.join(globalThis.config.assets || '', 'assets/titles'),
        screens = path.join(globalThis.config.assets || '', 'assets/screens'),
        covers = path.join(globalThis.config.assets || '', 'assets/covers');

    if (!directoryExists(titles)) {
        log(LogType.Info, 'Assets', 'Create directory', { value: titles });
        fs.mkdirSync(titles, { recursive: true });
    }

    if (!directoryExists(screens)) {
        log(LogType.Info, 'Assets', 'Create directory', { value: screens });
        fs.mkdirSync(screens, { recursive: true });
    }

    if (!directoryExists(covers)) {
        log(LogType.Info, 'Assets', 'Create directory', { value: covers });
        fs.mkdirSync(covers, { recursive: true });
    }

    return {
        titles,
        screens,
        covers,
    };
};

/**
 * @param {IIniObject} cachedIniFile - Current cache meta for this game
 * @param {string} path - Save path
 * @param {string} key - cachedIniFile key
 * @returns {Promise<IIniObject>}
 * @private
 */
const _downloadSpecificFile = async (
    cachedIniFile: IIniObject,
    path: string,
    key: string,
    url?: string
): Promise<IIniObject> => {
    if (!fs.existsSync(path)) {
        if (!url) {
            url = root + '/media' + cachedIniFile[key]?.toString();
        }

        log(LogType.Info, 'Assets', 'Download', { value: url });

        if (await download(url, path)) {
            cachedIniFile[key + '.local'] = path;
        }
    } else {
        cachedIniFile[key + '.local'] = path;
    }

    return cachedIniFile;
};

/**
 * Download assets via API and stream to disk
 * @param {string} md5 - File hash
 * @param {IIniObject} cachedIniFile - Current cache meta for this game
 * @returns {Promise<IIniObject>}
 */
export const save = async (
    md5: string,
    cachedIniFile: IIniObject,
    desc: Descriptions
): Promise<IIniObject> => {
    const assets = _makeAssetDirectories();

    if (cachedIniFile['assets.titlescreen']) {
        const ext = path.extname(
            cachedIniFile['assets.titlescreen']?.toString() || ''
        );
        const loadingScreenPath = path.join(assets.titles || '', md5 + ext);

        cachedIniFile = await _downloadSpecificFile(
            cachedIniFile,
            loadingScreenPath,
            'assets.titlescreen'
        );
    }

    if (cachedIniFile['assets.screenshot']) {
        const ext = path.extname(
            cachedIniFile['assets.screenshot']?.toString() || ''
        );
        const screenshotPath = path.join(assets.screens || '', md5 + ext);

        cachedIniFile = await _downloadSpecificFile(
            cachedIniFile,
            screenshotPath,
            'assets.screenshot'
        );
    }

    // If boxart is missing try to get it from a different source
    if (desc.boxart) {
        const ext = path.extname(desc.boxart);
        const boxartPath = path.join(assets.covers || '', md5 + ext);

        cachedIniFile = await _downloadSpecificFile(
            cachedIniFile,
            boxartPath,
            'assets.boxFront',
            desc.boxart
        );
    }

    if (cachedIniFile['assets.boxFront'] && !desc.boxart) {
        const ext = path.extname(
            cachedIniFile['assets.boxFront']?.toString() || ''
        );
        const boxartPath = path.join(assets.covers || '', md5 + ext);

        const url = thirdPartyDownloadUrl(
            cachedIniFile['assets.boxFront'] as string
        );

        cachedIniFile = await _downloadSpecificFile(
            cachedIniFile,
            boxartPath,
            'assets.boxFront',
            url
        );
    }

    return cachedIniFile;
};

/**
 * Replace local file
 * @param {FoundGame | string} foundGame - Existing game or just title
 * @param {PromptNewImage} value - File info
 * @param {string} imageFullPath - Path of existing image
 * @returns {Promise<PromptNewImage>}
 */
const imageReplace = async (
    foundGame: FoundGame | string,
    value: PromptNewImage,
    imageFullPath: string
): Promise<string> => {
    const parts = path.parse(value.value);

    let downloadPath = imageFullPath;
    if (path.extname(imageFullPath).length === 0) {
        downloadPath += path.extname(value.value);
    }

    // If copying local file
    if (value.isFile) {
        if (fs.existsSync(downloadPath)) {
            fs.rmSync(downloadPath);
        }

        fs.copyFileSync(value.value, downloadPath);

        log(LogType.Info, 'Assets', 'Audit Game cover replace', {
            game: typeof foundGame === 'string' ? foundGame : foundGame?.title,
            hash: typeof foundGame === 'string' ? parts.name : foundGame?.hash,
            value: value.value,
            path: downloadPath,
        });
    } else if (value.isUrl) {
        if (await download(value.value, downloadPath)) {
            log(LogType.Info, 'Assets', 'Audit Game cover replace', {
                game:
                    typeof foundGame === 'string'
                        ? foundGame
                        : foundGame?.title,
                hash:
                    typeof foundGame === 'string'
                        ? parts.name
                        : foundGame?.hash,
                value: value.value,
                path: downloadPath,
            });
        }
    }

    return downloadPath;
};

/**
 * Update the new image in the games' local cache file
 */
const updateImageInCacheFile = async (
    hash: string,
    imageFullPath: string,
    currentImageType: string
) => {
    const cache = findCacheFileByGameMD5(hash);

    let updateKey = '';
    switch (currentImageType) {
        case 'covers':
            updateKey = 'assets.boxFront.local';
            break;
        case 'titles':
            updateKey = 'assets.titlescreen.local';
            break;
        case 'screens':
            updateKey = 'assets.screenshot.local';
            break;
    }

    log(LogType.Info, 'Cache', 'Save', {
        key: updateKey,
        value: imageFullPath,
    });

    if (cache) {
        cache[updateKey] = imageFullPath;

        // Save cached data to disk
        await saveCache(cache, cache['file'] as string, hash, true);
    }
};

/**
 * Prompt for replace of asset, by either local path or remote url
 * @returns {Promise<PromptNewImage>}
 */
const imageReplacePrompt = async (): Promise<PromptNewImage> => {
    return (await promptly.prompt(chalk.cyan('Path or URL:'), {
        validator: (value: string) => {
            try {
                const url = new URL(value);
                return {
                    value: value,
                    isUrl: true,
                    isFile: false,
                };
            } catch (err) {
                const pa = path.parse(value);
                if (pa.dir.length === 0) {
                    // invalid path on any OS
                    throw new Error(chalk.red('\nNot a valid URL or path\n'));
                } else {
                    return {
                        value: value,
                        isUrl: false,
                        isFile: true,
                    };
                }
            }
        },
    })) as unknown as PromptNewImage;
};

/**
 * Prompt for issue with cover image
 * @param {FoundGame} foundGame - Existing game
 * @param {string} imageFullPath - Path of image
 * @returns {Promise<string>}
 */
const coverImagePrompt = async (
    foundGame: FoundGame,
    imageFullPath: string
): Promise<string> => {
    console.log(
        `\nThe cover for ${chalk.cyan(
            foundGame.title
        )} isn't portrait.\n${chalk.gray.italic(imageFullPath)}\n`
    );

    console.log(
        await terminalImage.file(imageFullPath, {
            height: 10,
        })
    );

    const validInput = [
        { letter: 'a', label: 'Open image before deciding' },
        { letter: 'b', label: 'Open browser and search for image' },
        {
            letter: 'c',
            label: 'Replace image with local path or remote url',
        },
        {
            letter: 'd',
            extra: 'or return',
            label: 'Keep existing image',
        },
    ];

    return await promptly.prompt(generateAuditPrompt(validInput), {
        default: 'd',
        validator: (value: string) => {
            if (!validInputValue(validInput, value)) {
                throw new Error(chalk.red('\nInvalid selection!\n'));
            } else {
                log(LogType.Info, 'Assets', 'Audit Game cover', {
                    game: foundGame?.title,
                    hash: foundGame?.hash,
                    value: 'Ignoring file change',
                    path: imageFullPath,
                });
            }

            return value.toLowerCase();
        },
    });
};

/**
 * Prompt for missing asset
 * @param {string} title - Game title
 * @param {string} imageFullPath - Path of image
 * @param {string} aud - Either covers, themes, or screens
 * @returns {Promise<string>}
 */
const missingImagePrompt = async (
    title: string,
    imageFullPath: string,
    aud: string
): Promise<string> => {
    console.log(
        `\nThe ${aud.substring(0, aud.length - 1)} for ${chalk.cyan(
            title
        )} is missing.\n`
    );

    const validInput = [
        { letter: 'a', label: 'Open browser and search for image' },
        {
            letter: 'b',
            label: 'Replace image with local path or remote url',
        },
        {
            letter: 'c',
            extra: 'or return',
            label: 'Ignore',
        },
    ];

    return await promptly.prompt(
        generateAuditPrompt(validInput, 'What do you want to?:'),
        {
            default: 'c',
            validator: (value: string) => {
                if (!validInputValue(validInput, value)) {
                    throw new Error(chalk.red('\nInvalid selection!\n'));
                } else {
                    log(LogType.Info, 'Assets', 'Audit Game cover', {
                        game: title,
                        value: 'Ignoring file change',
                        path: imageFullPath,
                    });
                }

                return value.toLowerCase();
            },
        }
    );
};

/**
 * Audit all assets using defined rules. Prompts for new files
 */
export const audit = async () => {
    const assets = _makeAssetDirectories();
    const verbose = globalThis.config.verbose;

    console.log(
        boxen(
            chalk.red(
                `WARNING: AUDITING MAY ONLY WORK WITH META FILES CREATED WITH THIS TOOL\n\nIgnoring this warning could result in lost data\n\nA backup of the metafile will be made`
            ),
            {
                align: 'center',
                padding: 1,
                margin: 1,
                borderStyle: 'double',
                borderColor: 'red',
            }
        )
    );

    const toAudit = (globalThis.config['audit-assets'] || '').split(',');

    const foundGames: FoundGame[] = [];

    for await (let aud of toAudit) {
        // Part 1. Check current images

        // @ts-ignore-line
        const current = assets[aud];

        if (current) {
            log(LogType.Info, 'Assets', 'Audit', { value: current });
            if (!verbose) {
                console.log(`Auditing ${chalk.gray.italic(current)}`);
            }

            const files = fs
                .readdirSync(current)
                .map((file) => path.parse(path.join(current, file)));

            for await (const file of files) {
                // If game is not known by foundGames then search for a local
                // cache. If local cache not found search via api
                let foundGame = foundGames.find(
                    (game) =>
                        game.hash === file.name && game.parsed.dir === current
                );
                if (!foundGame) {
                    foundGame = await gameTitleByAssetFile(file);
                    if (foundGame) {
                        log(LogType.Info, 'Assets', 'Audit Game', foundGame);
                        foundGames.push(foundGame as FoundGame);
                    }
                }

                // Now that game is found
                if (foundGame) {
                    const imageFullPath = path.join(
                        foundGame.parsed.dir,
                        foundGame.parsed.base
                    );
                    const dimensions = await sizeOf(imageFullPath);

                    const div =
                        ((dimensions.height || 0) / (dimensions.width || 0)) *
                        100;

                    // If cover isn't in portrait
                    if (aud == 'covers' && div < 100) {
                        log(
                            LogType.Info,
                            'Assets',
                            'Audit Game cover dimensions',
                            {
                                game: foundGame.title,
                                hash: foundGame.hash,
                                value: dimensions,
                                path: imageFullPath,
                            }
                        );

                        let readyToContinue = false;

                        while (!readyToContinue) {
                            const imagePrompt = await coverImagePrompt(
                                foundGame,
                                imageFullPath
                            );

                            // So, what do we do now we have a selection?
                            switch (imagePrompt) {
                                case 'a':
                                    await open(imageFullPath, { wait: true });
                                    break;
                                case 'b':
                                    console.log(
                                        `Copy the _url_ of the image to the clipboard and chose ${chalk.cyan(
                                            '(c)'
                                        )}`
                                    );
                                    await open(
                                        `https://www.google.com/search?q=zx+spectrum+game+cover+${foundGame.title}&tbm=isch`
                                    );
                                    break;
                                case 'c':
                                    const fileValue =
                                        await imageReplacePrompt();

                                    await imageReplace(
                                        foundGame,
                                        fileValue,
                                        imageFullPath
                                    );

                                    readyToContinue = true;

                                    break;
                                case 'd':
                                    readyToContinue = true;
                                    break;
                            }
                        }
                    }
                }
            }
        }

        // Part 2. Check Metafile for missing images

        const metaFile = loadMetafile();

        if (metaFile && metaFile.header && metaFile.entries) {
            for (let entry of metaFile.entries) {
                if (
                    (entry['assets.boxFront'].length === 0 &&
                        aud === 'covers') ||
                    (entry['assets.titlescreen'].length === 0 &&
                        aud === 'titles') ||
                    (entry['assets.screenshot'].length === 0 &&
                        aud === 'screens')
                ) {
                    log(
                        LogType.Info,
                        'Assets',
                        `Audit Game ${aud.substring(
                            0,
                            aud.length - 1
                        )} missing`,
                        {
                            game: entry.game,
                            hash: entry['x-hash'],
                        }
                    );

                    let imageFullPath = path.join(
                        current || '',
                        entry['x-hash']
                    );

                    let readyToContinue = false;

                    while (!readyToContinue) {
                        const imagePrompt = await missingImagePrompt(
                            entry.game,
                            imageFullPath,
                            aud
                        );

                        // So, what do we do now we have a selection?
                        switch (imagePrompt) {
                            case 'a':
                                console.log(
                                    `Copy the _url_ of the image to the clipboard and chose ${chalk.cyan(
                                        '(b)'
                                    )}`
                                );
                                await open(
                                    `https://www.google.com/search?q=zx+spectrum+game+${entry.game}&tbm=isch`
                                );
                                break;
                            case 'b':
                                const fileValue = await imageReplacePrompt();

                                imageFullPath = await imageReplace(
                                    entry.game,
                                    fileValue,
                                    imageFullPath
                                );

                                if (aud === 'covers') {
                                    entry['assets.boxFront'] = imageFullPath;
                                }
                                if (aud === 'titles') {
                                    entry['assets.titlescreen'] = imageFullPath;
                                }
                                if (aud === 'screens') {
                                    entry['assets.screenshot'] = imageFullPath;
                                }

                                await updateImageInCacheFile(
                                    entry['x-hash'],
                                    imageFullPath,
                                    aud
                                );

                                readyToContinue = true;

                                break;
                            case 'c':
                                readyToContinue = true;
                                break;
                        }

                        saveMetaFile(metaFile);
                    }
                }
            }
        }
    }
};
