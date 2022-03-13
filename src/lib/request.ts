import axios from 'axios';
import fs from 'fs';
import * as APITypes from '../types/api.v3.js';
import { Hits } from '../types/api.v3.js';
import { LogType } from '../types/app.js';
import { log } from './log.js';

const rootUrl = 'https://api.zxinfo.dk/v3/';
const _defaultHeaders = {
    'User-Agent': 'zxspectrum-frontend-meta-generator',
};

/**
 * Convert APITypes.APISearch to Querystring, for the request
 * @param {APISearch} [query] - Search parameters
 * @returns {string}
 * @private
 */
const _propertiesToQS = (query: APITypes.APISearch): string => {
    let qs = '';
    let key: keyof typeof query;
    for (key in query) {
        qs += '&' + key + '=' + query[key];
    }
    return qs.length > 0 ? qs.substring(1) : qs;
};

/**
 * Convert APITypes.APISearch to Querystring, for the request
 * @param {string} query - Game to search for
 * @param {APISearch} [parameters] - Overwrite default search paramters
 * @returns {Promise<Hits>}
 */
export const search = async (
    query: string,
    parameters?: APITypes.APISearch
): Promise<Hits> => {
    const defaults: APITypes.APISearch = {
        query: encodeURIComponent(query),
        mode: 'compact',
        size: 25,
        offset: 0,
        sort: APITypes.APISort.relDesc,
        machinetype: 'ZXSPECTRUM',
        contenttype: APITypes.APIContentType.software,
    };

    const all = Object.assign({}, defaults, parameters);

    return axios({
        method: 'get',
        responseType: 'json',
        url: `${rootUrl}search?${_propertiesToQS(all)}`,
        headers: _defaultHeaders,
    }).then((res) => res?.data?.hits as Hits);
};

/**
 * Return game from API, by ID
 * @param {string} id - API Entry ID
 * @param {string} mode - API mode
 * @returns {Promise<APITypes.IDHit>}
 */
export const gameByID = async (
    id: string,
    mode: string = 'full'
): Promise<APITypes.IDHit> => {
    return axios({
        method: 'get',
        responseType: 'json',
        url: `${rootUrl}games/${id}?mode=${mode}`,
        headers: _defaultHeaders,
    }).then((res) => res?.data as APITypes.IDHit);
};

/**
 * Return game from API, by MD5 Hash
 * @param {string | undefined} hash - MD5 Hash
 * @param {string | undefined} filename - Filename
 * @param {string} mode - API mode
 * @returns {Promise<APITypes.IDHit>}
 */
export const gameByMD5 = async (
    hash: string | undefined,
    filename: string | undefined,
    mode: string = 'full'
): Promise<APITypes.IDHit | Error> => {
    return axios({
        method: 'get',
        responseType: 'json',
        url: `${rootUrl}filecheck/${hash}`,
        headers: _defaultHeaders,
    })
        .then((res) => res?.data as APITypes.MD5Result)
        .then((res) => gameByID(res.entry_id, mode))
        .catch((err: Error) => {
            return new Error(
                `${err.message}, ${filename},  ${rootUrl}filecheck/${hash}`
            );
        });
};

/**
 * Stream remote file to disk
 * @param {string} url - Remote location of file
 * @param {path} path - Location to save to on disk
 * @returns {boolean}
 */
export const download = async (url: string, path: string): Promise<boolean> => {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }

    await new Promise((r) => setTimeout(r, 100));

    try {
        await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            headers: _defaultHeaders,
        }).then(function (response) {
            const writer = fs.createWriteStream(path);

            return new Promise((resolve, reject) => {
                response.data.pipe(writer);
                let error: Error;

                writer.on('error', (err) => {
                    error = err;
                    writer.close();

                    log(LogType.Error, 'Assets', 'Failed', { err });
                    reject(err);
                });

                writer.on('close', () => {
                    if (!error) {
                        resolve(true);
                    }
                });
            });
        });

        return true;
    } catch (err) {
        return false;
    }
};
