import boxen from 'boxen';
import chalk from 'chalk';
import { init as initArgs, help, version } from './lib/args';
import { Config } from './types/app';
import './lib/cache';

// import { request } from './lib/request';
import { findGames } from './lib/files';
import { validate, tooling as toolingValidate } from './lib/validate';
import { gameByMD5 } from './lib/request';
import { Game } from './types/api.v3';
import { load as loadCache, save as saveCache } from './lib/cache';
import {
    embiggen,
    pegasusEntry,
    pegasusHeader,
    save as saveMeta,
} from './lib/generate';

declare global {
    var config: Config;
}

const start = async () => {
    // try {
    //     const results = await search('Fantasy World Dizzy');
    //     require('fs').writeFileSync('./result2.json', JSON.stringify(results.hits[0]._source, null, 4));
    // } catch (err) {
    //     console.error(err);
    // }

    // Validate required tooling
    const checkTooling = toolingValidate();
    if (checkTooling) {
        console.error(checkTooling + '\n');
        process.exit(1);
    }

    // Parse arguments
    globalThis.config = initArgs();
    if (Object.keys(globalThis.config).length === 0) {
        process.exit(1);
    }

    // Display help if requested
    if (globalThis.config.help) {
        help();
        process.exit();
    }

    // Display version if requested
    if (globalThis.config.version) {
        version();
        process.exit();
    }

    // Header
    console.log(
        boxen(
            `${chalk.magenta(process.env.npm_package_name)} ${chalk.cyan(
                'v' + process.env.npm_package_version
            )}`,
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
            }
        )
    );

    // Validate arguments
    const check = validate(globalThis.config);
    if (check) {
        console.error(check + '\n');
        process.exit(1);
    }

    // Parse files in supplied src directory
    const files = await findGames(globalThis.config.src);

    // If files exist then let's find them in the api, via a cached version, and build the output!
    let meta = [];
    if (files) {
        meta.push(pegasusHeader());

        await Promise.all(
            files.map(async (file) => {
                try {
                    let cachedIniFile = loadCache(
                        file.path || '',
                        file.md5 || ''
                    );

                    if (!cachedIniFile) {
                        const processedImage: Game = await (
                            await gameByMD5(file.md5)
                        )._source;
                        processedImage._localPath = file.path;

                        cachedIniFile = embiggen(processedImage);

                        saveCache(
                            cachedIniFile,
                            file.path || '',
                            file.md5 || ''
                        );

                        console.log('cache not hit');
                    } else {
                        console.log(cachedIniFile);
                        console.log('cache hit');
                    }

                    meta.push(pegasusEntry(cachedIniFile));
                } catch (err) {
                    // TO DO: NOT FOUND
                }
            })
        );
    }

    if (!saveMeta(meta)) {
        console.error(
            'Error saving meta file, check you have permission to write to the directory.'
        );
        process.exit(1);
    }

    process.exit();
};

start();
