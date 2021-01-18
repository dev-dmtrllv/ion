"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBabelAliases = exports.createBabelConfig = void 0;
const path_1 = __importDefault(require("path"));
const createBabelConfig = (target) => {
    const plugins = [
        ["module-resolver", { root: process.cwd(), alias: exports.getBabelAliases() }],
    ];
    if (target === "client")
        plugins.push(["@babel/plugin-transform-runtime", { "regenerator": true }]);
    plugins.push("@babel/plugin-syntax-dynamic-import", ["@babel/plugin-proposal-decorators", { "legacy": true }], ["@babel/plugin-proposal-class-properties", { "loose": true }], "@babel/plugin-proposal-object-rest-spread");
    return {
        exclude: [],
        cacheDirectory: true,
        presets: [
            ["@babel/preset-env", target === "server" ? { targets: { node: true } } : {}],
            "@babel/preset-typescript",
            "@babel/preset-react",
        ],
        plugins
    };
};
exports.createBabelConfig = createBabelConfig;
const getBabelAliases = () => {
    const aliasPaths = require(path_1.default.resolve(process.cwd(), "tsconfig.json")).compilerOptions.paths;
    const aliases = {};
    for (let alias in aliasPaths) {
        let p = aliasPaths[alias][0];
        if (p)
            aliases[alias.replace("/*", "")] = "./" + p.replace("/*", "");
    }
    return aliases;
};
exports.getBabelAliases = getBabelAliases;
