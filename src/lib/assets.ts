import path from 'path';
import fs from 'fs';
import { IIniObject } from 'js-ini/lib/interfaces/ini-object';
import { Game } from '../types/api.v3';
import { download } from './request';
import { directoryExists } from './helpers';
import { MediaFolders } from '../types/app';

const root = 'https://zxinfo.dk';

/**
 * Ensures local media asset directories exist
 * @private
 */
const _makeAssetDirectories = (): MediaFolders => {
    const titles = path.join(globalThis.config.assets || '', 'assets/titles'),
        screens = path.join(globalThis.config.assets || '', 'assets/screens');

    if (!directoryExists(titles)) {
        fs.mkdirSync(titles, { recursive: true });
    }

    if (!directoryExists(screens)) {
        fs.mkdirSync(screens, { recursive: true });
    }

    return {
        titles,
        screens,
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
    key: string
): Promise<IIniObject> => {
    if (!fs.existsSync(path)) {
        const url = root + '/media' + cachedIniFile[key]?.toString();
        console.log(`Downloading: ${url}`);

        if (!(await download(url, path))) {
            console.error(`Failed to download: ${url}`);
        } else {
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
    cachedIniFile: IIniObject
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

    return cachedIniFile;
};
