import { ParsedPath } from 'path';

export interface File {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
    path?: string;
    mimeType?: string | boolean;
    isArchive?: boolean;
    archiveContainsFile?: boolean;
    md5?: string;
}

export interface OptionDefinition {
    name: string;
    type?: any;
    default?: string;
    description?: string;
    alias?: string | undefined;
    defaultOption?: boolean | undefined;
}

export interface Config {
    launch?: string;
    src?: string;
    output?: string;
    assets?: string;
    platform?: string;
    verbose?: boolean;
    'verbose-save'?: boolean;
    'audit-assets'?: string;
    'move-failed'?: string;
    version?: boolean;
    help?: boolean;
    clear?: boolean;
}

export interface Version {
    APP_DISPLAY_NAME: string;
    APP_DISPLAY_VERSION: string;
}

export interface MediaFolders {
    titles?: string;
    screens?: string;
    covers?: string;
}

export interface Descriptions {
    summary?: string;
    description?: string;
    boxart?: string;
}

export interface FoundGame {
    title: string;
    hash: string;
    parsed: ParsedPath;
}

export interface FailedFile {
    path: string;
    md5: string;
}

export interface PromptValidInput {
    letter: string;
    extra?: string;
    label: string;
}

export interface PromptNewImage {
    value: string;
    isUrl: boolean;
    isFile: boolean;
}

export interface MetaFile {
    header?: any;
    entries?: any[];
    images?: {
        covers: string[];
        screens: string[];
        titles: string[];
    };
}

export enum LogType {
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
}

export type KeyValuePairNamed = [key: string, value: string];
