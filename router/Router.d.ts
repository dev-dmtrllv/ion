import React from "react";
export declare const RouterContext: React.Context<RouterContextType>;
export declare const Router: React.FC<RouterProps>;
declare type RouterContextType = {
    matchType: MatchType;
    didMatch: boolean;
    match: (url: string, exact?: boolean) => boolean;
};
declare type RouterProps = {
    match?: "first" | "all";
};
declare type MatchType = "first" | "all";
export {};
