const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { platform } = require("os");
const { fixDefinitions } = require("./fix-definitions");

const watch = (target) => spawn(platform() === "win32" ? "npm.cmd" : "npm", ["run", `watch-${target}`], { stdio: "inherit" });

const build = (target, onDone) => spawn(platform() === "win32" ? "npm.cmd" : "npm", ["run", `build-${target}`], { stdio: "inherit" }).on("exit", () => onDone());

build("lib", () => 
{
	watch("cli");
	watch("lib");
	let timeout = null;
	fs.watch(path.resolve(__dirname, "../server/Server.d.ts"), () => 
	{
		if (!timeout)
			timeout = setTimeout(() => 
			{
				fixDefinitions();
				timeout = null;
			}, 1000);
	});
});
