"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTsLoader = void 0;
const babel_config_1 = require("./config/babel-config");
const override_require_1 = require("./override-require");
const initTsLoader = () => {
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
            ["module-resolver", { root: process.cwd(), alias: babel_config_1.getBabelAliases() }],
            "@babel/plugin-syntax-dynamic-import",
            ["@babel/plugin-proposal-decorators", { "legacy": true }],
            ["@babel/plugin-proposal-class-properties", { "loose": true }],
            "@babel/plugin-proposal-object-rest-spread",
            "transform-es2015-modules-commonjs",
        ],
    });
    override_require_1.overrideRequire();
};
exports.initTsLoader = initTsLoader;
