import path from "path";
import express, { Application, Router } from "express";
import bodyParser from "body-parser";
import http from "http";
import session from "express-session";
import createMySqlSessionStore from "express-mysql-session";
import createFileSessionStore from "session-file-store";
import { Api, ApiDefinition, ApiMethods, ApiType } from "./Api";
import { Manifest } from "./Manifest";
import { Renderer, RendererType } from "./Renderer";
import { Config, IConfig, IonAppConfig, IonAppConfigWithName } from "./Config";
import { Table } from "./Table";

export class Server
{
	public readonly host: string;
	public readonly port: number;
	public readonly expressApp: Application;
	public readonly apps: ConfiguredApps = {};
	public readonly manifest: Manifest;
	public readonly apiRouter: express.Router;

	private readonly _flatApiTree: { [key: string]: ApiType<Api> } = {};
	private readonly _clientApiInfo: { [key: string]: { methods: ApiMethods[]; url: string } } = {};
	private readonly _renderers: Renderer[] = [];

	private _httpServer: http.Server;
	private _isListening: boolean;

	public constructor()
	{
		const config = Config.get();

		this.host = config.server.host || "127.0.0.1";
		this.port = config.server.port || 80;

		this.expressApp = express();

		this.manifest = new Manifest(require("../../../manifest.json"));

		if (env.isDev)
		{
			process.on("message", (msg) => 
			{
				if (msg == "update-app")
				{
					const appPath = path.resolve(process.cwd(), "src", "app");
					for (const key in require.cache)
					{
						if (key.includes(appPath) || key.endsWith("manifest.json"))
							delete require.cache[key];
					}
					(this as any).manifest = new Manifest(require("../../../manifest.json"));
					this._renderers.forEach(r => r.loadAppComponent());
				}
			});
		}

		this.configureSession(config);
		this.configureApi(config);
		this.apps = this.configureApps(config);
		this.initializeRoutes();
		this.init();
	}

	public readonly callApi = async (url: string, method: ApiMethods, data: any, req: express.Request, res: express.Response) =>
	{
		if (this._flatApiTree[url])
		{
			const api = new this._flatApiTree[url](req, res);
			const apiFn = api[method];
			if (apiFn)
			{
				return await apiFn(data);
			}
			else
			{
				throw `${url} has no ${method} method!`;
			}
		}
		else
		{
			throw `${url} does not exists!`;
		}
	}

	private initializeRoutes()
	{
		for (const name in this.apps)
		{
			const app = this.apps[name];
			const renderer: Renderer = new (app.renderer || Renderer)(this, app.config, this._clientApiInfo);
			this._renderers.push(renderer);
			this.expressApp.use(app.config.url, app.router);
			app.router.get("*", renderer.render);
		}
	}

	protected setRenderer<T extends Renderer>(app: AppName, rendererType: RendererType<T>): void { (this.apps[app] as any).renderer = rendererType; };

	protected configureSession({ server, apps, database }: IConfig)
	{
		if (server.session)
		{
			console.log("initializing session handling...");

			const { secret, maxAge, name = `SSID`, useFileStorage } = server.session;

			let sessionStore: any;

			// if we have a database use the mysql session module
			if (database && !useFileStorage)
			{
				console.log("using database session storage");
				const MySqlStore = createMySqlSessionStore(session as any);

				sessionStore = new MySqlStore({
					host: database.host,
					port: database.port,
					connectionLimit: database.poolConnectionLimit,
					user: database.user,
					password: database.password,
					createDatabaseTable: true,
					database: database.databaseName,
					schema: {
						tableName: "sessions"
					},
				});
			}
			else
			{
				console.log("using filesystem session storage");
				const FileStore = createFileSessionStore(session);
				sessionStore = new FileStore();
			}

			this.expressApp.use(session({
				secret,
				name,
				cookie: {
					maxAge: maxAge && Number(maxAge),
					path: "/",
					secure: !env.isDev
				},
				store: sessionStore,
				saveUninitialized: false,
				resave: !database
			}));
		}
	}

	private configureApi({ server }: IConfig)
	{
		if (server.apiPath)
		{
			const apiCheckMethods: ApiMethods[] = ["get", "post", "put", "delete"];

			const walk = (tree: ApiDefinition, parentUrl: string = "/") =>
			{
				for (const name in tree)
				{
					const o: any = tree[name];
					if (o.__IS_API__)
					{
						const temp = new o(null, null);
						this._clientApiInfo[parentUrl + name] = {
							methods: apiCheckMethods.filter(m => m in temp),
							url: o.__API_URL__ || (parentUrl + name)
						};
						this._flatApiTree[o.__API_URL__ || (parentUrl + name)] = o;
					}
					else
						walk(o, parentUrl + name + "/");
				}
			}

			const apiPath = server.apiPath.split("/").join("\\").split("\\").filter(s => !!s).join(path.sep);
			if (env.isDev)
			{
				walk(require(path.resolve(process.cwd(), "src", apiPath)).default);
				this.expressApp.use(express.static(path.join(process.cwd(), "dist", "public")));
			}
			else
			{

				walk(require("../../../src/" + apiPath).default);
				this.expressApp.use(express.static(path.join(__dirname, "public")));
			}

			// construct global api definitions
			const api = global["api"] = {};
			const createRecursive = (url: string[], rootObject: object) => 
			{
				const p = url.shift();
				if (!p)
					return rootObject;
				rootObject[p] = {};
				if (url.length > 0)
					return createRecursive(url, rootObject[p]);
				return rootObject[p];
			}

			// create empty mock methods for when one of those functions is called in a client method
			Object.keys(this._clientApiInfo).forEach(url => 
			{
				const info = this._clientApiInfo[url];
				const parts = url.split("/").filter(p => !!p);
				const o = createRecursive(parts, api);
				api[url] = o;
				o.url = "/api" + info.url;
				["get", "post", "put", "delete"].forEach((m: any) => 
				{
					if (info.methods.includes(m))
						o[m] = (data: any) => { };
					else
						o[m] = () => { throw new Error(`/api${url} has no ${m} method!`); };
				});
			});

			this.expressApp.use(bodyParser.urlencoded({ extended: true }));
			this.expressApp.use(bodyParser.json());

			this.expressApp.use("/api", async (req, res, next) =>
			{
				const url = req.url.split("?")[0];
				const ApiClass = this._flatApiTree[url];
				if (ApiClass)
				{
					const api = new ApiClass(req, res);
					const method = req.method.toLowerCase() || "get";
					try
					{
						let data: any;
						try
						{
							data = method === "get" ? JSON.parse(req.query?.data as string || "undefined") : req.body;
						}
						catch
						{
							data = null;
						}

						try
						{
							const response = await api[method](data);
							return res.json(response);
						}
						catch (e)
						{
							console.log(e);
							return res.status(500).json(e);
						}
					}
					catch (e)
					{
						console.log(e);
						return res.status(501).send(e);
					}
				}
				res.status(404).send("oops api not found... <br/> <h1>:S</h1>");
			});
		}
	}

	protected configureApps({ apps }: IConfig): ConfiguredApps
	{
		// sort the apps in reversed order based on url
		const sortedApps: IonAppConfigWithName[] = Object.keys(apps).map(k => ({ ...apps[k], name: k })).sort((a: IonAppConfig, b: IonAppConfig) => 
		{
			if (a.url === b.url)
				return 0;
			if (a.url.startsWith(b.url))
				return -1;
			return 1;
		});

		const configuredApps: Partial<ConfiguredApps> = {};

		sortedApps.forEach(app =>
		{
			configuredApps[app.name] = {
				router: Router(),
				config: app,
				renderer: Renderer
			};
		});

		return configuredApps as ConfiguredApps;
	}

	protected init(): void { };
	protected onListening(): void { };
	protected onClose(): void { };

	/**
	 * gets called from the dev environment or the bundled backend (generated by the cli)
	 */
	private readonly listen = () => new Promise<http.Server>((res, rej) => 
	{
		if (!this._isListening)
		{
			this._isListening = true;
			this._httpServer = this.expressApp.listen(this.port, this.host, () => 
			{
				this.onListening();
				res(this._httpServer);
			});
		}
		else
		{
			res(this._httpServer);
		}
	});

	private readonly initializeDatabase = async () => await Table.initializeTables();

	public readonly close = () => new Promise<void>((res, rej) => 
	{
		this.onClose();
		this._httpServer.close((err) => 
		{
			if (err)
				rej(err);
			else
				res();
			process.exit(err ? 1 : 0);
		});
	});
}

type AppName = string;

type ConfiguredApps = {
	readonly [K in AppName]: Readonly<{
		config: IonAppConfigWithName;
		renderer: RendererType<any>;
		router: Router;
	}>;
};
