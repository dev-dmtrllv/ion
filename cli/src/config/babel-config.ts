import path from "path";

export const createBabelConfig = (target: "server" | "client") =>
{
	const tsConfig = require(path.resolve(process.cwd(), "tsconfig.json"));

	const plugins: any[] = [
		["module-resolver", { root: tsConfig.compilerOptions.baseUrl || process.cwd(), alias: getBabelAliases() }],
	];

	if (target === "client")
		plugins.push(["@babel/plugin-transform-runtime", { "regenerator": true }]);

	plugins.push(
		"@babel/plugin-syntax-dynamic-import",
		["@babel/plugin-proposal-decorators", { "legacy": true }],
		["@babel/plugin-proposal-class-properties", { "loose": true }],
		"@babel/plugin-proposal-object-rest-spread",
	);

	return {
		exclude: [],
		cacheDirectory: true,
		presets: [
			["@babel/preset-env", target === "server" ? { targets: { node: true } } : {}],
			"@babel/preset-typescript",
			"@babel/preset-react",
		],
		plugins
	}
}

export const getBabelAliases = () =>
{
	const aliasPaths = require(path.resolve(process.cwd(), "tsconfig.json")).compilerOptions.paths;
	const aliases = {};

	for (let alias in aliasPaths)
	{
		let p = aliasPaths[alias][0];
		if (p)
			aliases[alias.replace("/*", "")] = "./" + p.replace("/*", "");
	}

	return aliases;
}
