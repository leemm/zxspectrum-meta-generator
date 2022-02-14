import boxen from 'boxen';
import chalk from 'chalk';

// import { request } from './lib/request';
import { findGames } from './lib/files';

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

const start = async () => {
    // try {

    //     const results = await request('Fantasy World Dizzy');
    //     require('fs').writeFileSync('./result2.json', JSON.stringify(results.hits[0]._source, null, 4));

    // } catch (err) {
    //     console.error(err);
    // }

    const files = await findGames('/home/leemmcc/Downloads/tapes');
    console.log(files);
};

start();

//

//
