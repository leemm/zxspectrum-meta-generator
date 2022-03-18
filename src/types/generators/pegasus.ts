export interface PegasusMetaFile {
    header?: PegasusHeader;
    entries?: PegasusEntry[];
}

export interface PegasusHeader {
    collection?: string;
    shortname?: string;
    command?: string;
}

export interface PegasusKeyValue {
    key: string;
    value: string;
}

export interface PegasusEntry {
    game?: string;
    ['sort-by']?: string;
    sort_title?: string;
    sort_name?: string;
    file?: string;
    files?: string[];
    developer?: string;
    developers?: string[];
    publisher?: string;
    publishers?: string[];
    genre?: string;
    genres?: string[];
    tag?: string;
    tags?: string[];
    summary?: string;
    description?: string;
    players?: string;
    release?: string;
    rating?: string;
    launch?: string;
    command?: string;
    workdir?: string;
    cwd?: string;
    ['assets.titlescreen']?: string;
    ['assets.screenshot']?: string;
    ['assets.boxFront']?: string;
    ['x-hash']?: string;
    ['x-source']?: string;
}
