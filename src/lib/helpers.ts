import { existsSync, statSync } from 'fs';
import { join, parse } from 'path';

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
