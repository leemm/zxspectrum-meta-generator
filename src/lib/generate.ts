import { Game } from '../types/api.v3';
import { IIniObject } from 'js-ini/lib/interfaces/ini-object';
import fs from 'fs';
import path from 'path';
import timestamp from 'time-stamp';
import { log } from './log.js';
import { LogType, MetaFile } from '../types/app.js';

import {
    pegasusEntry,
    pegasusHeader,
    pegasusMetaLoad,
    pegasusMetaSaveToArray,
} from './generators/pegasus.js';
import { PegasusEntry } from '../types/generators/pegasus';

const validKeys = [
    'game',
    'file',
    'rating',
    'summary',
    'description',
    'release',
    'developers',
    'publishers',
    'genre',
    'players',
    'wikipedia',
    'mobygames',
    'assets.titlescreen',
    'assets.titlescreen.size',
    'assets.screenshot',
    'assets.screenshot.size',
    'assets.boxFront',
    'assets.boxFront.size',
    'hash',
];

/**
 * Parses API game json into a smaller object
 * @param {Game} game - JSON result from API
 * @param {string} hash - File MD5 hash
 * @returns {IIniObject}
 */
export const embiggen = (game: Game, hash: string): IIniObject => {
    const loadingScreen =
            game.screens?.find((screen) => screen.type === 'Loading screen') ||
            {},
        runningScreen =
            game.screens?.find((screen) => screen.type === 'Running screen') ||
            {},
        boxArt =
            game.additionalDownloads?.find(
                (download) => download.type === 'Inlay - Front'
            ) || {},
        wikipedia =
            game.relatedLinks?.find(
                (link) => link.siteName?.toLowerCase() === 'wikipedia'
            ) || {},
        mobyGames =
            game.relatedLinks?.find(
                (link) => link.siteName?.toLowerCase() === 'mobygames'
            ) || {};

    log(LogType.Info, 'Generate', 'Embiggen', { value: game.title });

    return {
        game: game.title || '',
        file: game._localPath || '',
        rating: ((game.score?.score || 0) * 10).toFixed() + '%',
        summary: '',
        description: '',
        release: game.originalYearOfRelease?.toString() || '',
        developers: (game.authors ?? [])
            .filter((author) => author.type === 'Creator')
            .map((author) => author.name as string)
            .join(', '),
        publishers: (game.publishers ?? [])
            .filter((publisher) => publisher.publisherSeq === 1)
            .map((publisher) => publisher.name)
            .join(', '),
        genre: game.genre ?? '',
        players: game.numberOfPlayers ?? '',
        wikipedia: wikipedia?.url || '',
        mobygames: mobyGames?.url || '',
        ['assets.titlescreen']: loadingScreen?.url || '',
        ['assets.titlescreen.size']: loadingScreen?.size || 0,
        ['assets.screenshot']: runningScreen?.url || '',
        ['assets.screenshot.size']: runningScreen?.size || 0,
        ['assets.boxFront']: boxArt?.path || '',
        ['assets.boxFront.size']: boxArt?.size || 0,
        hash: hash,
    };
};

/**
 * Description can run across multiple lines, and function fixes it
 * @param {PegasusEntry[]} entries - Meta file entries
 */
const _fixDescription = (entries: PegasusEntry[]) => {
    entries.map((entry) => {
        let found = false;

        Object.keys(entry).forEach((key) => {
            if (found) {
                if (!validKeys.includes(key)) {
                    entry.description += '\n' + key;
                }
            }
            if (key === 'description' && (entry[key] as string).length > 0) {
                found = true;
            }
        });
    });
};

/**
 * Load meta file from disk
 * @returns {MetaFile}
 */
export const load = (): MetaFile | undefined => {
    let metaFile: MetaFile = {};

    if (globalThis.config.platform === 'pegasus') {
        const pegasusMeta = pegasusMetaLoad();

        if (pegasusMeta && pegasusMeta?.entries) {
            //console.log('pegasusMeta', JSON.stringify(pegasusMeta, null, 4));
            _fixDescription(pegasusMeta?.entries);

            metaFile = {
                header: pegasusMeta.header,
                entries: pegasusMeta.entries,
                images: {
                    covers: [],
                    screens: [],
                    titles: [],
                },
            };

            for (let entry of pegasusMeta?.entries) {
                metaFile.images?.covers.push(
                    entry['assets.boxFront'] as string
                );
                metaFile.images?.screens.push(
                    entry['assets.screenshot'] as string
                );
                metaFile.images?.screens.push(
                    entry['assets.titlescreen'] as string
                );
            }

            return metaFile;
        }
    }

    return;
};

/**
 * Save MetaFile object back to disk
 * @param {MetaFile} metaFile - Loaded Metafile
 * @returns {boolean}
 */
export const saveMetaFile = (metaFile: MetaFile): boolean => {
    try {
        if (globalThis.config.platform === 'pegasus') {
            log(LogType.Info, 'Generate', 'Save', {
                value: globalThis.config.output,
            });

            const meta = pegasusMetaSaveToArray({
                header: metaFile.header,
                entries: metaFile.entries,
            });

            return save(meta, true);
        }

        return false;
    } catch (err) {
        log(LogType.Error, 'Generate', 'Error', { err });
        return false;
    }
};

/**
 * Save meta file to disk
 * @param {string[]} meta - Array of meta data ready to building meta file
 * @param {boolean} withBackup - Create a backup before replacement
 * @returns {boolean}
 */
export const save = (meta: string[], withBackup: boolean): boolean => {
    try {
        log(LogType.Info, 'Generate', 'Save', {
            value: globalThis.config.output,
        });

        if (globalThis.config.output) {
            if (fs.existsSync(globalThis.config.output)) {
                if (withBackup) {
                    const parts = path.parse(globalThis.config.output);
                    fs.renameSync(
                        globalThis.config.output,
                        path.join(
                            parts.dir,
                            `${parts.name}-${timestamp('YYYYMMDDHHmmss')}${
                                parts.ext
                            }`
                        )
                    );
                } else {
                    fs.rmSync(globalThis.config.output);
                }
            }
            fs.writeFileSync(globalThis.config.output, meta.join('\n\n'), {
                encoding: 'utf8',
            });
            return true;
        }
        return false;
    } catch (err) {
        log(LogType.Error, 'Generate', 'Error', { err });
        return false;
    }
};

export interface Generators {
    pegasusEntry: Function;
    pegasusHeader: Function;
}

export const Generators = {
    pegasusEntry,
    pegasusHeader,
};
