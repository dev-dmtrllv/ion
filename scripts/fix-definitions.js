const fs = require("fs");

module.exports = {
	fixDefinitions: () =>
	{
		const def = fs.readFileSync("server/Server.d.ts", "utf-8").replace("type AppName = string;", "type AppName = keyof (typeof import(\"../../../ion.json\"))[\"apps\"];");
		fs.writeFileSync("server/Server.d.ts", def, "utf-8");
	}
};
