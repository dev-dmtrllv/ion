import path from "path";
import fs from "fs";
import { getFilesRecursive, write } from "../utils";

export const genAppEntry = (projectDir: string, appEntry: string) =>
{
	if (appEntry[0] == "/" || appEntry[0] == "\\")
		appEntry = appEntry.substr(1, appEntry.length);

	appEntry = appEntry.replace(".tsx", "").replace(".ts", "");

	const entryFile = path.resolve(projectDir, "node_modules", ".gen", "apps", appEntry.replace(/\\/g, "_").replace(/\//g, "_") + ".js");
	write(entryFile, `const { Client } = require("ion/client");
const App = require("../../../src/apps/${appEntry}").default;

Client.render(App);`);

	return entryFile;
}

export const cleanAppEntries = (projectDir: string) =>
{
	const appsGenPath = path.resolve(projectDir, "node_modules", ".gen", "apps");
	if (fs.existsSync(appsGenPath))
	{
		const files = getFilesRecursive(appsGenPath);
		files.forEach(f => fs.unlinkSync(f));
	}
}
