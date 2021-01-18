import React from "react";
import { AsyncResolver, AsyncState } from "./Async";
export declare const AsyncContext: React.Context<AsyncContextType>;
export declare const AsyncProvider: React.FC<AsyncProviderProps>;
export declare type AsyncContextType = {
    data: AsyncDataMap;
    resolve: <D>(key: string, resolver: AsyncResolver<D>, cache?: number | boolean) => void;
    isPrefetching: boolean;
    updateDataPatch: (patch: AsyncDataMap, rerender?: boolean) => void;
    deleteData: (key: string, rerender?: boolean) => boolean;
};
export declare type AsyncData<T> = AsyncState<T> & {
    cache?: boolean | number;
};
export declare type AsyncDataMap = {
    [key: string]: AsyncData<any>;
};
declare type AsyncProviderProps = {
    initData?: AsyncDataMap;
    isPrefetching?: boolean;
    onResolve?: <D>(key: string, resolver: AsyncResolver<D>, cache?: boolean | number) => void;
};
export {};
