import { IIniObject } from 'js-ini/lib/interfaces/ini-object';

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
summary: ${decodeURIComponent(entry['summary'] as string)}
description: ${decodeURIComponent(entry['description'] as string)}
rating: ${entry['rating']}
x-source: ${process.env.npm_package_name}
assets.titlescreen: ${entry['assets.titlescreen.local']}
assets.screenshot: ${entry['assets.screenshot.local']}
assets.boxFront: ${entry['assets.boxFront.local']}`;
};
