import path from "path";
import { writeJson } from "../utils";

export const genPackageJson = (projectDir: string, name: string) =>
{
	writeJson(path.resolve(projectDir, "package.json"), {
		name,
		version: "0.1.0",
		description: "a server side rendered react app with request prefetching and caching",
		main: "./dist/server.js", // TODO what should we have here?
		scripts: {
			start: "ion start",
			dev: "ion start",
			build: "ion build"
		},
		author: "",
		license: "MIT",
		repository: "example.repository",
	});
}

