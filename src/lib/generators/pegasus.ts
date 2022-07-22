import { IIniObject } from 'js-ini/lib/interfaces/ini-object';
import fs from 'fs';
import {
    PegasusEntry,
    PegasusHeader,
    PegasusKeyValue,
    PegasusMetaFile,
} from '../../types/generators/pegasus';

export const validKeys = [
    'collection',
    'shortname',
    'command',
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
    'source',
    'x-hash',
    'x-source',
];

/**
 * Build Pegasus meta file header
 * @returns {string}
 */
export const pegasusHeader = (): string => {
    let newHeader = '';
    newHeader +=
        globalThis.existingData?.header?.collection?.length > 0
            ? `collection: ${globalThis.existingData?.header?.collection}\n`
            : 'collection: ZX Spectrum\n';
    newHeader +=
        globalThis.existingData?.header?.shortname?.length > 0
            ? `shortname: ${globalThis.existingData?.header?.shortname}\n`
            : 'shortname: zxspectrum\n';
    newHeader +=
        globalThis.existingData?.header?.command?.length > 0
            ? `command: ${globalThis.existingData?.header?.command}\n`
            : `command: ${globalThis.config.launch} "{file.path}"\n`;

    return newHeader;
};

/**
 * Build Pegasus meta file footer
 * @returns {string}
 */
export const pegasusFooter = (): string => {
    return ``;
};

/**
 * Converts IIniObject to a pegasus meta config
 * @param {IIniObject} entry - Final object
 * @param {boolean} decodeUri - Decode Summary and Description
 * @returns {string}
 */
export const pegasusEntry = (
    entry: IIniObject,
    decodeUri: boolean = true
): string => {
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
summary: ${
        entry['summary']
            ? decodeUri
                ? decodeURIComponent(entry['summary'] as string)
                : (entry['summary'] as string)
            : ''
    }
description: ${
        entry['description']
            ? decodeUri
                ? decodeURIComponent(entry['description'] as string)
                : (entry['description'] as string)
            : ''
    }
rating: ${entry['rating']}
assets.titlescreen: ${
        entry['assets.titlescreen.local'] || entry['assets.titlescreen'] || ''
    }
assets.screenshot: ${
        entry['assets.screenshot.local'] || entry['assets.screenshot'] || ''
    }
assets.boxFront: ${
        entry['assets.boxFront.local'] || entry['assets.boxFront'] || ''
    }
x-hash: ${entry['hash'] || entry['x-hash'] || ''}
x-source: ${globalThis.version.APP_DISPLAY_NAME}
`;
};

/**
 * Reads Pegasus meta file into array
 * @returns {PegasusMetaFile}
 */
export const pegasusMetaLoad = (): PegasusMetaFile | undefined => {
    if (globalThis.config.output) {
        if (fs.existsSync(globalThis.config.output)) {
            const lines = fs
                .readFileSync(globalThis.config.output, 'utf8')
                .split('\n');

            const header = _header(lines);
            const entries = _entries(lines, header.idx);

            return {
                header: header.header,
                entries,
            } as PegasusMetaFile;
        }
    }

    return;
};

/**
 * Converts Pegasus metafile object back to meta array needed for saving
 * @param {PegasusMetaFile} metaFile - Loaded Metafile
 * @returns {meta: string[]}
 */
export const pegasusMetaSaveToArray = (metaFile: PegasusMetaFile): string[] => {
    let meta: string[] = [];

    // Header
    let header = '';
    for (let key of Object.keys(metaFile.header || {})) {
        // @ts-ignore-line
        header += `${key}: ${metaFile.header[key]}\n`;
    }
    header += '\n';
    meta.push(header.substring(0, header.length - 1));

    // Entries
    for (let entry of metaFile.entries || []) {
        let entryObject: IIniObject = {};
        for (let key of Object.keys(entry || {})) {
            entryObject = Object.assign({}, entryObject, {
                // @ts-ignore-line
                [key]: Array.isArray(entry[key])
                    ? // @ts-ignore-line
                      entry[key].join(', ')
                    : // @ts-ignore-line
                      entry[key],
            });
        }

        meta.push(pegasusEntry(entryObject, false));
    }

    return meta;
};

/**
 * Return the header of the meta file
 * @param {string[]} lines - All lines of file
 * @returns {PegasusHeader}
 */
const _header = (lines: string[]): { header: PegasusHeader; idx: number } => {
    let endIndex = 0;

    let headerParts = [];
    let idx = 0;
    for (let line of lines) {
        if (line.trim().length === 0) {
            endIndex = idx;
            break;
        }
        headerParts.push(keyValue(idx, lines));
        idx++;
    }

    let header: PegasusHeader = {};
    headerParts.map((headerPart) => {
        header[headerPart.key as keyof PegasusHeader] = headerPart?.value;
    });

    return { header, idx: endIndex };
};

/**
 * Parse a line to a key value object
 * @param {number} idx - idx of current line
 * @param {string[]} lines - Lines of meta file
 * @returns {PegasusKeyValue}
 */
const keyValue = (idx: number, lines: string[]): PegasusKeyValue => {
    const line = lines[idx];
    if (line?.trim().length > 0 && !_isSubValue(line)) {
        const parts = line.split(':');

        let key = parts[0];
        let value = '';
        if (parts?.[1]?.trim().length > 0) {
            value = parts
                .map((part, idx) => {
                    return idx > 0 ? part : undefined;
                })
                .filter((part) => part !== undefined)
                .join(':')
                .trim();
        } else if (_isSubValue(lines[idx + 1])) {
            let hasValue = true;
            let subIdx = idx + 1;
            while (hasValue) {
                value = value + lines[subIdx].substring(2) + '|||';
                subIdx++;
                hasValue = _isSubValue(lines[subIdx]);
            }
        }

        // If key not in allowed list combine
        if (!validKeys.includes(key)) {
            key += value.trim().length > 0 ? ': ' + value : '';
        }

        return { key, value };
    }

    return { key: '', value: '' };
};

/**
 * Metafile game entries parser
 * @param {string[]} lines - Lines of meta file
 * @param {number} startIdx - idx of the starting point of the entries
 * @returns {PegasusEntry[]}
 */
const _entries = (lines: string[], startIdx: number): PegasusEntry[] => {
    let entries = [];
    let entryParts = [];
    let idx = 0;

    for (let line of lines) {
        idx++;

        if (idx > startIdx) {
            entryParts.push(keyValue(idx, lines));
        }

        if (line.includes('x-source:')) {
            const entry: PegasusEntry = {};

            entryParts
                .filter((entryPart) => entryPart.key.length > 0)
                .map((keyValue) => {
                    let val = keyValue.value.includes('|||')
                        ? keyValue.value.split('|||')
                        : keyValue.value;

                    if (Array.isArray(val)) {
                        val = val.slice(0, -1);
                    }

                    // @ts-ignore:next-line
                    entry[keyValue.key as keyof PegasusEntry] = val;
                });
            entries.push(entry);
            entryParts = [];
        }
    }

    return entries;
};

/**
 * If the value for the key is on another line
 * @param {string} line - Individual line
 * @returns {boolean}
 */
const _isSubValue = (line: string): boolean => {
    return (
        line.length > 2 &&
        line.substring(0, 2) == '  ' &&
        line.substring(2, 3) != ' '
    );
};
