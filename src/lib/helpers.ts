import chalk from 'chalk';
import { existsSync, statSync } from 'fs';
import { IIniObject } from 'js-ini/lib/interfaces/ini-object';
import { join, parse, ParsedPath } from 'path';
import { FoundGame, LogType, PromptValidInput } from '../types/app.js';
import { findCacheFileByGameMD5 } from './cache.js';
import { log } from './log.js';
import { gameByMD5 } from './request.js';

/**
 * Check if directory exists and is a directory
 * @param {string} path - Path
 * @returns {boolean}
 */
export const directoryExists = (path: string): boolean => {
    return existsSync(path) && statSync(path).isDirectory();
};

/**
 * Returns path to verbose log file
 * @returns {string}
 */
export const logFileLocation = (): string => {
    const date = new Date();
    const timestamp = date.getTime();

    return join(
        parse(globalThis.config.output || '').dir,
        `test-${timestamp}.log`
    );
};

/**
 * Creates a full URL for a download not hosted via zxinfo.dk
 * @param {string} path - Path
 * @returns {boolean}
 */
export const thirdPartyDownloadUrl = (path: string) => {
    if (path.toLowerCase().includes('/pub/sinclair')) {
        // Ye olde WOS archive, currently hosted on archive.org
        return (
            'https://ia600604.us.archive.org/view_archive.php?archive=/1/items/World_of_Spectrum_June_2017_Mirror/World of Spectrum June 2017 Mirror.zip&file=World of Spectrum June 2017 Mirror' +
            path.replace('/pub/sinclair', '/sinclair')
        );
    } else if (path.toLowerCase().includes('/zxdb/sinclair')) {
        return 'https://spectrumcomputing.co.uk' + path;
    }

    return '';
};

/**
 * Use asset on disk to find the game title
 * @param {ParsedPath} file - Asset parsed path
 * @returns {Promise<FoundGame | undefined>}
 */
export const gameTitleByAssetFile = async (
    file: ParsedPath
): Promise<FoundGame | undefined> => {
    const cache = findCacheFileByGameMD5(file.name);
    if (cache) {
        return {
            title: cache['game'] as string,
            hash: file.name,
            parsed: file,
        };
    } else {
        const game = await gameByMD5(
            file.name,
            join(file.dir, file.base),
            'tiny'
        );
        if (game instanceof Error) {
            log(LogType.Error, 'Assets', 'Audit Failure', { game });
        } else {
            return {
                title: game._source.title || '',
                hash: file.name,
                parsed: file,
            };
        }
    }
};

/**
 * Converts audit prompt array of objects into a string
 * @param {PromptValidInput[]} validInput - Prompt input config array
 * @param {string} promptText - Question prompt
 * @returns {string}
 */
export const generateAuditPrompt = (
    validInput: PromptValidInput[],
    promptText?: string
): string => {
    return `${chalk.green(
        promptText ? promptText : 'Based on the image preview, do you want to:'
    )}${validInput
        .map(
            (input, idx) =>
                `\n${chalk.cyan(
                    '(' +
                        input.letter +
                        (input.extra ? ' ' + input.extra : '') +
                        ')'
                )} ${input.label + (idx === validInput.length - 1 ? '?' : '')}`
        )
        .join('')}`;
};

/**
 * Checks if input exists in validInput array
 * @param {PromptValidInput[]} validInput - Prompt input config array
 * @param {string} value - Input value
 * @returns {boolean}
 */
export const validInputValue = (
    validInput: PromptValidInput[],
    value: string
): boolean => {
    return !!validInput.find(
        (input) =>
            input.letter === value || input.letter === value.toLowerCase()
    );
};

/**
 * Replaces any null/undefined values in cache object
 * @param {IIniObject} entry - Cache object
 * @returns {IIniObject}
 */
export const replaceUndefined = (entry: IIniObject): IIniObject => {
    for (const prop in entry) {
        entry[prop] = entry[prop] || '';
    }

    return entry;
};

/**
 * Dummy Progress Bar (for verbose debugging)
 */
export const dummyProgress = {
    Bar: () => {
        return {
            start: () => {},
            update: () => {},
            stop: () => {},
        };
    },
};
