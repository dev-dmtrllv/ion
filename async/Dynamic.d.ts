import React from "react";
import { AsyncFC } from "./Async";
import { AsyncDataMap } from "./AsyncContext";
export declare const getImportPaths: (data: AsyncDataMap, remove?: boolean) => string[];
export declare const Dynamic: AsyncFC<DynamicProps>;
declare type DynamicProps = {
    path: string;
    importer: () => Promise<any>;
    children: (state: {
        Component?: React.FC | React.ComponentClass;
        error?: Error;
        isResolving: boolean;
    }) => JSX.Element | null;
};
export {};
