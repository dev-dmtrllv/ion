import path from "path";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { ManifestPlugin } from "../manifest-plugin";
import { createBabelConfig, getBabelAliases } from "./babel-config";

export const createClientConfig = (entries: { [name: string]: string; }, onManifest: (manifest: object) => any, dev: boolean = true): webpack.Configuration =>
{
	const cwd = process.cwd();
	return {
		entry: entries,
		devtool: "source-map",
		mode: dev ? "development" : "production",
		output: {
			path: path.resolve(cwd, "dist", "public"),
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
						options: createBabelConfig("client")
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
						MiniCssExtractPlugin.loader,
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
			modules: [path.resolve("./node_modules")],
			extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
			alias: getBabelAliases()
		},
		plugins: [
			new webpack.DefinePlugin({
				"env": {
					isServer: true,
					isClient: false,
					isDev: dev
				}
			}),
			new MiniCssExtractPlugin({
				filename: 'css/[name].css',
				chunkFilename: 'css/[id].css',
			}),
			new ManifestPlugin({ onManifest })
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
