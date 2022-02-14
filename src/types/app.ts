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
