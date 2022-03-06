import createLogger from 'logging';
import chalk from 'chalk';
import fs from 'fs';
import { LogType } from '../types/app';

const loggers: createLogger.Logger[] = [];

/**
 * Log entry to console (verbose)
 * @param {string} feature - Log feature (prefix)
 * @param {string} message - Log value
 * @param {any | Error | undefined} [payload] - Debug object
 */
export const log = (
    logType: LogType,
    feature: string,
    message: string,
    payload?: any | Error | undefined
) => {
    if (globalThis.config.verbose === true) {
        let logger = createLogger(feature);
        if (!loggers.includes(logger)) {
            logger = loggers.find((l) => l == logger) || logger;
        }

        const func: keyof createLogger.LoggerFunction = logger[
            logType
        ] as keyof createLogger.LoggerFunction;

        if (payload) {
            // @ts-ignore-line
            func(feature, chalk.gray(message), payload);
        } else {
            // @ts-ignore-line
            func(feature, chalk.gray(message));
        }
    }
};

/**
 * Ensure console.x is also sent to log file
 * @param {string} path - Log file path
 */
export const attachFSLogger = (path: string) => {
    const old = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
    };

    const fsLog = fs.createWriteStream(path, {
        flags: 'a',
    });

    Object.keys(old).map((prop) => {
        // @ts-ignore-line
        console[prop] = (...messages) => {
            // @ts-ignore-line
            old[prop].apply(console, messages);
            fsLog.write(
                messages.join(' ').replace(/\033\[[0-9;]*m/g, '') + '\n'
            );
        };
    });
};
