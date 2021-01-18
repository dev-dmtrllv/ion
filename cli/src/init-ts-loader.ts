import { getBabelAliases } from "./config/babel-config";
import { overrideRequire } from "./override-require";

export const initTsLoader = () =>
{
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
			["module-resolver", { root: process.cwd(), alias: getBabelAliases() }],
			"@babel/plugin-syntax-dynamic-import",
			["@babel/plugin-proposal-decorators", { "legacy": true }],
			["@babel/plugin-proposal-class-properties", { "loose": true }],
			"@babel/plugin-proposal-object-rest-spread",
			"transform-es2015-modules-commonjs",
		],
	});
	overrideRequire();
}
