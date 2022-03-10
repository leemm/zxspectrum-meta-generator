import { Game } from '../types/api.v3';
import { IIniObject } from 'js-ini/lib/interfaces/ini-object';
import { pegasusEntry, pegasusHeader } from './generators/pegasus';
import fs from 'fs';
import { log } from './log';
import { LogType } from '../types/app';

/**
 * Parses API game json into a smaller object
 * @param {Game} game - JSON result from API
 * @returns {IIniObject}
 */
export const embiggen = (game: Game): IIniObject => {
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
    };
};

/**
 * Save meta file to disk
 * @param {string[]} meta - Array of meta data ready to building meta file
 * @returns {boolean}
 */
export const save = (meta: string[]): boolean => {
    try {
        log(LogType.Info, 'Generate', 'Save', {
            value: globalThis.config.output,
        });

        if (globalThis.config.output) {
            if (fs.existsSync(globalThis.config.output)) {
                fs.unlinkSync(globalThis.config.output);
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
