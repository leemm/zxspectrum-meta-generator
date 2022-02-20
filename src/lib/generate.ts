import { Game } from '../types/api.v3';
import { IIniObject } from 'js-ini/lib/interfaces/ini-object';
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
 * Build Pegasus meta file header
 * @returns {string}
 */
export const pegasusHeader = (): string => {
    return `collection: ZX Spectrum
shortname: zxspectrum
command: ${globalThis.config.launch} "{file.path}"`;
};

/**
 * Converts IIniObject to a pegasus meta config
 * @param {IIniObject} entry - Final object
 * @returns {string}
 */
export const pegasusEntry = (entry: IIniObject): string => {
    return `game: ${entry['game']}
file: ${entry['file']}
developers: 
${(entry['developers'] as string)
    .split(', ')
    .map((i) => '  ' + i)
    .join('\n')}
publishers: 
${(entry['publishers'] as string)
    .split(', ')
    .map((i) => '  ' + i)
    .join('\n')}
genre: ${entry['genre']}
players: ${entry['players']}
summary:
description:
rating: ${entry['rating']}
x-source: ${process.env.npm_package_name}`;
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

// Pegasus
// game	Creates a new game with the value as title. The properties after this line will modify this game. This is a required field.	T
// sort-by	An alternate title that should be used for sorting. Can be useful when the title contains eg. roman numerals or special symbols. sort_title and sort_name are also accepted.	T
// file, files	The file or list of files (eg. disks) that belong to this game. Paths can be either absolute or relative to the metadata file. If there are multiple files, you'll be able to select which one to launch when you start the game.
// developer, developers	The developer or list of developers. This field can appear multiple times.
// publisher, publishers	The publisher or list of publishers. This field can appear multiple times.
// genre, genres	The genre or list of genres (for example Action, Adventure, etc.). This field can appear multiple times.
// tag, tags	Tag or list of tags (for example Co-op, VR, etc.). This field can appear multiple times.
// summary	A short description of the game in one paragraph.	T
// description	A possibly longer description of the game.	T
// players	The number of players who can play the game. Either a single number (eg. 2) or a number range (eg. 1-4).	T
// release	The date when the game was released, in YYYY-MM-DD format (eg. 1985-05-22). Month and day can be omitted if unknown (eg. 1985-05 or 1985 alone is also accepted).	T
// rating	The rating of the game, in percentages. Either an integer percentage in the 0-100% range (eg. 70%), or a fractional value between 0 and 1 (eg. 0.7).	T
// launch	If this game must be launched differently than the others in the same collection, a custom launch command can be defined for it.	T
// command	An alternate name for launch. Use whichever you prefer.	T
// workdir	The working directory in which the game is launched. Defaults to the directory of the launched program.	T
// cwd	An alternate name for workdir. Use whichever you prefer.	T
