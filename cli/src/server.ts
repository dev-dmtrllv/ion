import path from "path";
import fs from "fs";
import { IonConfig } from "./config/ion-config";
import { ChildProcess, fork } from "child_process";

export class Server
{
	public readonly path: string;
	public readonly ionConfig: IonConfig;
	public readonly projectPath: string;

	private didChange: boolean = false;
	private isWatching: boolean = false;
	private proc: ChildProcess | null = null;

	public constructor(projectPath: string, ionConfig: IonConfig)
	{
		this.projectPath = projectPath;
		this.path = path.resolve(projectPath, "src", "server");
		this.ionConfig = ionConfig;
	}

	public watch = (onChange?: () => void) =>
	{
		if (!this.isWatching)
		{
			fs.watch(this.path, { recursive: true }, (e, file) => 
			{
				if (!this.didChange)
				{
					this.didChange = true;
					setTimeout(async () => 
					{
						await this.start(true);
						onChange && onChange();
						this.didChange = false;
					}, 0);
				}
			});
		}
	}

	private kill = () => new Promise<void>((res) => 
	{
		if (this.proc)
			this.proc.kill();
		setTimeout(res, 0);
	});

	public start = async (restart: boolean = false) =>
	{
		console.log(`${restart ? "re" : ""}starting server...`);
		await this.kill();
		this.proc = fork(path.resolve(__dirname, "./server-spawner"), [JSON.stringify(this.ionConfig), this.projectPath]);
	}

	public updateApp = () =>
	{
		this.proc?.send("update-app");
	}
}
