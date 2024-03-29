import boxen from 'boxen';
import chalk from 'chalk';
import { init as initArgs, help, version } from './lib/args.js';
import {
    Config,
    GenericFile,
    LogType,
    MetaFile,
    Version,
} from './types/app.js';
import { attachFSLogger, log } from './lib/log.js';

import { findGames, moveUnfound } from './lib/files.js';
import { validate, tooling as toolingValidate } from './lib/validate.js';
import { gameByMD5 } from './lib/request.js';
import { load as loadMetafile } from './lib/generate.js';
import { Game } from './types/api.v3.js';
import {
    embiggen,
    save as saveMeta,
    Generators,
    saveFailedFilesLog,
} from './lib/generate.js';
import { audit, save as saveAssets } from './lib/assets.js';
import { get as descriptions } from './lib/description.js';

import { version as versionInfo } from './lib/version.js';
import { logFileLocation } from './lib/helpers.js';
import { progress } from './lib/progress.js';
import { IIniObject } from 'js-ini/lib/interfaces/ini-object.js';
import { IGDB } from './types/igdb.js';

declare global {
    var config: Config;
    var version: Version;
    var logPath: string;
    var existingData: MetaFile | undefined;
    var igdb: IGDB;
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

    // console stdout also written to log file
    globalThis.igdb = {
        clientId: globalThis.config['twitch-client-id'] ?? '',
        clientSecret: globalThis.config['twitch-client-secret'] ?? '',
    };

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

    // Display version if requested
    if (globalThis.config.version) {
        log(LogType.Info, 'Version', 'Display');
        version();
        process.exit();
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

    // Track success of files
    const successFiles: GenericFile[] = [];
    const failedFiles: GenericFile[] = [];

    // If files exist then let's find them in the api and build the output!
    let meta: string[] = [];

    if (files) {
        let bar = progress('2/2: Searching API');
        bar.start(files.length, 0, { val: '' });

        // Load existing metafile (if exists)
        globalThis.existingData = loadMetafile();

        const generateHeader: keyof Generators = ((globalThis.config.platform ||
            '') + 'Header') as keyof Generators;
        // @ts-ignore-line
        const header = Generators[generateHeader]();
        if (header?.length > 0) {
            meta.push(header);
        }

        let unsortedFiles: IIniObject[] = [];
        let idx = -1;
        for (const file of files) {
            idx++;
            bar.update(idx + 1, { val: file.base });
            try {
                const result = await gameByMD5(file.md5, file.name + file.ext);
                if (result instanceof Error) {
                    throw result;
                }

                let processedFile: Game = result._source;
                processedFile._localPath = file.path;

                let iniFile = embiggen(processedFile, file.md5 || '');

                // Find a description (if available)
                const desc = await descriptions(
                    processedFile.title || '',
                    (iniFile['wikipedia'] as string) || ''
                );
                iniFile['summary'] = desc.summary || iniFile['summary'] || '';
                iniFile['description'] =
                    desc.description || iniFile['description'] || '';

                if (desc.description?.length || 0 > 0) {
                    log(LogType.Info, 'Description', 'Description found', desc);
                } else {
                    log(LogType.Info, 'Description', 'Description not found');
                }

                // Download remote assets
                iniFile = await saveAssets(file.md5 || '', iniFile, desc);

                unsortedFiles.push(iniFile);

                successFiles.push({
                    path:
                        file.path?.replace(globalThis.config.src || '', '') ||
                        '',
                    md5: file.md5 ?? '',
                });
            } catch (err) {
                failedFiles.push({
                    path:
                        file.path?.replace(globalThis.config.src || '', '') ||
                        '',
                    md5: file.md5 ?? '',
                });
                log(LogType.Error, 'Process File', 'Fatal Error', { err });
            }
        }

        bar.stop();

        // Sort by game title
        unsortedFiles = unsortedFiles.sort((file1, file2) => {
            if (
                file1['game']?.toString().toLowerCase().replace('the ', '') >
                file2['game']?.toString().toLowerCase().replace('the ', '')
            )
                return 1;
            if (
                file1['game']?.toString().toLowerCase().replace('the ', '') <
                file2['game']?.toString().toLowerCase().replace('the ', '')
            )
                return -1;
            return 0;
        });

        // Add files to meta ready for saving
        for (const iniFile of unsortedFiles) {
            const generateEntry: keyof Generators = ((globalThis.config
                .platform || '') + 'Entry') as keyof Generators;

            //@ts-ignore-line
            meta.push(Generators[generateEntry](iniFile));
        }

        const generateFooter: keyof Generators = ((globalThis.config.platform ||
            '') + 'Footer') as keyof Generators;
        // @ts-ignore-line
        const footer = Generators[generateFooter]();
        if (footer?.length > 0) {
            meta.push(footer);
        }

        console.log('\n');
    }

    if (!saveMeta(meta, true)) {
        if (!globalThis.config.verbose) {
            console.error(
                'Error saving meta file, check you have permission to write to the directory.'
            );
        }
        process.exit(1);
    }

    if (!globalThis.config.verbose) {
        if (successFiles.length > 0) {
            console.log(
                `${chalk.green('Success!')} File created at ${chalk.gray.italic(
                    globalThis.config.output
                )}, containing ${
                    chalk.green(successFiles.length) +
                    ' file' +
                    (successFiles.length !== 1 ? 's' : '')
                }\n`
            );
        }
        if (failedFiles.length > 0) {
            console.log(
                `${chalk.red(
                    'Failed!'
                )} These files have not been found, or are not valid spectrum dumps: ${failedFiles
                    .map((file) => chalk.italic.grey(file.path))
                    .join(', ')}\n`
            );
        }
    }

    log(LogType.Info, 'Complete', 'Generated', {
        value: globalThis.config.output,
    });
    log(LogType.Error, 'Failed', 'Not found or invalid', {
        value: failedFiles.map((file) => file.path).join(', '),
    });

    saveFailedFilesLog(failedFiles);
    moveUnfound(failedFiles);

    if (globalThis.config['verbose-save']) {
        log(LogType.Info, 'Log File', 'Saved to:', { value: global.logPath });
    }

    process.exit();
};

start();
