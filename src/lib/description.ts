import wiki from 'wikipedia';
import { Descriptions, LogType } from '../types/app.js';
import { sleep } from './helpers.js';
import { log } from './log.js';

/**
 * Query Wikipedia for game description
 * @param {string} title - Game name
 * @param {string} url - Page URL
 * @returns {Promise<Descriptions>}
 */
export const get = async (name: string, url: string): Promise<Descriptions> => {
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
