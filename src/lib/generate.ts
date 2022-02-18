import { Game } from '../types/api.v3';
import { parse, stringify } from 'js-ini';
import { IIniObject } from 'js-ini/lib/interfaces/ini-object';

/**
 * Parses API game json into a smaller object
 * @param {Game} game - JSON result from API
 * @returns {IIniObject}
 */
export const embiggen = (game: Game): IIniObject => {
    return {
        game: game.title || '',
        file: game._localPath || '',
        rating: ((game.score?.score || 0) * 10).toFixed() + '%',
        description: '',
        release: game.originalYearOfRelease?.toString() || '',
        developers: (game.authors ?? [])
            .filter((author) => author.type === 'Creator')
            .map((author) => author.name as string)
            .join(', '),
        publishers: (game.publishers ?? [])
            .filter((publisher) => publisher.publisherSeq === 1)
            .map((publisher) => publisher.name)
            .join(', '),
        genre: game.genre ?? '',
        players: game.numberOfPlayers ?? '',
    };
};

// import { DefaultGame } from '../types/pegasus';

// const parseGame = (game) => {

//     console.log(game);

// }

// `game: Alien Hominid
// file: Alien Hominid (Europe) (En,Fr,De,Es,It).gba
// developer: Zoo Digital
// genre: Shooter
// players: 1
// summary: You're a little yellow alien.  The FBI has shot down your ship
//   while flying over planet Earth. And it, quite literally, lands right on their
//   doorstep. After a series of FBI Agents swipe your ship, what option do you have
//   other than to blow up everything in your path to get it back?
// description:
//   Alien Hominid is a 2D side-scrolling shooter with heavy references to the Metal
//   Slug series of games - from the hand-drawn graphics, huge explosions, right down
//   to the ability to eviscerate FBI Agents when you get up close to them. The
//   graphics are by featured artist Dan Paladin.
//   .
//   Your goal, is quite simply, to get to the end of the stage, and die as little as
//   possible. Which is made difficult due to the fact that any bullet is an instant
//   kill. To help you out, you can grab a range of power-ups, such as lasers, spread
//   shots, shotguns and more.
// rating: 50%
// x-id: 4149
// x-source: ScreenScraper`

// game	Creates a new game with the value as title. The properties after this line will modify this game. This is a required field.	T
// sort-by	An alternate title that should be used for sorting. Can be useful when the title contains eg. roman numerals or special symbols. sort_title and sort_name are also accepted.	T
// file, files	The file or list of files (eg. disks) that belong to this game. Paths can be either absolute or relative to the metadata file. If there are multiple files, you'll be able to select which one to launch when you start the game.
// developer, developers	The developer or list of developers. This field can appear multiple times.
// publisher, publishers	The publisher or list of publishers. This field can appear multiple times.
// genre, genres	The genre or list of genres (for example Action, Adventure, etc.). This field can appear multiple times.
// tag, tags	Tag or list of tags (for example Co-op, VR, etc.). This field can appear multiple times.
// summary	A short description of the game in one paragraph.	T
// description	A possibly longer description of the game.	T
// players	The number of players who can play the game. Either a single number (eg. 2) or a number range (eg. 1-4).	T
// release	The date when the game was released, in YYYY-MM-DD format (eg. 1985-05-22). Month and day can be omitted if unknown (eg. 1985-05 or 1985 alone is also accepted).	T
// rating	The rating of the game, in percentages. Either an integer percentage in the 0-100% range (eg. 70%), or a fractional value between 0 and 1 (eg. 0.7).	T
// launch	If this game must be launched differently than the others in the same collection, a custom launch command can be defined for it.	T
// command	An alternate name for launch. Use whichever you prefer.	T
// workdir	The working directory in which the game is launched. Defaults to the directory of the launched program.	T
// cwd	An alternate name for workdir. Use whichever you prefer.	T
