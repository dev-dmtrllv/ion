"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerConfig = void 0;
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const webpack_node_externals_1 = __importDefault(require("webpack-node-externals"));
const babel_config_1 = require("./babel-config");
const createServerConfig = (entry, dev = true) => {
    const cwd = process.cwd();
    return {
        entry,
        devtool: "source-map",
        mode: dev ? "development" : "production",
        target: "node",
        output: {
            path: path_1.default.resolve(cwd, "dist"),
            filename: "[name].bundle.js",
            chunkFilename: "[chunkhash].chunk.js",
            publicPath: "",
        },
        node: {
            __dirname: false,
            __filename: false,
            global: false
        },
        module: {
            rules: [
                {
                    test: /\.(j|t)sx?$/,
                    use: {
                        loader: "babel-loader",
                        options: babel_config_1.createBabelConfig("server")
                    }
                },
                {
                    test: /\.js$/,
                    use: ["source-map-loader"],
                    enforce: "pre"
                },
                {
                    test: /\.(jpe?g|png|gif|svg|ico)$/i,
                    use: {
                        loader: "url-loader",
                        options: {
                            fallback: "file-loader",
                            emitFile: false,
                            limit: 1000,
                            name: "/images/[name].[ext]",
                        },
                    },
                },
                {
                    test: /^(?!.*\.(jsx?|tsx?|json|jpe?g|png|gif|svg|ico))/,
                    loader: "ignore-loader"
                }
            ]
        },
        externals: [webpack_node_externals_1.default({ allowlist: [/^ion/] })],
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
            alias: babel_config_1.getBabelAliases()
        },
        plugins: [
            new webpack_1.default.DefinePlugin({
                "env": {
                    isServer: true,
                    isClient: false,
                    isDev: dev
                }
            })
        ]
    };
};
exports.createServerConfig = createServerConfig;
