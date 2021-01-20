import fs from "fs";
import path from "path";
import { writeJson } from "../utils";

export class IonConfig implements IIonConfig
{
	public static readonly defaultConfig: IDefaultIonConfig = {
		apps: {
			app: {
				entry: "index.tsx",
				url: "/",
				title: "App"
			}
		},
		server: {
			host: "localhost",
			port: 3001,
			apiPath: "server/api",
			staticPath: "static",
			session: {
				secret: "keyboard cat"
			}
		}
	}

	private readonly configPath: string;

	public readonly apps: { [name: string]: IonAppConfig }
	public readonly server: ServerConfig;
	public readonly database: DatabaseConfig | undefined;

	private isWatching: boolean = false;
	private watchTimeout: NodeJS.Timeout | null = null;

	public static fromPath(projectPath: string)
	{
		const configPath = path.resolve(projectPath, "ion.json");
		if (fs.existsSync(configPath))
		{
			const config: IIonConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
			return new IonConfig(projectPath, config.apps, config.server, config.database);
		}

		return new IonConfig(projectPath);
	}

	public constructor(projectPath: string, apps: { [name: string]: IonAppConfig } = IonConfig.defaultConfig.apps, serverConfig: ServerConfig = IonConfig.defaultConfig.server, databaseConfig?: DatabaseConfig)
	{
		this.configPath = path.resolve(projectPath, "ion.json");
		this.apps = apps;
		this.server = { entry: "index.ts", ...serverConfig };
		this.database = databaseConfig;
		this.removeDuplicateApps();
	}

	private removeDuplicateApps = () =>
	{
		const appKeys = Object.keys(this.apps)
		const apps = appKeys.map(k => this.apps[k]);
		for (let i = 0; i < apps.length; i++)
		{
			const target = apps[i];
			for (let j = i + 1; j < apps.length; j++)
			{
				const comparer = apps[j];
				if (target.entry === comparer.entry)
				{
					console.log(`found duplicate entry for the apps "${appKeys[i]}" and "${appKeys[j]}"!`);
					delete this.apps[appKeys[j]];
				}
				else if (target.url === comparer.url)
				{
					console.log(`found duplicate url for the apps "${appKeys[i]}" and "${appKeys[j]}"`);
					delete this.apps[appKeys[j]];
				}
			}
		}
	}

	public save()
	{
		writeJson(this.configPath, {
			apps: this.apps,
			server: this.server,
			database: this.database
		});
	}

	public watch(onChange: (old: IIonConfig) => any)
	{
		if (!this.isWatching)
		{
			this.isWatching = true;
			fs.watch(this.configPath, {}, (e, file) => 
			{
				if (e === "change" && !this.watchTimeout)
				{
					const old = JSON.parse(JSON.stringify(this));

					this.watchTimeout = setTimeout(() => 
					{
						if (fs.existsSync(this.configPath))
						{
							const json: IIonConfig = JSON.parse(fs.readFileSync(this.configPath, "utf-8"));
							(this as any).apps = json.apps;
							(this as any).serverConfig = json.server;
							(this as any).databaseConfig = json.database;
						}
						else
						{
							console.warn(`Could not find ion configuration file "ion.json"! falling back to default config!`);
							(this as any).apps = IonConfig.defaultConfig.server;
							(this as any).serverConfig = IonConfig.defaultConfig.server;
							(this as any).databaseConfig = undefined;
						}
						this.removeDuplicateApps();
						onChange(old);
						this.watchTimeout = null;
					}, 100);
				}
			});
		}
	}
}

export interface IIonConfig
{
	readonly apps: { [name: string]: IonAppConfig }
	readonly server: ServerConfig;
	readonly database: DatabaseConfig | undefined;
}

export type IonAppConfig = {
	entry: string;
	title?: string;
	url: string;
};


export type SessionConfig = {
	name?: string;
	secret: string;
	maxAge?: number;
	useFileStorage?: boolean;
};


export type ServerConfig = {
	entry?: string;
	host: string;
	port: number;
	apiPath: string;
	staticPath?: string;
	session?: SessionConfig;
};

export type DatabaseConfig = {
	databaseName: string;
	user: string;
	password: string;
	host: string;
	port: number;
	maxPoolConnections: number;
};

export interface IDefaultIonConfig
{
	readonly apps: { readonly [name: string]: IonAppConfig }
	readonly server: Readonly<ServerConfig>;
}
