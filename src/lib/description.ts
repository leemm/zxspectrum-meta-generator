import wiki from 'wikipedia';
import { Descriptions } from '../types/app';

/**
 * Query Wikipedia for game description
 * @param {string} title - Game title
 * @returns {Promise<Descriptions>}
 */
export const get = async (title: string): Promise<Descriptions> => {
    let ret: Descriptions = {};

    await new Promise((r) => setTimeout(r, 50));

    console.log('Querying Wikipedia for game description: ' + title);

    try {
        const page = await wiki.page(title),
            summary = await page.summary();

        if (summary.description?.toLowerCase().includes('video game')) {
            ret.summary = encodeURIComponent(summary.extract);
            ret.description = encodeURIComponent(await page.intro());
            ret.boxart = summary.originalimage.source;
        }
    } catch (err) {
        console.error(
            'Error getting game description: ' + (err as string).toString()
        );
    }

    return ret;
};
