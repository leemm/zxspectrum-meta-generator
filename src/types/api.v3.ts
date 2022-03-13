/**
 * Types/Interfaces for ZXInfo API
 */

import { KeyValuePairNamed } from './app.js';

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
    type?: string;
    format?: string;
    language?: string;
    origin?: string;
    encodingScheme?: string;
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

export interface Magazine {
    type?: string;
    featureName?: string;
    magazineName?: string;
    page?: number;
    issueId?: number;
    dateYear?: number;
    dateMonth?: number;
    volume?: number;
    number?: number;
    score?: string;
}

export interface System {
    name?: string;
    url?: string;
}

export interface Site {
    siteName?: string;
    url?: string;
}

export interface Price {
    amount?: string;
    currency?: string;
    prefix?: number;
}

export interface Hash {
    filename: string;
    md5?: string;
    sha512?: string;
}

export interface Path {
    path: string;
}

export interface Licence {
    name: string;
    country?: string;
    type?: string;
    originalName?: string;
}

export interface Compilation {
    entry_id: number;
    title: string;
    publishers?: Publisher[];
    machineType?: string;
    type?: string;
}

export interface Release {
    releaseSeq: number;
    publishers?: Publisher[];
    releaseTitles?: any[];
    yearOfRelease?: number;
    releasePrice?: Price;
    code?: string;
    barcode?: string;
    dl?: string;
    files?: Download[];
}

export interface Game {
    controls?: KeyValuePairNamed[];
    authoring?: any[];
    duplicateOf?: any[];
    bookContents?: any[];
    language?: string;
    competition?: any[];
    editBy?: any[];
    numberOfPlayers?: string;
    modificationOf?: any[];
    score?: {
        score?: number;
        votes?: number;
    };
    features?: KeyValuePairNamed[];
    additionalDownloads?: Download[];
    bundledWith?: any[];
    duplicatedBy?: any[];
    magazineReferences?: Magazine[];
    publishers?: Publisher[];
    otherSystems?: System[];
    contentType?: string;
    runsWith?: any[];
    originalPublication?: string;
    requiredByHardware?: any[];
    relatedSites?: Site[];
    originalDayOfRelease?: string;
    inspirationFor?: any[];
    requiredToRun?: any[];
    knownErrors?: any;
    editorOf?: any[];
    originOf?: any[];
    originalYearOfRelease?: number;
    addOnAvailable?: any[];
    hardwareBlurb?: string;
    requiresHardware?: any[];
    authors?: Author[];
    originalPrice?: Price;
    authoredWith?: any[];
    isbn?: string;
    availability?: string;
    inspiredBy?: any[];
    md5hash?: Hash[];
    title?: string;
    originalMonthOfRelease?: number;
    genreType?: string;
    addOnDependsOn?: any[];
    screens?: Screen[];
    multiplayerMode?: string;
    genre?: string;
    derivedFrom?: any[];
    modifiedBy?: any[];
    youTubeLinks?: Site[];
    machineType?: string;
    tosec?: Path;
    otherPlatform?: any[];
    licensed?: Licence[];
    bundleContent?: any[];
    compilationContents?: any[];
    zxinfoVersion?: string;
    themedGroup?: KeyValuePairNamed[];
    unsortedGroup?: any[];
    relatedLinks?: Site[];
    reviewAwards?: any[];
    inCompilations?: Compilation[];
    releases?: Release[];
    inBook?: any[];
    awards?: any[];
    series?: Compilation[];
    genreSubType?: string;
    multiplayerType?: string;
    remarks?: string;

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
