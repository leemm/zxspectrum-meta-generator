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
import { embiggen } from './lib/generate';

declare global {
    namespace NodeJS {
        interface Global {
            config: Config;
        }
    }
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
    const globalOptions = global as any;
    globalOptions.Config = initArgs();

    // Display help if requested
    if ((globalOptions.Config as Config).help) {
        help();
        process.exit();
    }

    // Display version if requested
    if ((globalOptions.Config as Config).version) {
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
    const check = validate(globalOptions.Config as Config);
    if (check) {
        console.error(check + '\n');
        process.exit(1);
    }

    // Parse files in supplied src directory
    const files = await findGames((globalOptions.Config as Config).src);

    // If files exist then let's find them in the api, via a cached version!
    if (files) {
        await Promise.all(
            files.map(async (file) => {
                try {
                    const cachedIniFile = loadCache(
                        file.path || '',
                        file.md5 || ''
                    );

                    if (!cachedIniFile) {
                        const processedImage: Game = await (
                            await gameByMD5(file.md5)
                        )._source;
                        processedImage._localPath = file.path;

                        const entry = embiggen(processedImage);

                        saveCache(entry, file.path || '', file.md5 || '');

                        console.log('cache not hit');
                    } else {
                        console.log(cachedIniFile);
                        console.log('cache hit');
                    }

                    // TO DO: WRITE TO CONFIG
                } catch (err) {
                    // TO DO: NOT FOUND
                }
            })
        );
    }

    process.exit();
};

start();
