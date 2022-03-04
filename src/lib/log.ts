import createLogger from 'logging';
import chalk from 'chalk';
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
