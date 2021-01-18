import React from "react";
import type { Api, CallableApi } from "../server/Api";
import { AsyncFC, AsyncRender } from "./Async";
export declare const FetchContext: React.Context<FetchContextType>;
export declare const FetchProvider: React.FC<{
    fetcher: Fetcher;
}>;
export declare const Fetch: AsyncFC<FetchProps>;
declare const fetchApi: {
    <T extends Api, K_1 extends Exclude<{ [K in keyof T]-?: {} extends { [P in K]: T[K]; } ? never : K; }[keyof T], "url">>(api: CallableApi<T>, method: K_1, data: InferApiData<CallableApi<T>[K_1]> | null, onRender: AsyncRender<UnPromisify<ReturnType<CallableApi<T>[K_1]>>>): JSX.Element;
    lazy<T_1 extends Api, K_3 extends Exclude<{ [K_2 in keyof T_1]-?: {} extends { [P_1 in K_2]: T_1[K_2]; } ? never : K_2; }[keyof T_1], "url">>(api: CallableApi<T_1>, method: K_3, data: InferApiData<CallableApi<T_1>[K_3]> | null, onRender: AsyncRender<UnPromisify<ReturnType<CallableApi<T_1>[K_3]>>>): JSX.Element;
};
export { fetchApi };
declare type FetchMethods = "get" | "post" | "put" | "delete";
declare type FetchProps = {
    url: string;
    data?: object;
    method?: FetchMethods;
    children: AsyncRender<any>;
};
declare type Fetcher = (url: string, method: FetchMethods, data?: object) => Promise<any>;
declare type FetchContextType = {
    fetch: Fetcher;
};
declare type UnPromisify<T> = T extends Promise<infer P> ? P : T;
declare type FetchApiResponseType<T extends Api, K extends keyof CallableApi<T>> = UnPromisify<ReturnType<CallableApi<T>[K]>>;
declare type InferApiData<T> = T extends (props: infer Props) => any ? Props : never;
