export declare class Manifest {
    private readonly data;
    readonly runtime: {
        scripts: string[];
        styles: string[];
    };
    constructor(data: ManifestData);
    private readonly getTargetedFiles;
    readonly getChunkFiles: (chunkIDs: string[]) => {
        scripts: string[];
        styles: string[];
    };
    readonly getAppFiles: (name: string) => {
        scripts: any[];
        styles: any[];
    };
}
declare type ManifestData = {
    main: {
        "runtime": ChunkData | undefined;
        "vendor": ChunkData | undefined;
        [key: string]: ChunkData | undefined;
    };
    chunks: {
        [key: string]: ChunkData;
    };
};
declare type ChunkData = {
    id: string;
    files: string[];
};
export {};
