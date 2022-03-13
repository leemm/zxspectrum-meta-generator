import boxen from 'boxen';
import chalk from 'chalk';
import { init as initArgs, help, version } from './lib/args.js';
import { Config, LogType, Version } from './types/app.js';
import { init as initCache } from './lib/cache.js';
import { attachFSLogger, log } from './lib/log.js';

import { findGames } from './lib/files.js';
import { validate, tooling as toolingValidate } from './lib/validate.js';
import { gameByMD5 } from './lib/request.js';
import { Game } from './types/api.v3.js';
import { clear, load as loadCache, save as saveCache } from './lib/cache.js';
import { embiggen, save as saveMeta, Generators } from './lib/generate.js';
import { audit, save as saveAssets } from './lib/assets.js';
import { get as descriptions } from './lib/description.js';

import { version as versionInfo } from './lib/version.js';
import { logFileLocation } from './lib/helpers.js';
import { progress } from './lib/progress.js';

declare global {
    var config: Config;
    var version: Version;
    var logPath: string;
}

globalThis.version = versionInfo;

const start = async () => {
    // Parse arguments
    globalThis.config = initArgs();
    if (
        Object.keys(globalThis.config).length === 2 &&
        Object.keys(globalThis.config).includes('launch') &&
        Object.keys(globalThis.config).includes('platform')
    ) {
        process.exit(1);
    }

    // console stdout also written to log file
    if (globalThis.config['verbose-save']) {
        global.logPath = logFileLocation();
        log(LogType.Info, 'Log File', 'Created', { value: global.logPath });
        attachFSLogger(global.logPath);
    }

    // Validate required tooling
    log(LogType.Info, 'Tools', 'Validate');
    const checkTooling = toolingValidate();
    if (checkTooling) {
        log(
            LogType.Error,
            'Tools',
            'Validation Error',
            new Error(checkTooling)
        );
        console.error(checkTooling + '\n');
        process.exit(1);
    }

    log(LogType.Info, 'Cache', 'Init');
    initCache();

    // Audit already downloaded assets
    if (globalThis.config['audit-assets'] || ''.length > 0) {
        await audit();
        process.exit(1);
    }

    log(LogType.Info, 'Config', 'Value', globalThis.config);

    // Display help if requested
    if (globalThis.config.help) {
        log(LogType.Info, 'Help', 'Display');
        help();
        process.exit();
    }

    // Clear local cache if requested
    if (globalThis.config.clear) {
        log(LogType.Warn, 'Cache', 'Local cache now cleared');
        await clear();
        process.exit();
    }

    // Display version if requested
    if (globalThis.config.version) {
        log(LogType.Info, 'Version', 'Display');
        version();
        process.exit();
    }

    log(LogType.Info, 'Output', 'Header');
    // Header
    if (!globalThis.config.verbose) {
        console.log(
            boxen(
                `${chalk.magenta(
                    globalThis.version.APP_DISPLAY_NAME
                )} ${chalk.cyan('v' + globalThis.version.APP_DISPLAY_VERSION)}`,
                {
                    padding: 1,
                    margin: 1,
                    borderStyle: 'round',
                }
            )
        );
    }

    // Validate arguments
    log(LogType.Info, 'Arguments', 'Validate');
    const check = validate(globalThis.config);
    if (check) {
        log(
            LogType.Error,
            'Arguments',
            'Validation error',
            new Error(checkTooling)
        );
        console.error(check + '\n');
        process.exit(1);
    }

    // Parse files in supplied src directory
    const files = await findGames(globalThis.config.src);

    // Track files that can't be found
    const failedFiles: string[] = [];

    // If files exist then let's find them in the api, via a cached version, and build the output!
    let meta: string[] = [];

    if (files) {
        let bar = progress('2/2: Searching API');
        bar.start(files.length, 0, { val: '' });

        const generateHeader: keyof Generators = ((globalThis.config.platform ||
            '') + 'Header') as keyof Generators;
        // @ts-ignore-line
        meta.push(Generators[generateHeader]());

        await Promise.all(
            files.map(async (file, idx) => {
                bar.update(idx + 1, { val: file.base });
                try {
                    let cachedIniFile = loadCache(
                        file.path || '',
                        file.md5 || ''
                    );

                    if (!cachedIniFile) {
                        log(LogType.Info, 'Cache', 'No cache available');

                        const result = await gameByMD5(
                            file.md5,
                            file.name + file.ext
                        );
                        if (result instanceof Error) {
                            throw result;
                        }

                        let processedFile: Game = result._source;
                        processedFile._localPath = file.path;

                        cachedIniFile = embiggen(processedFile);

                        // Find a description (if available)
                        const desc = await descriptions(
                            processedFile.title || '',
                            (cachedIniFile['wikipedia'] as string) || ''
                        );
                        cachedIniFile['summary'] = desc.summary || '';
                        cachedIniFile['description'] = desc.description || '';

                        if (desc.description?.length || 0 > 0) {
                            log(
                                LogType.Info,
                                'Description',
                                'Description found',
                                desc
                            );
                        } else {
                            log(
                                LogType.Info,
                                'Description',
                                'Description not found'
                            );
                        }

                        // Download remote assets
                        cachedIniFile = await saveAssets(
                            file.md5 || '',
                            cachedIniFile,
                            desc
                        );

                        // Save cached data to disk
                        await saveCache(
                            cachedIniFile,
                            file.path || '',
                            file.md5 || ''
                        );
                    } else {
                        log(LogType.Info, 'Cache', 'Loaded', cachedIniFile);
                    }

                    const generateEntry: keyof Generators = ((globalThis.config
                        .platform || '') + 'Entry') as keyof Generators;
                    // @ts-ignore-line
                    meta.push(Generators[generateEntry](cachedIniFile));
                } catch (err) {
                    failedFiles.push(
                        file.path?.replace(globalThis.config.src || '', '') ||
                            ''
                    );
                    log(LogType.Error, 'Process File', 'Fatal Error', { err });
                }
            })
        );

        bar.stop();

        console.log('\n');
    }

    if (!saveMeta(meta)) {
        if (!globalThis.config.verbose) {
            console.error(
                'Error saving meta file, check you have permission to write to the directory.'
            );
        }
        process.exit(1);
    }

    if (!globalThis.config.verbose) {
        console.log(
            `${chalk.green('Success!')} File created at ${chalk.gray.italic(
                globalThis.config.output
            )}, containing ${
                chalk.green(meta.length - failedFiles.length) +
                ' file' +
                (meta.length - failedFiles.length !== 1 ? 's' : '')
            }\n`
        );
        console.log(
            `${chalk.red(
                'Failed!'
            )} These files have not been found, or are not valid spectrum dumps: ${failedFiles
                .map((file) => chalk.italic.grey(file))
                .join(', ')}\n`
        );
    }

    log(LogType.Info, 'Complete', 'Generated', {
        value: globalThis.config.output,
    });
    log(LogType.Error, 'Failed', 'Not found or invalid', {
        value: failedFiles.join(', '),
    });

    if (globalThis.config['verbose-save']) {
        log(LogType.Info, 'Log File', 'Saved to:', { value: global.logPath });
    }

    process.exit();
};

start();
