export class Config
{
	private static config: IConfig | null = null;

	public static get(): IConfig
	{
		if (!this.config)
		{
			const config = require("../../../ion.json") as IConfig;
			if (!env.isDev)
			{
				const { database } = require("../../../ion.secrets.json") as SecretsConfig;
				if (config.database && database)
					config.database = { ...config.database, ...database };
			}
			this.config = config;
			if (!this.config.server.host)
				this.config.server.host = "localhost";
			if (!this.config.server.port)
				this.config.server.port = 3001;
			if (!this.config.server.entry)
				this.config.server.entry = "index.ts";
		}
		return this.config!;
	}
}

export type IonAppConfigWithName = IonAppConfig & { name: string; };

export type IonAppConfig = {
	entry: string;
	url: string;
	title?: string;
	session?: SessionConfig;
};

export type SessionConfig = {
	name?: string;
	secret: string;
	maxAge?: number;
	useFileStorage?: boolean;
};

export type DatabaseConfig = {
	user: string;
	password: string;
	databaseName: string;
	host?: string;
	port?: number;
	poolConnectionLimit?: number;
};

export type IConfig = {
	apps: {
		[name: string]: IonAppConfig;
	};
	server: {
		entry?: string;
		host?: string;
		port?: number;
		apiPath?: string;
		session?: SessionConfig;
	};
	database?: DatabaseConfig;
};

type SecretsConfig = {
	database?: DatabaseConfig;
	server?: {
		session?: SessionConfig;
	};
};
