#!/usr/bin/env node

import { ICommand } from "./commands/icommand";

const [, , cliScript = "", ...args] = process.argv;
const cwd = process.cwd();

const main = async () =>
{
	try
	{
		const command: ICommand = require("./commands/" + cliScript).default;
		await command(cwd, ...args);
	}
	catch (e)
	{
		// if (e.code !== "MODULE_NOT_FOUND")
			console.log(e);
		console.log(`"${cliScript}" is not a valid command!`);
	}
};

main();
