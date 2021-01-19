import path from "path";
import { getBabelAliases } from "./config/babel-config";
import { overrideRequire } from "./override-require";

export const initTsLoader = () =>
{
	const tsConfig = require(path.resolve(process.cwd(), "tsconfig.json"));

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
			["module-resolver", { root: tsConfig.compilerOptions.baseUrl || process.cwd(), alias: getBabelAliases() }],
			"@babel/plugin-syntax-dynamic-import",
			["@babel/plugin-proposal-decorators", { "legacy": true }],
			["@babel/plugin-proposal-class-properties", { "loose": true }],
			"@babel/plugin-proposal-object-rest-spread",
			
		],
	});
	overrideRequire();
}
