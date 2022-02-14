export interface KeyValue {
    key: string;
    value?: string | string[] | number;
}

export interface Game {
    game: KeyValue;
    sortBy?: KeyValue;
    file?: KeyValue;
    files?: KeyValue;
    developer?: KeyValue;
    developers?: KeyValue;
    publisher?: KeyValue;
    publishers?: KeyValue;
    genre?: KeyValue;
    genres?: KeyValue;
    tag?: KeyValue;
    tags?: KeyValue;
    summary?: KeyValue;
    description?: KeyValue;
    players?: KeyValue;
    release?: KeyValue;
    rating?: KeyValue;
    command?: KeyValue;
    cwd?: KeyValue;
    xId?: KeyValue;
    xSource?: KeyValue;
}

export const DefaultGame: Game = {
    game: {
        key: 'game',
    },
    sortBy: {
        key: 'sort-by',
    },
    file: {
        key: 'file',
    },
    files: {
        key: 'files',
    },
    developer: {
        key: 'developer',
    },
    developers: {
        key: 'developers',
    },
    publisher: {
        key: 'publisher',
    },
    publishers: {
        key: 'publishers',
    },
    genre: {
        key: 'genre',
    },
    genres: {
        key: 'genres',
    },
    tag: {
        key: 'tag',
    },
    tags: {
        key: 'tags',
    },
    summary: {
        key: 'summary',
    },
    description: {
        key: 'description',
    },
    players: {
        key: 'players',
    },
    release: {
        key: 'release',
    },
    rating: {
        key: 'rating',
    },
    command: {
        key: 'command',
    },
    cwd: {
        key: 'cwd',
    },
    xId: {
        key: 'x-id',
    },
    xSource: {
        key: 'x-source',
    },
};
