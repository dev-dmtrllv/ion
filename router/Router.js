"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = exports.RouterContext = void 0;
const react_1 = __importDefault(require("react"));
const RouterProvider_1 = require("./RouterProvider");
exports.RouterContext = react_1.default.createContext(null);
const Router = ({ match = "first", children }) => {
    const ctx = react_1.default.useContext(RouterProvider_1.RouterProviderContext);
    return (react_1.default.createElement(exports.RouterContext.Provider, { value: { matchType: match, didMatch: false, match: ctx.match } }, children));
};
exports.Router = Router;
