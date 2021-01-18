"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const async_1 = require("../async");
const router_1 = require("../router");
class Client {
}
exports.Client = Client;
Client.render = (App) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (env.isDev)
        require("./live-reloader");
    const SSR_DATA_ID = "SSR_DATA";
    // get ssr data
    const ssrData = window[SSR_DATA_ID] || {};
    if (!ssrData.api)
        ssrData.api = {};
    if (!ssrData.async) {
        ssrData.async = {};
    }
    else {
        // remove all the dynamic data so we can import the components on the client
        Object.keys(ssrData.async).forEach(k => {
            if (k.startsWith("Dynamic:"))
                delete ssrData.async[k];
        });
    }
    (_a = document.getElementById(SSR_DATA_ID)) === null || _a === void 0 ? void 0 : _a.remove();
    delete window[SSR_DATA_ID];
    const fetcher = (url, method, data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let response;
            if (method !== "get") {
                response = yield fetch(url, {
                    method: method.toUpperCase(),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: typeof data === "object" ? JSON.stringify(data) : undefined
                });
            }
            else {
                response = yield fetch(`${url}${(data !== undefined && data !== null) ? `?data=${JSON.stringify(data)}` : ""}`);
            }
            const txt = yield response.text();
            try {
                return JSON.parse(txt);
            }
            catch (e) {
                console.error(e);
                return txt;
            }
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    });
    // create api structure
    const api = window["api"] = {};
    const createRecursive = (url, rootObject) => {
        const p = url.shift();
        rootObject[p] = {};
        if (url.length > 0)
            return createRecursive(url, rootObject[p]);
        return rootObject[p];
    };
    Object.keys(ssrData.api).forEach(url => {
        const parts = url.split("/").filter(p => !!p);
        const ssrApi = ssrData.api[url];
        const o = createRecursive(parts, api);
        o.url = `/api` + ssrApi.url;
        ["get", "post", "put", "delete"].forEach(m => {
            if (ssrApi.methods.includes(m))
                o[m] = (data) => __awaiter(void 0, void 0, void 0, function* () { return yield fetcher(o.url, m, data); });
            else
                o[m] = () => { throw new Error(`/api${o.url} has no ${m} method!`); };
        });
    });
    router_1.RouterProvider.app = (react_1.default.createElement(async_1.FetchProvider, { fetcher: fetcher },
        react_1.default.createElement(App, null)));
    const wrappedApp = (react_1.default.createElement(router_1.RouterProvider, { url: window.location.pathname + window.location.search }, router_1.RouterProvider.app));
    ssrData.async = yield async_1.prefetch(wrappedApp, ssrData.async);
    react_dom_1.default.hydrate(react_1.default.createElement(async_1.AsyncProvider, { initData: ssrData.async }, wrappedApp), document.getElementById("root"));
});
