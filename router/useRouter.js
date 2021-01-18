"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRouter = exports.useRouteListener = exports.useRedirectInfo = void 0;
const react_1 = __importDefault(require("react"));
const Route_1 = require("./Route");
const RouterProvider_1 = require("./RouterProvider");
const useRedirectInfo = () => react_1.default.useContext(RouterProvider_1.RouterProviderContext).redirectInfo;
exports.useRedirectInfo = useRedirectInfo;
const useRouteListener = (listener) => {
    const { addChangeListener, removeChangeListener } = react_1.default.useContext(RouterProvider_1.RouterProviderContext);
    react_1.default.useEffect(() => {
        addChangeListener(listener);
        return () => removeChangeListener(listener);
    }, []);
};
exports.useRouteListener = useRouteListener;
const withRouter = () => {
    const { match, routeTo, query } = react_1.default.useContext(RouterProvider_1.RouterProviderContext);
    const { params, path, exact } = react_1.default.useContext(Route_1.RouteContext);
    return { params, path, query, exact, routeTo, match };
};
exports.withRouter = withRouter;
