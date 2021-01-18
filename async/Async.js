"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Async = exports.useAsyncContext = void 0;
const react_1 = __importDefault(require("react"));
const AsyncContext_1 = require("./AsyncContext");
const useAsyncContext = () => react_1.default.useContext(AsyncContext_1.AsyncContext);
exports.useAsyncContext = useAsyncContext;
const Async = ({ componentID, id, resolver, children, prefetch = true, cache = true }) => {
    const ctx = react_1.default.useContext(AsyncContext_1.AsyncContext);
    if (!ctx)
        throw new Error("No AsyncContext available!");
    const key = `${componentID}:${id}`;
    let data = ctx.data[key] || null;
    const [nonCacheState, setNonCacheState] = react_1.default.useState(data);
    if (!data && (cache === false))
        data = nonCacheState;
    react_1.default.useEffect(() => {
        const key = `${componentID}:${id}`;
        const data = ctx.data[key] || null;
        if (!data || (!data.error && !data.data)) {
            if (cache === false) {
                setNonCacheState({ isResolving: true });
                resolver().then(r => {
                    setNonCacheState({ isResolving: false, data: r });
                }).catch(e => {
                    setNonCacheState({ isResolving: false, error: e });
                });
            }
            else
                ctx.resolve(key, resolver, cache);
        }
    }, [id]);
    const updater = (newData) => ctx.updateDataPatch({ [key]: { data: newData, isResolving: false, cache } }, true);
    const deleter = () => ctx.deleteData(key, true);
    const render = (data) => children && children(data, updater, deleter) || null;
    if (!data && ctx.isPrefetching) {
        if (prefetch)
            ctx.resolve(key, resolver, cache);
        return render({ isResolving: true });
    }
    else if (data) {
        return render(data);
    }
    return render({ isResolving: true });
};
exports.Async = Async;
