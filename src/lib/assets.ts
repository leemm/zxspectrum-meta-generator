import path from 'path';
import fs from 'fs';
import { IIniObject } from 'js-ini/lib/interfaces/ini-object';
import { Game } from '../types/api.v3';
import { download } from './request';
import { directoryExists, thirdPartyDownloadUrl } from './helpers';
import { Descriptions, LogType, MediaFolders } from '../types/app';
import { log } from './log';

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
