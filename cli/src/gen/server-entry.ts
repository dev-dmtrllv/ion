import path from "path";
import fs from "fs";
import { getFilesRecursive, write } from "../utils";

export const genServerEntry = (projectDir: string, serverEntry: string) =>
{
	const entryFile = path.resolve(projectDir, "node_modules", ".gen", "server", path.basename(serverEntry));
	write(entryFile, `const { Client } = require("ion/client");
const App = require("../../../src/app/${path.basename(serverEntry)}").default;

Client.render(App);`);

	return entryFile;
}
