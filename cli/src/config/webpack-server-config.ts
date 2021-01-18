import path from "path";
import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import { createBabelConfig, getBabelAliases } from "./babel-config";

export const createServerConfig = (entry: string, dev: boolean = true): webpack.Configuration =>
{
	const cwd = process.cwd();
	
	return {
		entry,
		devtool: "source-map",
		mode: dev ? "development" : "production",
		target: "node",
		output: {
			path: path.resolve(cwd, "dist"),
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
						options: createBabelConfig("server")
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
		externals: [nodeExternals({ allowlist: [/^ion/] })],
		resolve: {
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
			})
		]
	};
};
