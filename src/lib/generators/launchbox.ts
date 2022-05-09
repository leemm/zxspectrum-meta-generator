import { IIniObject } from 'js-ini/lib/interfaces/ini-object';
import { create } from 'xmlbuilder2';
import fs from 'fs';
import { LaunchboxEntry } from '../../types/generators/launchbox';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import { XMLWriterOptions } from 'xmlbuilder2/lib/interfaces';

/**
 * Build Launchbox meta file header
 * @returns {string}
 */
export const launchboxHeader = (): string => {
    return `<?xml version="1.0" standalone="yes"?>
<LaunchBox>`;
};

/**
 * Build Launchbox meta file footer
 * @returns {string}
 */
export const launchboxFooter = (): string => {
    return `</LaunchBox>`;
};

/**
 * Converts IIniObject to a launchbox game xml
 * @param {IIniObject} entry - Final object
 * @param {boolean} decodeUri - Decode Summary and Description
 * @returns {string}
 */
export const launchboxEntry = (
    entry: IIniObject,
    decodeUri: boolean = true
): string => {
    let players = '';
    if (entry['players']) {
        players =
            parseInt(entry['players'] as string, 10) > 1
                ? 'Multiplayer'
                : 'Single Player';
    }

    const obj = {
        Game: {
            ApplicationPath: entry['file'],
            Completed: false,
            DateAdded: moment().toISOString(true),
            DateModified: moment().toISOString(true),
            Developer: entry['developers'] as string,
            Emulator: 'TO DO: GET EMULATOR GUID',
            Favorite: false,
            ID: uuid(),
            LastPlayedDate: moment().toISOString(true),
            Notes: entry['description']
                ? decodeUri
                    ? decodeURIComponent(entry['description'] as string)
                    : (entry['description'] as string)
                : '',
            Platform: 'Sinclair ZX Spectrum',
            Publisher: entry['publishers'] as string,
            ReleaseDate:
                entry['release']?.toString().length > 0
                    ? moment(entry['release'] as string, 'YYYY').toISOString(
                          true
                      )
                    : '',
            ScummVMAspectCorrection: false,
            ScummVMFullscreen: false,
            StarRatingFloat: 0,
            StarRating: 0,
            CommunityStarRating: entry['rating']
                ? (parseInt(entry['rating'].toString().replace('%', ''), 10) /
                      100) *
                  5
                : 0,
            CommunityStarRatingTotalVotes: 1,
            Status: 'Imported ROM',
            DatabaseID: 'TO DO, TRY TO GET THIS',
            Title: entry['game'] as string,
            UseDosBox: false,
            UseScummVM: false,
            Version: entry['hash'] || entry['x-hash'] || '',
            PlayMode: players,
            PlayCount: 0,
            Portable: false,
            Hide: false,
            Broken: false,
            Genre: entry['genre'],
            MissingVideo: false,
            MissingBoxFrontImage: false,
            MissingScreenshotImage: false,
            MissingClearLogoImage: false,
            MissingBackgroundImage: false,
            UseStartupScreen: false,
            HideAllNonExclusiveFullscreenWindows: false,
            StartupLoadDelay: false,
            HideMouseCursorInGame: false,
            DisableShutdownScreen: false,
            AggressiveWindowHiding: false,
            OverrideDefaultStartupScreenSettings: false,
        },
    };

    // Remove document header (we don't need it here)
    const xmlWriterOptions: XMLWriterOptions = {
        prettyPrint: true,
    };
    const documentParts = (create(obj).end(xmlWriterOptions) ?? '').split('\n');
    documentParts.shift();
    return documentParts.map((part: string) => '  ' + part).join('\n');

    //     assets.titlescreen: ${
    //         entry['assets.titlescreen.local'] || entry['assets.titlescreen'] || ''
    //     }
    // assets.screenshot: ${
    //         entry['assets.screenshot.local'] || entry['assets.screenshot'] || ''
    //     }
    // assets.boxFront: ${
    //         entry['assets.boxFront.local'] || entry['assets.boxFront'] || ''
    //     }
};
