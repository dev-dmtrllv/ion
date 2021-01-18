"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientConfig = void 0;
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
const manifest_plugin_1 = require("../manifest-plugin");
const babel_config_1 = require("./babel-config");
const createClientConfig = (entries, onManifest, dev = true) => {
    const cwd = process.cwd();
    return {
        entry: entries,
        devtool: "source-map",
        mode: dev ? "development" : "production",
        output: {
            path: path_1.default.resolve(cwd, "dist", "public"),
            filename: "js/[name].bundle.js",
            chunkFilename: "js/[chunkhash].chunk.js",
            publicPath: "/"
        },
        target: "web",
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: "babel-loader",
                        options: babel_config_1.createBabelConfig("client")
                    }
                },
                {
                    test: /\.js$/,
                    use: ["source-map-loader"],
                    enforce: "pre"
                },
                {
                    test: /\.s?(c|a)ss$/,
                    use: [
                        mini_css_extract_plugin_1.default.loader,
                        "css-loader",
                        "sass-loader",
                    ],
                    exclude: /node_modules/
                },
                {
                    test: /\.(jpe?g|png|gif|svg|ico)$/i,
                    use: {
                        loader: "url-loader",
                        options: {
                            fallback: "file-loader",
                            limit: 1000,
                            name: "images/[name].[ext]",
                        },
                    },
                }
            ]
        },
        resolve: {
            modules: [path_1.default.resolve("./node_modules")],
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
            }),
            new mini_css_extract_plugin_1.default({
                filename: 'css/[name].css',
                chunkFilename: 'css/[id].css',
            }),
            new manifest_plugin_1.ManifestPlugin({ onManifest })
        ],
        optimization: {
            runtimeChunk: {
                name: "runtime"
            },
            splitChunks: {
                chunks: "async",
                cacheGroups: {
                    default: false,
                    vendors: false,
                    vendor: {
                        chunks: "all",
                        test: /node_modules/,
                        priority: 20,
                        name: "vendor",
                    }
                }
            }
        }
    };
};
exports.createClientConfig = createClientConfig;
