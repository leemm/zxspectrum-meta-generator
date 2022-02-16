/**
 * Types/Interfaces for ZXInfo API
 */

export enum APISort {
    titleAsc = 'title_asc',
    titleDesc = 'title_desc',
    dateAsc = 'date_asc',
    dateDesc = 'date_desc',
    relAsc = 'rel_asc',
    relDesc = 'rel_desc',
}

export enum APIOutput {
    simple = 'simple',
    flat = 'flat',
}

export enum APIContentType {
    software = 'SOFTWARE',
    hardware = 'HARDWARE',
    book = 'BOOK',
}

export interface APISearch {
    query: string;
    mode?: string;
    size?: number;
    offset?: number;
    sort?: APISort;
    output?: APIOutput;
    contenttype?: APIContentType;
    language?: string;
    year?: number;
    genretype?: string;
    genresubtype?: string;
    machinetype?: string;
    controls?: string;
    multiplayermode?: string;
    multiplayertype?: string;
    originalpublication?: string;
    availability?: string;
    group?: string;
    groupname?: string;
}

// Search results

export interface Role {
    roleName?: string;
    roleType?: string;
}

export interface Author {
    country?: string;
    groupName?: string;
    groupType?: string;
    notes?: Note[];
    groupCountry?: string;
    authorSeq?: number;
    roles?: Role[];
    name?: string;
    labelType?: string;
    type?: string;
}

export interface Screen {
    filename?: string;
    size?: number;
    scrUrl?: string;
    format?: string;
    type?: string;
    title?: string;
    url?: string;
}

export interface Download {
    path?: string;
    size?: number;
    format?: string;
    language?: string;
    type?: string;
}

export interface Note {
    noteType: string;
    text: string;
}

export interface Publisher {
    country?: string;
    name: string;
    labelType?: string;
    notes?: Note[];
    publisherSeq?: number;
}

export interface Game {
    originalDayOfRelease?: string;
    isbn?: string;
    zxinfoVersion?: string;
    availability?: string;
    title?: string;
    releases?: {
        publishers?: Publisher[];
    }[];
    originalMonthOfRelease?: null;
    score?: {
        score?: number;
        votes?: number;
    };
    genreType?: string;
    additionalDownloads?: Download[];
    screens?: Screen[];
    originalYearOfRelease?: number;
    genre?: string;
    publishers?: Publisher[];
    genreSubType?: string;
    contentType?: string;
    machineType?: string;
    authors?: Author[];
    _localPath?: string | undefined;
    _md5: string | undefined;
}

export interface Hit {
    _index: string;
    _type: string;
    _id: string;
    _score: number;
    _source: Game;
    sort?: string[] | number[];
}

export interface Hits {
    total?: {
        value: number;
        relation: string;
    };
    max_score?: number;
    hits: Hit[];
}

export interface IDHit {
    _index: string;
    _type: string;
    _id: string;
    _version?: number;
    _seq_no?: number;
    _primary_term?: number;
    found?: boolean;
    _source: Game;
}

// MD5 Search
export interface MD5Result {
    entry_id: string;
    title: string;
    file: {
        filename: string;
        sha512?: string;
        md5?: string;
    };
}
