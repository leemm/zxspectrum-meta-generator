import path from 'path';
import chalk from 'chalk';
import { which } from 'shelljs';
import { Config } from '../types/app';
import { validPlatforms } from './args';
import { directoryExists } from './helpers';

/**
 * Validate tools to ensure they're set up
 * @returns {string | undefined}
 */
export const tooling = (): string | undefined => {
    if (!which('7z')) {
        return '7z not found in PATH, please refer to README to install.';
    }
    return;
};

/**
 * Validate config to ensure all required arguments have been supplied and are valid
 * @param {Config} config - Parse arguments object
 * @returns {string | undefined}
 */
export const validate = (config: Config): string | undefined => {
    if (config.platform && !validPlatforms.includes(config.platform)) {
        return `${chalk.bold(
            'Supplied platform is invalid or is not supported.'
        )} Supported: ${validPlatforms.join(', ')}.`;
    }

    if (config.src && !directoryExists(config.src)) {
        return `Supplied ${chalk.italic(
            'src'
        )} does not exist or is not a directory.`;
    }

    const saveLocation = config.output ? path.parse(config.output) : null;
    if (saveLocation?.dir && !directoryExists(saveLocation?.dir)) {
        return `Supplied ${chalk.italic(
            'output'
        )} directory does not exist or is not a directory.`;
    }

    if (config.assets && !directoryExists(config.assets)) {
        return `Supplied ${chalk.italic(
            'assets'
        )} does not exist or is not a directory.`;
    }

    return;
};
