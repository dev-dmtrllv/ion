/// <reference types="react" />
import { AsyncDataMap } from "./AsyncContext";
export declare const prefetch: (app: JSX.Element, initData?: AsyncDataMap, onShouldResolve?: () => boolean) => Promise<AsyncDataMap>;
