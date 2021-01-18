import proc from "child_process";
import { platform } from "os";

export const spawn = (command: string, args: string[], cwd: string = process.cwd()) =>
{
	command = platform() === "win32" ? command + ".cmd" : command;
	return new Promise<void>((res) => proc.spawn(command, args, { cwd, stdio: "inherit" }).on("exit", res));
}
