import wiki from 'wikipedia';
import { Descriptions, LogType } from '../types/app';
import { log } from './log';

/**
 * Query Wikipedia for game description
 * @param {string} title - Game title
 * @returns {Promise<Descriptions>}
 */
export const get = async (title: string): Promise<Descriptions> => {
    let ret: Descriptions = {};

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

        if (summary.description?.toLowerCase().includes('video game')) {
            ret.summary = encodeURIComponent(summary.extract);
            ret.description = encodeURIComponent(await page.intro());
            ret.boxart = summary.originalimage.source;
        }
    } catch (err) {
        log(LogType.Error, 'Description', 'Error', { err });
    }

    return ret;
};
