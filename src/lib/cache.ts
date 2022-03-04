import fs from 'fs';
import path from 'path';
import getAppDataPath from 'appdata-path';
import { parse, stringify } from 'js-ini';
import md5 from 'md5';
import del from 'del';
import { directoryExists } from './helpers';
import { IIniObject } from 'js-ini/lib/interfaces/ini-object';
import { log } from './log';
import { LogType } from '../types/app';

let config: string;

/**
 * Init caching
 */
export const init = () => {
    config = path.join(
        getAppDataPath(),
        '/',
        globalThis.version.APP_DISPLAY_NAME ?? ''
    );

    if (!directoryExists(config)) {
        fs.mkdirSync(config, { recursive: true });
    }
};

/**
 * Load ini cache for specific game
 * @param {string} gamePath - Path of tape/disk image
 * @param {string} hash - Md5 hash of tape/disk image
 * @returns {IIniObject}
 */
export const load = (
    gamePath: string,
    hash: string
): IIniObject | undefined => {
    const pathMd5 = md5(gamePath);
    const gameConfigPath = path.join(config, `${pathMd5}-${hash}.ini`);

    if (fs.existsSync(gameConfigPath)) {
        try {
            log(LogType.Info, 'Cache', 'Load', { value: gameConfigPath });

            const cache = fs.readFileSync(gameConfigPath, 'utf-8');
            return parse(cache);
        } catch (err) {
            log(LogType.Error, 'Cache', 'Error', { err });
            return;
        }
    }
    return;
};

/**
 * Save ini cache for specific game
 * @param {Game} game - Path of tape/disk image
 * @returns {boolean}
 */
export const save = async (
    entry: IIniObject,
    gamePath: string,
    hash: string
): Promise<boolean> => {
    const gameConfigPath = path.join(config, `${md5(gamePath)}-${hash}.ini`);

    if (fs.existsSync(gameConfigPath)) {
        await del(config, { force: true });
        fs.mkdirSync(config, { recursive: true });
    }

    try {
        fs.writeFileSync(gameConfigPath, stringify(entry), {
            encoding: 'utf8',
        });

        log(LogType.Info, 'Cache', 'Save', { value: gameConfigPath });
        return true;
    } catch (err) {
        log(LogType.Error, 'Cache', 'Save failed', err);

        return false;
    }
};

/**
 * Completely remove local cache. Upon running again, the app will use the API.
 */
export const clear = async () => {
    return del(config, { force: true });
};
