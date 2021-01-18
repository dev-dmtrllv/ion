import { ICommand } from "./icommand"

const help: ICommand = () =>
{
	console.log("available commands:")
	console.log("[run] runs the app in the current working directory");
	console.log("[new] creates an new app");
}

export default help;
