import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { dummyProgress } from './helpers.js';

/**
 * Loops each file in specified path and returns all spectrum games found
 * @param {string} status - Prefix for progress bar
 * @returns {any}
 */
export const progress = (status: string) => {
    return !globalThis.config.verbose
        ? new cliProgress.Bar({
              format: `${status} | ${chalk.cyan('{bar}')} | ${chalk.blueBright(
                  '{val}'
              )} | {percentage}% | {value}/{total} File(s)`,
              barCompleteChar: '\u2588',
              barIncompleteChar: '\u2591',
              hideCursor: true,
          })
        : dummyProgress.Bar();
};
