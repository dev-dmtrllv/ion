import path from "path";
import fs from "fs";
import { getInput } from "../utils/input";
import { ICommand } from "./icommand";
import { DatabaseConfig, IonConfig } from "../config/ion-config";
import { spawn } from "../utils/spawn";
import { writeJson } from "../utils";
import { genProject } from "../gen/project";

const devDependencies = [
	"@babel/core",
	"@babel/preset-env",
	"@babel/preset-react",
	"@babel/preset-typescript",
	"@types/express",
	"@types/node",
	"@types/react",
	"@types/react-dom",
	"@types/request",
	"babel-plugin-async-import",
	"babel-loader",
	"babel-plugin-transform-es2015-modules-commonjs",
	"css-loader",
	"file-loader",
	"ignore-loader",
	"mini-css-extract-plugin",
	"sass-loader",
	"source-map-loader",
	"typescript",
	"url-loader",
	"sass",
	"webpack",
	"webpack-node-externals",
	"babel-plugin-module-resolver",
	"@babel/plugin-transform-runtime",
	"@babel/plugin-proposal-decorators",
	"@babel/plugin-proposal-class-properties",
	"@babel/plugin-proposal-object-rest-spread",
	"@babel/plugin-syntax-dynamic-import",
];

const dependencies = [
	"body-parser",
	"cookie-parser",
	// "dev-dmtrllv/ion",
	"express-session",
	"express",
	"react",
	"react-dom",
	"fetch",
];

const createPackageJson = (projectDir: string, name: string) =>
{
	writeJson(path.resolve(projectDir, "package.json"), {
		name,
		version: "0.1.0",
		description: "a server side rendered react app with request prefetching and caching",
		// main: "./dist/server.js", // TODO what should we have here?
		scripts: {
			watch: "ion start",
			build: "ion build"
		},
		author: "",
		license: "MIT",
		repository: "example.repository",
	});
}

const newProject: ICommand = async (cwd, ...args) =>
{
	// check if project exists
	if (args[0] && fs.existsSync(path.resolve(cwd, args[0])))
	{
		console.log(`ion project ${args[0]} already exists!`);
		return;
	}

	// get project name and project path
	const name = await getInput("name", { defaultValue: args[0] ? path.basename(args[0]) : undefined });
	const projectPath = path.resolve(cwd, args[0] || name);

	// check if project exists
	if (fs.existsSync(projectPath))
	{
		console.log(`ion project ${projectPath} already exists!`);
		return;
	}

	const withDatabase = await getInput("use database? y/n", { defaultValue: "y" });

	// ask for database configuration 
	const databaseConfig: DatabaseConfig | undefined = withDatabase === "y" ? {
		databaseName: await getInput("database name"),
		user: await getInput("username", { defaultValue: "root" }),
		password: await getInput("password", { defaultValue: "root" }),
		host: await getInput("host", { defaultValue: "localhost" }),
		port: Number(await getInput("port", { defaultValue: "3306" })),
		maxPoolConnections: Number(await getInput("max pool connections", { defaultValue: "10" })),
	} : undefined;

	// create the project directory
	fs.mkdirSync(projectPath, { recursive: true });

	// create the ion configuration 
	const ionConfig = new IonConfig(projectPath, IonConfig.defaultConfig.apps, IonConfig.defaultConfig.server, databaseConfig);
	ionConfig.save();

	// create the package.json
	createPackageJson(projectPath, name);

	// install all dependencies
	await spawn("npm", ["i", "--save", ...dependencies], projectPath);
	await spawn("npm", ["i", "--save-dev", ...devDependencies], projectPath);

	// generate startup project
	genProject(projectPath);
}

export default newProject;
