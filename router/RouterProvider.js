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
exports.RouterProvider = exports.RouterProviderContext = void 0;
const react_1 = __importDefault(require("react"));
const async_1 = require("../async");
exports.RouterProviderContext = react_1.default.createContext(null);
/**
 * Gets the redirect info from the urls query string
 * @param url the url from which to parse the redirect info
 */
const getRedirectInfo = (url) => {
    const [, query = ""] = url.split("?");
    const parts = query.split("&");
    for (const str in parts)
        if (str.startsWith("redirect_info=")) {
            const [, val] = str.split("=");
            return JSON.parse(decodeURIComponent(val));
        }
    return null;
};
const RouterProvider = (props) => {
    const { updateDataPatch, data } = react_1.default.useContext(async_1.AsyncContext);
    const [url, setUrl] = react_1.default.useState(props.url);
    const urlRef = react_1.default.useRef(props.url);
    const redirectInfo = react_1.default.useRef(getRedirectInfo(props.url));
    const updateCallCounter = react_1.default.useRef(0);
    const changeHandlers = react_1.default.useRef([]);
    const updateUrlTimeout = react_1.default.useRef(null);
    const updateURL = (_url, fromPushState = false) => {
        // keep count references to each updateURL call this way we know which call to cancel
        // when another updateURL call was made
        const callID = ++updateCallCounter.current;
        // first cancle all the routing
        if (updateUrlTimeout.current) {
            const { url } = updateUrlTimeout.current;
            changeHandlers.current.forEach((listener) => listener("canceled", url));
        }
        if (_url !== urlRef.current) {
            // lets start routing
            const parts = _url.split("?");
            _url = parts[0];
            // we need to get the max ms to wait before routing from the routeChangeListeners
            let msToWait = 0;
            changeHandlers.current.forEach((listener) => {
                let ms = listener("start", _url);
                if (typeof ms === "number" && (ms > msToWait))
                    msToWait = ms;
            });
            const timeout = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                let redirects = [_url];
                // recursive methods to keep prefetching, unless a redirect cycle is detected ofcourse
                const prefetchRoutes = (routeUrl) => __awaiter(void 0, void 0, void 0, function* () {
                    let redirectTo = null;
                    const wrappedApp = (react_1.default.createElement(exports.RouterProvider, { url: routeUrl, onRedirect: (from, to) => { redirectTo = to; } }, exports.RouterProvider.app));
                    const initData = yield async_1.prefetch(wrappedApp, Object.assign({}, data), () => !redirectTo && (callID == updateCallCounter.current));
                    if (callID == updateCallCounter.current) {
                        if (redirectTo) {
                            if (redirects.includes(redirectTo) || (redirectTo === urlRef.current)) {
                                throw new Error(`Found redirection cycle! ${urlRef.current} -> ${redirects.join(" -> ")}`);
                            }
                            else {
                                redirects.push(redirectTo);
                                return yield prefetchRoutes(redirectTo);
                            }
                        }
                        return initData;
                    }
                    return null;
                });
                const newInitData = yield prefetchRoutes(_url);
                if (callID == updateCallCounter.current) {
                    let routeToUrl = redirects.pop();
                    updateDataPatch(newInitData, false);
                    if (redirects.length > 0) // we got a redirect!
                     {
                        redirectInfo.current = {
                            from: _url,
                            to: routeToUrl
                        };
                        const redirectQueryStr = `${encodeURIComponent("redirect_info")}=${encodeURIComponent(JSON.stringify(redirectInfo))}`;
                        routeToUrl += (!routeToUrl.includes("?") ? "?" : "") + redirectQueryStr;
                    }
                    else {
                        redirectInfo.current = null;
                        routeToUrl += parts[1] ? `?${parts[1]}` : "";
                    }
                    if (!fromPushState) {
                        document.title = urlRef.current;
                        window.history.pushState(null, urlRef.current, urlRef.current);
                        window.history.replaceState(null, routeToUrl, routeToUrl);
                    }
                    urlRef.current = routeToUrl;
                    setUrl(routeToUrl);
                }
                else if (env.isDev) {
                    console.info("canceled routing to " + redirects.pop());
                }
            }), msToWait);
            updateUrlTimeout.current = {
                timeout,
                url: _url
            };
        }
    };
    const handleRedirect = (from, to, exact) => {
        props.onRedirect && props.onRedirect(from, to, exact);
    };
    const routeTo = (to) => { updateURL(to); };
    const matcher = (matchUrl, exact) => {
        const p1 = url.split("?")[0].split("/").filter(s => !!s);
        const p2 = matchUrl.split("?")[0].split("/").filter(s => !!s);
        if (exact && (p1.length !== p2.length))
            return false;
        else if (p1.length < p2.length)
            return false;
        for (let i = 0; i < p1.length; i++) {
            const m1 = p1[i];
            const m2 = p2[i];
            if (m2 && !m2.startsWith(":") && (m1 !== m2))
                return false;
        }
        return true;
    };
    const getParams = (matchUrl, exact) => {
        if (!matcher(matchUrl, exact))
            return {};
        const p1 = url.split("?")[0].split("/").filter(s => !!s);
        const p2 = matchUrl.split("?")[0].split("/").filter(s => !!s);
        const params = {};
        for (let i = 0; i < p1.length; i++) {
            const m1 = p1[i];
            const m2 = p2[i];
            if (m2 && m2.startsWith(":"))
                params[m2.substring(1, m2.length)] = m1;
        }
        return params;
    };
    const [, queryStr = ""] = url.split("?");
    const query = {};
    queryStr.split("&").forEach(p => {
        let [key, val] = p.split("=");
        if (key) {
            key = decodeURIComponent(key);
            val = decodeURIComponent(val);
            if (key === "redirect_info") {
                redirectInfo.current = JSON.parse(val);
            }
            else {
                try {
                    val = JSON.parse(val);
                }
                catch (_a) { }
                query[key] = val;
            }
        }
    });
    const addChangeListener = (listener) => { (!changeHandlers.current.includes(listener)) && changeHandlers.current.push(listener); };
    const removeChangeListener = (listener) => { (changeHandlers.current.includes(listener)) && changeHandlers.current.splice(changeHandlers.current.indexOf(listener), 1); };
    const ctx = {
        url,
        match: matcher,
        redirect: handleRedirect,
        routeTo,
        getParams,
        query,
        redirectInfo: redirectInfo.current,
        addChangeListener,
        removeChangeListener,
        cache: (url, duration) => { props.onCache && props.onCache(url, duration); }
    };
    react_1.default.useEffect(() => {
        ctx.redirect = (from, to, exact) => {
            if (props.onRedirect) {
                props.onRedirect(from, to, exact);
                updateURL(to);
            }
        };
        window.onpopstate = (e) => {
            e.preventDefault();
            const queryStr = window.location.search === "?" ? "" : window.location.search;
            updateURL(window.location.pathname + queryStr, true);
            return false;
        };
    }, []);
    const isInitialMount = react_1.default.useRef(true);
    react_1.default.useEffect(() => {
        if (!isInitialMount.current) {
            changeHandlers.current.forEach(listener => listener("end", url));
            updateUrlTimeout.current = null;
        }
        else {
            isInitialMount.current = false;
        }
    }, [url]);
    return (react_1.default.createElement(exports.RouterProviderContext.Provider, { value: ctx }, props.children));
};
exports.RouterProvider = RouterProvider;
/**
 * The app should register itself on the client side so that prefetching data on route change works correctly.
 */
exports.RouterProvider.app = null;
