import wiki from 'wikipedia';
import { Descriptions, LogType } from '../types/app.js';
import { log } from './log.js';

/**
 * Query Wikipedia for game description
 * @param {string} title - Game name
 * @param {string} url - Page URL
 * @returns {Promise<Descriptions>}
 */
export const get = async (name: string, url: string): Promise<Descriptions> => {
    let ret: Descriptions = {};

    let title = name;

    if (url?.length > 0) {
        const xx = new URL(url);
        title = decodeURIComponent(
            xx.pathname.split('/')[xx.pathname.split('/').length - 1]
        );
    }

    await new Promise((r) => setTimeout(r, 50)); // Dummy timeout to help with wikipedia api

    log(
        LogType.Info,
        'Description',
        'Querying Wikipedia for game description, summary',
        { value: title }
    );

    try {
        const page = await wiki.page(title),
            summary = await page.summary();

        if (!summary.extract.substring(0, 50).includes('may refer to')) {
            ret.summary = encodeURIComponent(summary.extract);
            ret.description = encodeURIComponent(await page.intro());
            ret.boxart = summary.originalimage.source;
        }
    } catch (err) {
        log(LogType.Error, 'Description', 'Error', { err });
    }

    return ret;
};
