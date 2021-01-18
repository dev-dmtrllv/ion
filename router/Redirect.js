"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Redirect = void 0;
const react_1 = __importDefault(require("react"));
const async_1 = require("../async");
const Router_1 = require("./Router");
const RouterProvider_1 = require("./RouterProvider");
const Redirect = ({ from, to, exact }) => {
    const { url, redirect } = react_1.default.useContext(RouterProvider_1.RouterProviderContext);
    const ctx = react_1.default.useContext(Router_1.RouterContext);
    const { isPrefetching } = react_1.default.useContext(async_1.AsyncContext);
    react_1.default.useEffect(() => {
        if (!ctx.didMatch && ctx.match(from || url, exact)) {
            ctx.didMatch = true;
            redirect(from || url, to, exact);
        }
    }, []);
    if (isPrefetching && !ctx.didMatch && ctx.match(from || url, exact)) {
        ctx.didMatch = true;
        redirect(from || url, to, exact);
    }
    return null;
};
exports.Redirect = Redirect;
