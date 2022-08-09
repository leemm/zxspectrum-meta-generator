import wiki from 'wikipedia';
import axios, { AxiosRequestConfig } from 'axios';
import { Descriptions, LogType } from '../types/app.js';
import { sleep } from './helpers.js';
import { log } from './log.js';
import { Platform, Game, TokenReponse } from '../types/igdb.js';

/**
 * Query Wikipedia for game description
 * @param {string} title - Game name
 * @param {string} url - Page URL
 * @returns {Promise<Descriptions>}
 */
const wikipedia = async (name: string, url: string): Promise<Descriptions> => {
    let ret: Descriptions = {};

    if (url?.length > 0) {
        const xx = new URL(url);
        let title = decodeURIComponent(
            xx.pathname.split('/')[xx.pathname.split('/').length - 1]
        );

        await sleep(0.5);

        log(
            LogType.Info,
            'Description',
            'Querying Wikipedia for game description, summary',
            { value: title }
        );

        try {
            const page = await wiki.page(title),
                summary = await page.summary(),
                description = await page.intro();

            const titleIsVideoGames = summary.description
                ?.toLowerCase()
                .includes('video game');
            const isWikipediaLinksPage = summary.extract
                ?.substring(0, 50)
                .includes('may refer to');

            if (!isWikipediaLinksPage && titleIsVideoGames) {
                ret.summary = encodeURIComponent(summary.extract);
                ret.description = encodeURIComponent(description);
                ret.boxart = summary.originalimage.source;
            }
        } catch (err) {
            log(LogType.Error, 'Description', 'Error', { err });
        }
    }

    return ret;
};

const igdbr = async (
    name: string,
    ret: Descriptions
): Promise<Descriptions> => {
    log(
        LogType.Info,
        'Description',
        'Querying IGDB.com for game description, summary',
        { value: name }
    );

    try {
        // Get access token
        if (
            !globalThis.igdb.accessToken &&
            globalThis.igdb.clientId.length > 0 &&
            globalThis.igdb.clientSecret.length > 0
        ) {
            const accessTokenResponse = await axios({
                method: 'post',
                headers: {
                    Accept: 'application/json',
                },
                responseType: 'json',
                url: `https://id.twitch.tv/oauth2/token?client_id=${globalThis.igdb.clientId}&client_secret=${globalThis.igdb.clientSecret}&grant_type=client_credentials`,
            });

            const accessToken = accessTokenResponse.data as TokenReponse;
            globalThis.igdb.accessToken = accessToken.access_token;

            log(LogType.Info, 'Description', 'Got Twitch accessToken', {
                value: name,
            });
        }

        const requestOptions: AxiosRequestConfig = {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Client-ID': globalThis.igdb.clientId,
                Authorization: `Bearer ${globalThis.igdb.accessToken}`,
            },
            responseType: 'json',
        };

        // Get platform id for zxspectrum (and home computers)
        if ((globalThis.igdb.platformIds ?? []).length === 0) {
            const platformsRequestOptions = {
                ...requestOptions,
                url: 'https://api.igdb.com/v4/platforms',
                data: `fields id, name; where name ~ *"spectrum" | name ~ *"cpc" | name ~ *"amiga" | name ~ *"ste" | name ~ *"c64/128"; sort name asc;`,
            };

            const response = await axios(platformsRequestOptions);
            globalThis.igdb.platformIds = response.data as Platform[];

            log(LogType.Info, 'Description', 'Get IGDB.com platform ids', {
                value: name,
            });

            sleep(0.5);
        }

        const searchRequestOptions = {
            ...requestOptions,
            url: 'https://api.igdb.com/v4/games',
            data: `fields name, storyline, summary; where ${globalThis.igdb?.platformIds
                ?.map((id) => `platforms = ${id.id}`)
                .join(' | ')}; search "${name}";`,
        };

        const response = await axios(searchRequestOptions);
        const gameData: Game =
            response.data?.length > 0 ? response.data?.[0] : {};

        log(
            LogType.Info,
            'Description',
            'Get IGDB.com description/synopsis data',
            {
                value: name,
            }
        );

        sleep(0.5);

        ret.summary = ret.summary || gameData.summary;
        ret.description =
            ret.description || gameData.storyline || gameData.summary;
    } catch (err) {
        log(LogType.Error, 'Description (IGDB.com)', 'Error', { err });
    }

    return ret;
};

/**
 * Query for game description
 * 1/ Go to Wikipedia first
 * 2/ If not found AND twitch client/secret supplied then query IGBD
 * @param {string} title - Game name
 * @param {string} url - Page URL
 * @returns {Promise<Descriptions>}
 */
export const get = async (name: string, url: string): Promise<Descriptions> => {
    let ret: Descriptions = await wikipedia(name, url);

    ret = await igdbr(name, ret);

    return ret;
};
