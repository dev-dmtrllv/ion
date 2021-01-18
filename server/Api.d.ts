import type { Request, Response } from "express";
import { Session } from "./Session";
export declare class Api {
    static URL(url: string): (ctor: any) => void;
    private static readonly __IS_API__;
    static createTree<T extends ApiDefinition>(apiDefinitions: T): ApiTree<T>;
    protected readonly req: Request;
    protected readonly res: Response;
    protected readonly session: Session;
    protected readonly getApi: <T extends Api>(type: ApiType<T>) => T;
    constructor(req: Request, res: Response);
    get?: (props?: object) => any;
    post?: (props?: object) => any;
    put?: (props?: object) => any;
    delete?: (props?: object) => any;
}
export declare type ApiType<T extends Api> = new (req: Request, res: Response) => T;
declare type InferApiType<T> = T extends ApiType<infer Api> ? Api : never;
export declare type ApiDefinition = {
    [k: string]: ApiType<any> | ApiDefinition;
};
declare type ApiTree<T> = {
    [K in keyof T]: T[K] extends ApiType<Api> ? CallableApi<InferApiType<T[K]>> : T[K] extends ApiTree<ApiDefinition> ? ApiTree<T[K]> : never;
};
declare type Promisify<T> = T extends (props: infer Props) => infer ReturnType ? ReturnType extends Promise<any> ? T : Props extends Object ? (props: Props) => Promise<ReturnType> : () => Promise<ReturnType> : never;
export declare type CallableApi<T extends Api> = {
    [K in keyof ExcludeOptionalProps<T>]: Promisify<T[K]>;
} & {
    url: string;
};
declare type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends {
        [P in K]: T[K];
    } ? never : K;
}[keyof T];
declare type ExcludeOptionalProps<T> = Pick<T, RequiredKeys<T>>;
export declare type ApiMethods = "get" | "post" | "put" | "delete";
export declare type ApiClientInfo = {
    [key: string]: {
        url: string;
        methods: ApiMethods[];
    };
};
export {};
