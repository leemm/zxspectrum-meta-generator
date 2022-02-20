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
    platform?: string;
    verbose?: boolean;
    version?: boolean;
    help?: boolean;
    clear?: boolean;
}
