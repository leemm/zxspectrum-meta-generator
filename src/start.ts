import boxen from 'boxen';
import chalk from 'chalk';
import { init as initArgs, help, validate, version } from './lib/args';
import { Config } from './types/app';

// import { request } from './lib/request';
import { findGames } from './lib/files';

declare global {
    namespace NodeJS {
        interface Global {
            config: Config;
        }
    }
}

const start = async () => {
    // try {
    //     const results = await request('Fantasy World Dizzy');
    //     require('fs').writeFileSync('./result2.json', JSON.stringify(results.hits[0]._source, null, 4));
    // } catch (err) {
    //     console.error(err);
    // }
    // const files = await findGames('/home/leemmcc/Downloads/tapes');
    // console.log(files);

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
        process.exit();
    }
};

start();
