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
exports.AsyncProvider = exports.AsyncContext = void 0;
const react_1 = __importDefault(require("react"));
exports.AsyncContext = react_1.default.createContext(null);
const AsyncProvider = ({ initData = {}, isPrefetching = false, onResolve, children }) => {
    const [data, setData] = react_1.default.useState(initData);
    const ref = react_1.default.useRef(initData);
    ref.current = data;
    const addData = (key, _data) => {
        ref.current[key] = _data;
        setData(Object.assign({}, ref.current));
    };
    const deleteData = (key, rerender = true) => {
        if (!ref.current[key])
            return false;
        try {
            delete ref.current[key];
            delete data[key];
            if (rerender)
                setData(Object.assign({}, ref.current));
            return true;
        }
        catch (_a) {
            return false;
        }
    };
    const updateDataPatch = (_data, rerender = true) => {
        for (const k in _data)
            ref.current[k] = data[k] = _data[k];
        if (rerender)
            setData(Object.assign({}, ref.current));
    };
    const resolve = (key, resolver, cache = false) => __awaiter(void 0, void 0, void 0, function* () {
        if (isPrefetching) {
            onResolve && onResolve(key, resolver, cache);
        }
        else {
            const cacheProp = typeof cache === "number" ? Date.now() + cache : !!cache;
            try {
                const responseData = yield resolver();
                addData(key, { isResolving: false, data: responseData, cache: cacheProp });
            }
            catch (e) {
                addData(key, { isResolving: false, error: e, cache: cacheProp });
            }
        }
    });
    const ctx = {
        resolve,
        deleteData,
        updateDataPatch,
        isPrefetching,
        data
    };
    react_1.default.useEffect(() => {
        // clean up cache
        for (const k in ref.current) {
            const _cache = ref.current[k].cache;
            if ((typeof _cache === "number" && _cache < Date.now()) || !_cache) {
                delete ref.current[k];
                try {
                    delete data[k];
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    }, [data]);
    return (react_1.default.createElement(exports.AsyncContext.Provider, { value: ctx }, children));
};
exports.AsyncProvider = AsyncProvider;
