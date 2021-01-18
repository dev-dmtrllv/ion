import React from "react";
export declare const RouterProviderContext: React.Context<RouterProviderContextType>;
export declare const RouterProvider: React.FC<RouterProviderProps> & {
    app: JSX.Element | null;
};
declare type RouterProviderContextType = {
    url: string;
    match: (url: string, exact?: boolean) => boolean;
    redirect: (from: string, to: string, exact?: boolean) => void;
    redirectInfo: RedirectInfo;
    routeTo: (to: string) => void;
    getParams: (path: string) => {
        readonly [key: string]: string;
    };
    readonly query: {
        readonly [key: string]: string;
    };
    /**
     * when a number (x) is returned the router will wait (x) ms before the routing starts
     */
    addChangeListener: (onChangeListener: RouteChangeListener) => void;
    removeChangeListener: (onChangeListener: RouteChangeListener) => void;
    cache: (url: string, duration?: number) => void;
};
declare type RouteChangeEventType = "start" | "end" | "canceled";
export declare type RouteChangeListener = (event: RouteChangeEventType, routeToUrl: string) => any;
declare type RouterProviderProps = {
    url: string;
    onRedirect?: (from: string, to: string, exact?: boolean) => void;
    onCache?: (url: string, duration?: number) => void;
};
export declare type RedirectInfo = {
    from: string;
    to: string;
} | null;
export {};
