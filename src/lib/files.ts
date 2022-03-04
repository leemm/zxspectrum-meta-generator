import { getAllFilesSync } from 'get-all-files';
import { exec } from 'shelljs';
import { lookup } from 'mime-types';
import { parse, join } from 'path';
import os from 'os';
import fs from 'fs';
import { File, LogType } from '../types/app';
import { nanoid } from 'nanoid';
import md5 from 'md5';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { log } from './log';
import { dummyProgress } from './helpers';

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
        log(LogType.Info, 'Files', `Not an archive`, { value: file.name });
    } else {
        // Create temp folder
        const extractFolder = `${os.tmpdir()}/${nanoid()}`;
        fs.mkdirSync(extractFolder, { recursive: true });

        log(LogType.Info, 'Files', `Extract path`, { value: extractFolder });

        // Extract archive via 7z command to temp folder
        const isWindoze = os.type().toLowerCase().includes('windows');
        const command = `7z${isWindoze ? '.exe' : ''} e "${
            file.path
        }" -o"${extractFolder}" -r -y > ${isWindoze ? 'NUL' : '/dev/null'}`;
        exec(command);

        log(LogType.Info, 'Files', `7z command`, { value: command });

        // Check if extracted files contains a valid extension
        const extractedFiles = fs.readdirSync(extractFolder);
        log(LogType.Info, 'Files', `Extracted Files`, {
            value: extractedFiles.join(', '),
        });

        const validFile = extractedFiles.find((file) =>
            _spectrumExtensions.includes(parse(file).ext.toLowerCase())
        );
        log(LogType.Info, 'Files', `Archive contains valid file?`, {
            value: validFile,
        });

        // Create md5 hash
        if (validFile) {
            file.md5 = md5(fs.readFileSync(join(extractFolder, validFile)));
            log(LogType.Info, 'Files', `Archived file`, {
                value: validFile,
                md5: file.md5,
            });
        }

        // Clean up
        fs.rmSync(extractFolder, { recursive: true, force: true });
        log(LogType.Info, 'Files', `Clean up extract path`);
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

    log(LogType.Info, 'Files', 'Progress bar init');
    let progress = !globalThis.config.verbose
        ? new cliProgress.Bar({
              format: `Processing files | ${chalk.cyan(
                  '{bar}'
              )} | ${chalk.blueBright(
                  '{filename}'
              )} | {percentage}% | {value}/{total} File(s)`,
              barCompleteChar: '\u2588',
              barIncompleteChar: '\u2591',
              hideCursor: true,
          })
        : dummyProgress.Bar();

    log(LogType.Info, 'Files', 'Read source folder');
    const filesInFolder = getAllFilesSync(path);
    log(LogType.Info, 'Files', `${filesInFolder.toArray().length} files found`);
    progress.start(filesInFolder.toArray().length, 0, { filename: '' });

    let games: File[] = [];
    let idx = 0;

    for (const filename of filesInFolder) {
        idx++;

        log(LogType.Info, 'Files', `Read ${filename}`);

        const mime = lookup(filename) || '';

        let file: File = Object.assign({}, parse(filename), {
            path: filename,
            mimeType: mime,
            isArchive: _archiveMimeTypes.includes(mime.toLowerCase()),
        });

        log(LogType.Info, 'Files', `Value`, { value: file });

        progress.update(idx, { filename: file.name });

        log(LogType.Info, 'Files', `Extract`, { value: file });
        file = _extractArchiveAndCheckForValidFile(file);

        games.push(file);
    }

    progress.stop();

    console.log('\n');

    return games;
};
