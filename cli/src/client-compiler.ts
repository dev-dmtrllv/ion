import path from "path";
import webpack from "webpack";
import { IonConfig } from "./config/ion-config";
import { createClientConfig } from "./config/webpack-client-config";
import { cleanAppEntries, genAppEntry } from "./gen/app-entry";
import { writeJson } from "./utils";

export class ClientCompiler
{
	public readonly ionConfig: IonConfig;

	private compiler: webpack.Compiler;
	private watcher: Watching | null = null;
	private hash: string | undefined;

	public constructor(projectDir: string, ionConfig: IonConfig, isDev: boolean = true)
	{
		this.ionConfig = ionConfig;

		cleanAppEntries(projectDir);

		const appEntries = {};

		for (const appName in ionConfig.apps)
			appEntries[appName] = genAppEntry(projectDir, ionConfig.apps[appName].entry);

		this.compiler = webpack(createClientConfig(appEntries, (manifest) => { writeJson(path.resolve(projectDir, "manifest.json"), manifest); }, isDev));
	}

	public readonly close = () =>
	{
		return new Promise<void>((res) =>
		{
			if (this.watcher)
				this.watcher.close(() => res());
			else
				res();
		});
	}

	public readonly watch = (onChange: () => any) =>
	{
		return new Promise<void>((res, rej) => 
		{
			if (!this.watcher)
			{
				console.log("client compiler started...");
				let isResolved = false;
				this.watcher = this.compiler.watch({ ignored: ["src/server/**", "node_modules/**"] }, (err, stats) =>
				{
					if (err)
					{
						if (!isResolved)
						{
							isResolved = true;
							rej(err);
						}
						else
						{
							console.error(err);
						}
					}
					else
					{
						if (stats)
						{
							console.log(stats.toString("minimal"));
						}

						if (!isResolved)
						{
							isResolved = true;
							res();
						}
						else if (this.hash !== stats!.hash)
						{
							this.hash = stats!.hash;
							onChange();
						}
					}

				});
			}
			else
			{
				rej("Compiler is already watching!");
			}
		});
	}
}

type CallbackFunction<T = any> = () => T;

declare abstract class Watching
{
	startTime: null | number;
	invalid: boolean;
	handler: CallbackFunction<webpack.Stats>;
	callbacks: CallbackFunction<void>[];
	closed: boolean;
	suspended: boolean;
	watchOptions: {
		aggregateTimeout?: number;
		followSymlinks?: boolean;
		ignored?: string | RegExp | string[];
		poll?: number | boolean;
		stdin?: boolean;
	};
	compiler: webpack.Compiler;
	running: boolean;
	watcher: any;
	pausedWatcher: any;
	watch(
		files: Iterable<string>,
		dirs: Iterable<string>,
		missing: Iterable<string>
	): void;
	invalidate(callback?: CallbackFunction<void>): void;
	suspend(): void;
	resume(): void;
	close(callback: CallbackFunction<void>): void;
}
