import { Game } from '../types/api.v3';
import { IIniObject } from 'js-ini/lib/interfaces/ini-object';
import { pegasusEntry, pegasusHeader } from './generators/pegasus';
import fs from 'fs';

/**
 * Parses API game json into a smaller object
 * @param {Game} game - JSON result from API
 * @returns {IIniObject}
 */
export const embiggen = (game: Game): IIniObject => {
    return {
        game: game.title || '',
        file: game._localPath || '',
        rating: ((game.score?.score || 0) * 10).toFixed() + '%',
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
    };
};

/**
 * Save meta file to disk
 * @param {string[]} meta - Array of meta data ready to building meta file
 * @returns {boolean}
 */
export const save = (meta: string[]): boolean => {
    try {
        console.log('globalThis.config.output', globalThis.config.output);
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
