"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTsLoader = void 0;
const path_1 = __importDefault(require("path"));
const babel_config_1 = require("./config/babel-config");
const override_require_1 = require("./override-require");
const initTsLoader = () => {
    const tsConfig = require(path_1.default.resolve(process.cwd(), "tsconfig.json"));
    require("@babel/register")({
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        cache: true,
        root: process.cwd(),
        ignore: [
            /node_modules/,
            "./package-lock.json",
            "./package.json",
            /\.s?(c|a)ss$/
        ],
        presets: [
            ["@babel/preset-env", { targets: { node: true } }],
            "@babel/preset-typescript",
            "@babel/preset-react",
        ],
        plugins: [
            ["module-resolver", { root: tsConfig.compilerOptions.baseUrl || process.cwd(), alias: babel_config_1.getBabelAliases() }],
            "@babel/plugin-syntax-dynamic-import",
            ["@babel/plugin-proposal-decorators", { "legacy": true }],
            ["@babel/plugin-proposal-class-properties", { "loose": true }],
            "@babel/plugin-proposal-object-rest-spread",
        ],
    });
    override_require_1.overrideRequire();
};
exports.initTsLoader = initTsLoader;
