const { spawn } = require("child_process");
const { fixDefinitions } = require("./fix-definitions");
const { platform } = require("os");

const build = (target, onDone) => spawn(platform() === "win32" ? "npm.cmd" : "npm", ["run", `build-${target}`], { stdio: "inherit" }).on("exit", () => onDone());

build("cli", () => { });
build("lib", () => 
{
	fixDefinitions();
});
