import axios from 'axios';
import * as APITypes from '../types/api.v3';
import { Hits } from '../types/api.v3';

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

//https://zxinfo.dk/media/zxscreens/0009335/FantasyWorldDizzy-load.png

/**
 * Return game from API, by ID
 * @param {string} id - API Entry ID
 * @returns {Promise<APITypes.IDHit>}
 */
export const gameByID = async (id: string): Promise<APITypes.IDHit> => {
    return axios({
        method: 'get',
        responseType: 'json',
        url: `${rootUrl}games/${id}?mode=compact`,
        headers: _defaultHeaders,
    }).then((res) => res?.data as APITypes.IDHit);
};

/**
 * Return game from API, by MD5 Hash
 * @param {string | undefined} hash - MD5 Hash
 * @returns {Promise<APITypes.IDHit>}
 */
export const gameByMD5 = async (
    hash: string | undefined
): Promise<APITypes.IDHit> => {
    return axios({
        method: 'get',
        responseType: 'json',
        url: `${rootUrl}filecheck/${hash}`,
        headers: _defaultHeaders,
    })
        .then((res) => res?.data as APITypes.MD5Result)
        .then((res) => gameByID(res.entry_id));
};
