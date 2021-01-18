export declare class Config {
    private static config;
    static get(): IConfig;
}
export declare type IonAppConfigWithName = IonAppConfig & {
    name: string;
};
export declare type IonAppConfig = {
    entry: string;
    url: string;
    title?: string;
    session?: SessionConfig;
};
export declare type SessionConfig = {
    name?: string;
    secret: string;
    maxAge?: number;
    useFileStorage?: boolean;
};
export declare type DatabaseConfig = {
    user: string;
    password: string;
    databaseName: string;
    host?: string;
    port?: number;
    poolConnectionLimit?: number;
};
export declare type IConfig = {
    apps: {
        [name: string]: IonAppConfig;
    };
    server: {
        entry?: string;
        host?: string;
        port?: number;
        apiPath?: string;
        session?: SessionConfig;
    };
    database?: DatabaseConfig;
};
