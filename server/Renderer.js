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
exports.Renderer = void 0;
const fetch_1 = require("fetch");
const react_1 = __importDefault(require("react"));
const server_1 = __importDefault(require("react-dom/server"));
const memory_cache_1 = __importDefault(require("memory-cache"));
const async_1 = require("../async");
const Fetch_1 = require("../async/Fetch");
const router_1 = require("../router");
class Renderer {
    constructor(server, appConfig, clientInfo) {
        this.render = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const cachedHtml = memory_cache_1.default.get(req.url);
            if (cachedHtml) {
                console.log(`rendering ${req.url} from cache`);
                return res.send(cachedHtml);
            }
            const fetcher = (url, method, data) => new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (url.startsWith("/api")) // api call
                 {
                    try {
                        const apiUrl = url.split("?")[0].replace("/api", "");
                        const response = yield this.server.callApi(apiUrl, method, data, req, res);
                        resolve(response);
                    }
                    catch (e) {
                        reject(e);
                    }
                }
                else // external call
                 {
                    fetch_1.fetchUrl(url + (method === "get" ? (data ? `?data=${JSON.stringify(data)}` : "") : ""), {
                        method: (method || "get").toUpperCase(),
                        body: data ? JSON.stringify(data) : undefined,
                    }, (err, response, data) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            try {
                                resolve(JSON.parse(data));
                            }
                            catch (_a) {
                                resolve(data);
                            }
                        }
                    });
                }
            }));
            let redirectInfo = null;
            let cacheInfo;
            const wrappedApp = (react_1.default.createElement(Fetch_1.FetchProvider, { fetcher: fetcher },
                react_1.default.createElement(router_1.RouterProvider, { url: req.url, onRedirect: (from, to) => { redirectInfo = { from, to }; }, onCache: (url, duration) => { cacheInfo = { url, duration }; } },
                    react_1.default.createElement(this.appComponent, null))));
            const asyncData = yield async_1.prefetch(wrappedApp, {}, () => !redirectInfo);
            if (redirectInfo) {
                let [redirectUrl, redirectQueryStr = ""] = redirectInfo.to.split("?");
                redirectUrl += ("?" + redirectQueryStr + `${encodeURIComponent("redirect_info")}=${encodeURIComponent(JSON.stringify(redirectInfo))}`);
                res.redirect(redirectUrl);
            }
            else {
                const importPaths = async_1.getImportPaths(asyncData);
                const ssrData = {
                    api: this._clientApiInfo,
                    async: asyncData
                };
                const appString = server_1.default.renderToString(react_1.default.createElement(async_1.AsyncProvider, { initData: asyncData }, wrappedApp));
                if (cacheInfo) {
                    const duration = cacheInfo.duration || 5000;
                    if (duration > 0) {
                        const htmlString = server_1.default.renderToStaticMarkup(this.renderHTML({ appString, ssrData, importPaths }));
                        res.send(htmlString);
                        memory_cache_1.default.put(cacheInfo.url, htmlString, duration);
                        return;
                    }
                }
                const htmlStream = server_1.default.renderToStaticNodeStream(this.renderHTML({ appString, ssrData, importPaths }));
                htmlStream.on("data", (data) => res.write(data));
                htmlStream.on("error", (err) => {
                    console.log(`HTML Stream Error!`, err);
                    throw err;
                });
                htmlStream.on("close", () => res.end());
            }
        });
        this.server = server;
        this.appConfig = appConfig;
        this._clientApiInfo = clientInfo;
        this.loadAppComponent();
    }
    loadAppComponent() {
        this.runtimeSources = this.server.manifest.runtime;
        this.appSources = this.server.manifest.getAppFiles(this.appConfig.name);
        try {
            const appPath = this.appConfig.entry.replace(".tsx", "").replace(".ts", "");
            this.appComponent = require(`../../../src/apps/${appPath}`).default;
        }
        catch (e) {
            console.log(`src/apps/${this.appConfig.entry} has no default exports!`);
            throw e;
        }
    }
    renderHTML({ title, styles, scripts, appString, head, ssrData, favicon = "data:;base64,iVBORw0KGgo=", importPaths }) {
        const chunkFiles = this.server.manifest.getChunkFiles(importPaths);
        return (react_1.default.createElement("html", null,
            react_1.default.createElement("head", null,
                react_1.default.createElement("title", null, title || this.appConfig.title),
                head,
                this.renderStyles(this.runtimeSources.styles),
                this.renderStyles(chunkFiles.styles),
                styles && this.renderStyles(styles),
                this.renderStyles(this.appSources.styles),
                react_1.default.createElement("link", { rel: "icon", href: favicon })),
            react_1.default.createElement("body", null,
                react_1.default.createElement("div", { id: "root", dangerouslySetInnerHTML: { __html: appString } }),
                react_1.default.createElement("script", { id: "SSR_DATA", dangerouslySetInnerHTML: { __html: `window.SSR_DATA = ${JSON.stringify(ssrData)};` } }),
                this.renderScripts(this.runtimeSources.scripts),
                this.renderScripts(chunkFiles.scripts),
                scripts && this.renderScripts(scripts),
                this.renderScripts(this.appSources.scripts))));
    }
    renderStyles(srcs) {
        return srcs.map((s, i) => react_1.default.createElement("link", { key: i, href: s, rel: "stylesheet" }));
    }
    renderScripts(srcs) {
        return srcs.map((s, i) => react_1.default.createElement("script", { key: i, src: s }));
    }
}
exports.Renderer = Renderer;
