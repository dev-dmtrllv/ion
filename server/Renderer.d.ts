import React from "react";
import { Request, Response } from "express";
import { Server } from "./Server";
import { SSRData } from "./SSRData";
import { ApiClientInfo } from "./Api";
import { IonAppConfig, IonAppConfigWithName } from "./Config";
export declare class Renderer {
    readonly server: Server;
    readonly appConfig: IonAppConfigWithName;
    readonly appComponent: React.FC | React.ComponentClass;
    readonly runtimeSources: {
        scripts: string[];
        styles: string[];
    };
    readonly appSources: {
        scripts: string[];
        styles: string[];
    };
    private readonly _clientApiInfo;
    constructor(server: Server, appConfig: IonAppConfigWithName, clientInfo: ApiClientInfo);
    loadAppComponent(): void;
    render: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    protected renderHTML({ title, styles, scripts, appString, head, ssrData, favicon, importPaths }: HTMLProps): JSX.Element;
    protected renderStyles(srcs: string[]): JSX.Element[];
    protected renderScripts(srcs: string[]): JSX.Element[];
}
export declare type RendererType<T extends Renderer> = new (server: Server, appConfig: IonAppConfig, apiClientInfo: ApiClientInfo) => T;
export declare type HTMLProps = {
    title?: string;
    scripts?: string[];
    styles?: string[];
    appString: string;
    head?: JSX.Element;
    ssrData: SSRData;
    favicon?: string;
    importPaths: string[];
};
