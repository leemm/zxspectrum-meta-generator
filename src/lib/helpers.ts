import { existsSync, statSync } from 'fs';

/**
 * Check if directory exists and is a directory
 * @param {string} path - Path
 * @returns {boolean}
 */
export const directoryExists = (path: string): boolean => {
    return existsSync(path) && statSync(path).isDirectory();
};
