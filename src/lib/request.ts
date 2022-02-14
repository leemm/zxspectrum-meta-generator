import axios, { AxiosPromise } from 'axios';
import * as APITypes from '../types/api.v3';
import { Hits } from '../types/api.v3';

const _defaultHeaders = {
    'User-Agent': 'Spectrum Pegasus Meta Generator',
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
 * @returns {AxiosPromise}
 */
export const request = (
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
        url: `https://api.zxinfo.dk/v3/search?${_propertiesToQS(all)}`,
        headers: _defaultHeaders,
    }).then((res) => res?.data?.hits as Hits);
};

//https://zxinfo.dk/media/zxscreens/0009335/FantasyWorldDizzy-load.png
