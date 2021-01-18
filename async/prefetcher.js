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
exports.prefetch = void 0;
const react_1 = __importDefault(require("react"));
const server_1 = __importDefault(require("react-dom/server"));
const AsyncContext_1 = require("./AsyncContext");
const prefetch = (app, initData = {}, onShouldResolve = () => true) => __awaiter(void 0, void 0, void 0, function* () {
    const info = [];
    const resolvers = [];
    const onResolve = (key, resolver, cache = true) => {
        if (!info.find(i => i.key === key)) {
            info.push({ key, cache: typeof cache === "number" ? (Date.now() + cache) : cache });
            resolvers.push(resolver);
        }
    };
    server_1.default.renderToStaticMarkup(react_1.default.createElement(AsyncContext_1.AsyncProvider, { initData: initData, onResolve: onResolve, isPrefetching: true }, app));
    if ((info.length > 0) && onShouldResolve()) {
        const resolvePromises = resolvers.map(r => r());
        const data = yield Promise.allSettled(resolvePromises);
        data.forEach((d, i) => {
            const k = info[i].key;
            const cache = info[i].cache;
            if (d.value)
                initData[k] = { data: d.value, isResolving: false, cache };
            else
                initData[k] = { error: d.reason, isResolving: false, cache };
        });
        yield exports.prefetch(app, initData);
    }
    return initData;
});
exports.prefetch = prefetch;
