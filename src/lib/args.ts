import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import chalk from 'chalk';
import path from 'path';
import { OptionDefinition, Config } from '../types/app';

export const validPlatforms = ['pegasus'];

const description =
    'Parse your tape/disk images and generate a metafile|for your emulator frontend using ZXInfo API';
const usage = 'Usage: `zxgenerator [options ...]`';

const header = ` __________________________________________________
| ___. __  _     __ . __                           |
| __\ ||  ||__|__|--|||                             |
| ZX Spectrum                                      |
|                                                  |        ${chalk.bold.underline(
    'APP_DISPLAY_NAME'
)}
| ________________________________________________ |
|/________________________________________________\ |
|  _   _   _   _   _   _   _   _   _   _           |
| ${chalk.bgGrey('[1]')} ${chalk.bgGrey('[2]')} ${chalk.bgGrey(
    '[3]'
)} ${chalk.bgGrey('[4]')} ${chalk.bgGrey('[5]')} ${chalk.bgGrey(
    '[6]'
)} ${chalk.bgGrey('[7]')} ${chalk.bgGrey('[8]')} ${chalk.bgGrey(
    '[9]'
)} ${chalk.bgGrey('[0]')}          |        ${description.split('|')[0]}
|     _   _   _   _   _   _   _   _   _   _        |        ${
    description.split('|')[1]
}
|    ${chalk.bgGrey('[Q]')} ${chalk.bgGrey('[W]')} ${chalk.bgGrey(
    '[E]'
)} ${chalk.bgGrey('[R]')} ${chalk.bgGrey('[T]')} ${chalk.bgGrey(
    '[Y]'
)} ${chalk.bgGrey('[U]')} ${chalk.bgGrey('[I]')} ${chalk.bgGrey(
    '[O]'
)} ${chalk.bgGrey('[P]')}      ${chalk.red('/')}|
|       _   _   _   _   _   _   _   _   _   _____${chalk.red(
    '/'
)}${chalk.yellow('/')}|
|      ${chalk.bgGrey('[A]')} ${chalk.bgGrey('[S]')} ${chalk.bgGrey(
    '[D]'
)} ${chalk.bgGrey('[F]')} ${chalk.bgGrey('[G]')} ${chalk.bgGrey(
    '[H]'
)} ${chalk.bgGrey('[J]')} ${chalk.bgGrey('[K]')} ${chalk.bgGrey(
    '[L]'
)} ${chalk.bgGrey('[ENTER]')}${chalk.green('/')}|        ${usage}
|  _____   _   _   _   _   _   _   _   __   ___${chalk.red('/')}${chalk.yellow(
    '/'
)}${chalk.green('/')}${chalk.cyan('/')}|
| ${chalk.bgGrey('[SHIFT]')} ${chalk.bgGrey('[Z]')} ${chalk.bgGrey(
    '[X]'
)} ${chalk.bgGrey('[C]')} ${chalk.bgGrey('[V]')} ${chalk.bgGrey(
    '[B]'
)} ${chalk.bgGrey('[N]')} ${chalk.bgGrey('[M]')} ${chalk.bgGrey(
    '[SS]'
)} ${chalk.bgGrey('[SPACE]')} |
|____________________________________________${chalk.red('/')}${chalk.yellow(
    '/'
)}${chalk.green('/')}${chalk.cyan('/')}__|
(__________________________________________________)`;

const optionDefinitions: OptionDefinition[] = [
    {
        name: 'launch',
        type: String,
        default:
            '/opt/retropie/supplementary/runcommand/runcommand.sh 0 _SYS_ zxspectrum',
        description:
            'Emulator/Script launch path. Game path is automatically added to the end of the process.',
    },
    {
        name: 'src',
        type: String,
        description: 'Root directory of your spectrum tape/disk images.',
    },
    {
        name: 'output',
        type: String,
        description: 'Destination directory and filename of your meta file.',
    },
    {
        name: 'assets',
        type: String,
        description:
            'Destination directory of media assets. Defaults to same directory as --output',
    },
    {
        name: 'platform',
        type: String,
        default: 'pegasus',
        description: `Shows this help message. Supported values: ${validPlatforms.join(
            ', '
        )}.`,
    },
    {
        name: 'clear',
        type: Boolean,
        defaultOption: false,
        description: 'Clears the local api cache.',
    },
    {
        name: 'verbose',
        alias: 'v',
        type: Boolean,
        defaultOption: false,
        description: 'Turn on debugging output.',
    },
    {
        name: 'version',
        type: Boolean,
        defaultOption: false,
        description: 'Print version info.',
    },
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        defaultOption: false,
        description: 'Shows this help message.',
    },
];

/**
 * Display help
 */
export const help = () => {
    const sections = [
        {
            content: header.replace(
                'APP_DISPLAY_NAME',
                globalThis.version.APP_DISPLAY_NAME
            ),
            raw: true,
        },
        {
            header: 'Options',
            optionList: optionDefinitions.map((option) => {
                return {
                    name: option.name,
                    alias: option.alias,
                    description:
                        option.description +
                        (option.default
                            ? ' Defaults to ' + option.default
                            : ''),
                };
            }),
        },
    ];

    console.log(commandLineUsage(sections));
};

/**
 * Display version
 */
export const version = () => {
    console.log(
        `${globalThis.version.APP_DISPLAY_NAME} v${globalThis.version.APP_DISPLAY_VERSION}\n`
    );
};

/**
 * Parse command line arguments
 * @returns {Config}
 */
export const init = (): Config => {
    try {
        const options = commandLineArgs(
            optionDefinitions.map((def) => {
                const newDef: commandLineArgs.OptionDefinition = { ...def };
                newDef.defaultValue = def.default;
                return newDef;
            })
        );

        if (!options['assets'] && options['output']) {
            options['assets'] = path.dirname(options['output']);
        }

        console.log('options', options);
        return options as Config;
    } catch (err) {
        console.error(
            `${chalk.bold(
                'Invalid switch supplied'
            )}. Valid options are ${chalk.italic(
                optionDefinitions
                    .map((opt) => {
                        return opt.name;
                    })
                    .join(', ')
            )}\n`
        );
        return {} as Config;
    }
};
