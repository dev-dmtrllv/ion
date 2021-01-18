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
exports.Dynamic = exports.getImportPaths = void 0;
const react_1 = __importDefault(require("react"));
const Async_1 = require("./Async");
const getImportPaths = (data, remove = false) => {
    const importPaths = [];
    const idLength = "Dynamic:".length;
    Object.keys(data).forEach((k) => {
        if (k.startsWith("Dynamic")) {
            importPaths.push(k.substr(idLength, k.length));
            if (remove)
                delete data[k];
        }
    });
    return importPaths;
};
exports.getImportPaths = getImportPaths;
const Dynamic = (_a) => {
    var { path, importer, children } = _a, rest = __rest(_a, ["path", "importer", "children"]);
    return (react_1.default.createElement(Async_1.Async, Object.assign({ resolver: importer, componentID: "Dynamic", id: path }, rest), ({ data, error, isResolving }) => children({ Component: data && data.default ? data.default : undefined, error, isResolving })));
};
exports.Dynamic = Dynamic;
