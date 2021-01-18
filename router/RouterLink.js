"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterLink = void 0;
const react_1 = __importDefault(require("react"));
const Router_1 = require("./Router");
const RouterProvider_1 = require("./RouterProvider");
const RouterLink = ({ to, exact, children }) => {
    const ctx = react_1.default.useContext(Router_1.RouterContext);
    const { routeTo } = react_1.default.useContext(RouterProvider_1.RouterProviderContext);
    const active = ctx.match(to, exact);
    return (react_1.default.createElement("a", { className: `router-link ${active ? "active" : ""}`, href: to, onClick: (e) => { e.preventDefault(); routeTo(to); } }, children));
};
exports.RouterLink = RouterLink;
