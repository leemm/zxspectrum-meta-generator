import boxen from 'boxen';
import chalk from 'chalk';
import { init as initArgs, help, version } from './lib/args';
import { Config } from './types/app';

// import { request } from './lib/request';
import { findGames } from './lib/files';
import { validate, tooling as toolingValidate } from './lib/validate';
import { gameByMD5 } from './lib/request';
import { Game } from './types/api.v3';

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

    // If files exist then let's find them in the api!
    let processedFiles: Game[] = [];
    if (files) {
        processedFiles = await Promise.all(
            files.map(async (file) => {
                try {
                    const game = await (await gameByMD5(file.md5))._source;
                    game._localPath = file.path;
                    game._md5 = file.md5;
                    return game;
                } catch (err) {
                    return await { _localPath: file.path, _md5: file.md5 };
                }
            })
        );
    }
    console.log(processedFiles);

    process.exit();
};

start();
