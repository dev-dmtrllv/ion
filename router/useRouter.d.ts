import { RouteChangeListener } from "./RouterProvider";
export declare const useRedirectInfo: () => import("./RouterProvider").RedirectInfo;
export declare const useRouteListener: (listener: RouteChangeListener) => void;
export declare const withRouter: () => {
    params: {
        readonly [key: string]: string;
    };
    path: string;
    query: {
        readonly [key: string]: string;
    };
    exact: boolean | undefined;
    routeTo: (to: string) => void;
    match: (url: string, exact?: boolean | undefined) => boolean;
};
