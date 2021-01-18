import React from "react";
export declare const RouteContext: React.Context<RouteContext>;
export declare const Route: React.FC<RouteProps>;
declare type RouteProps = {
    path: string;
    exact?: boolean;
    cache?: number | ((url: string) => number);
};
declare type RouteContext = {
    readonly path: string;
    readonly exact?: boolean;
    readonly params: {
        readonly [key: string]: string;
    };
};
export {};
