"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = exports.RouteContext = void 0;
const react_1 = __importDefault(require("react"));
const Router_1 = require("./Router");
const RouterProvider_1 = require("./RouterProvider");
exports.RouteContext = react_1.default.createContext({ params: {}, path: "", exact: false });
const Route = ({ path, exact = false, children }) => {
    const ctx = react_1.default.useContext(Router_1.RouterContext);
    const { getParams } = react_1.default.useContext(RouterProvider_1.RouterProviderContext);
    if (ctx.matchType === "first" && ctx.didMatch)
        return null;
    if (ctx.match(path, exact)) {
        ctx.didMatch = true;
        return (react_1.default.createElement(exports.RouteContext.Provider, { value: { path, exact, params: getParams(path), } }, children));
    }
    return null;
};
exports.Route = Route;
