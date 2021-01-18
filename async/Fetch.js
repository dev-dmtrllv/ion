"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchApi = exports.Fetch = exports.FetchProvider = exports.FetchContext = void 0;
const react_1 = __importDefault(require("react"));
const Async_1 = require("./Async");
exports.FetchContext = react_1.default.createContext(null);
const FetchProvider = ({ fetcher, children }) => {
    return (react_1.default.createElement(exports.FetchContext.Provider, { value: { fetch: fetcher } }, children));
};
exports.FetchProvider = FetchProvider;
const Fetch = (_a) => {
    var { url, data, method = "get" } = _a, rest = __rest(_a, ["url", "data", "method"]);
    const ctx = react_1.default.useContext(exports.FetchContext);
    return (react_1.default.createElement(Async_1.Async, Object.assign({ id: url + method + (data ? JSON.stringify(data) : ""), componentID: "Fetch", resolver: () => ctx.fetch(url, method, data) }, rest)));
};
exports.Fetch = Fetch;
const fetchApi = (api, method, data, onRender) => {
    return (react_1.default.createElement(exports.Fetch, { method: method, url: api.url, data: data }, (props, a, b) => onRender(props, a, b)));
};
exports.fetchApi = fetchApi;
fetchApi.lazy = (api, method, data, onRender) => {
    return (react_1.default.createElement(exports.Fetch, { prefetch: false, method: method, url: api.url, data: data }, (props, updater, deleter) => onRender(props, updater, deleter)));
};
