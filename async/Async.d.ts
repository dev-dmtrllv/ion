import React from "react";
export declare const useAsyncContext: () => import("./AsyncContext").AsyncContextType;
export declare const Async: React.FC<AsyncProps<any>>;
export declare type AsyncProps<D> = {
    id: string;
    componentID: string;
    resolver: AsyncResolver<D>;
    children: AsyncRender<D>;
    prefetch?: boolean;
    cache?: boolean | number;
};
export declare type AsyncState<D> = {
    isResolving: boolean;
    data?: D;
    error?: Error;
};
export declare type AsyncResolver<D> = () => Promise<D>;
export declare type AsyncRender<D> = (state: AsyncState<D>, updateData: (data: D) => void, deleteData: () => boolean) => JSX.Element | null;
export declare type AsyncFC<P> = React.FC<P & {
    prefetch?: boolean;
    cache?: boolean | number;
}>;
