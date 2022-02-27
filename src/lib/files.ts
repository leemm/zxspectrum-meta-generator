import { getAllFilesSync } from 'get-all-files';
import { exec } from 'shelljs';
import { lookup } from 'mime-types';
import { parse, join } from 'path';
import os from 'os';
import fs from 'fs';
import { File } from '../types/app';
import { nanoid } from 'nanoid';
import md5 from 'md5';
import chalk from 'chalk';
import cliProgress from 'cli-progress';

const _archiveMimeTypes = [
    'application/zip',
    'application/x-7z-compressed',
    'application/x-rar-compressed',
    'application/vnd.rar',
    'application/x-gtar',
    'application/x-zip-compressed',
    'multipart/x-zip',
];

const _spectrumExtensions = [
    '.tap',
    '.tzx',
    '.slt',
    '.sna',
    '.dsk',
    '.fdi',
    '.trd',
    '.img',
    '.mgt',
    '.slx',
    '.dck',
    '.air',
    '.hdf',
    '.mdr',
    '.z80',
];

/**
 * Extract file if it is an archive and ensure it includes a spectrum game
 * @param {File} file - Root path of games  file: File
 * @returns {File}
 * @private
 */
const _extractArchiveAndCheckForValidFile = (file: File): File => {
    if (!file.isArchive) {
        // Create md5 hash
        file.md5 = file.md5 = md5(fs.readFileSync(file.path || ''));
    } else {
        // Create temp folder
        const extractFolder = `${os.tmpdir()}/${nanoid()}`;
        fs.mkdirSync(extractFolder, { recursive: true });

        // Extract archive via 7z command to temp folder
        const isWindoze = os.type().toLowerCase().includes('windows');
        exec(
            `7z${isWindoze ? '.exe' : ''} e "${
                file.path
            }" -o"${extractFolder}" -r -y > ${isWindoze ? 'NUL' : '/dev/null'}`
        );

        // Check if extracted files contains a valid extension
        const extractedFiles = fs.readdirSync(extractFolder);
        const validFile = extractedFiles.find((file) =>
            _spectrumExtensions.includes(parse(file).ext.toLowerCase())
        );

        // Create md5 hash
        if (validFile) {
            file.md5 = md5(fs.readFileSync(join(extractFolder, validFile)));
        }

        // Clean up
        fs.rmSync(extractFolder, { recursive: true, force: true });
    }

    return file;
};

/**
 * Loops each file in specified path and returns all spectrum games found
 * @param {string | undefined} path - Root path of games
 * @returns {File[]}
 */
export const findGames = async (
    path: string | undefined
): Promise<File[] | undefined> => {
    if (!path) {
        return;
    }

    const progress = new cliProgress.Bar({
        format: `Processing files | ${chalk.cyan('{bar}')} | ${chalk.blueBright(
            '{filename}'
        )} | {percentage}% | {value}/{total} File(s)`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
    });

    const filesInFolder = getAllFilesSync(path);
    progress.start(filesInFolder.toArray().length, 0, { filename: '' });

    let games: File[] = [];
    let idx = 0;

    for (const filename of filesInFolder) {
        idx++;

        const mime = lookup(filename) || '';

        let file: File = Object.assign({}, parse(filename), {
            path: filename,
            mimeType: mime,
            isArchive: _archiveMimeTypes.includes(mime.toLowerCase()),
        });

        progress.update(idx, { filename: file.name });

        file = _extractArchiveAndCheckForValidFile(file);

        //await new Promise((r) => setTimeout(r, 1000));

        games.push(file);
    }

    progress.stop();

    return games;
};
