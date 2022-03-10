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
