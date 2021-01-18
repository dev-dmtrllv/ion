import { fetchUrl } from "fetch";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { Request, Response } from "express";
import { Server } from "./Server";
import { SSRData } from "./SSRData";
import { ApiClientInfo } from "./Api";
import { AsyncProvider, getImportPaths, prefetch } from "../async";
import { FetchProvider } from "../async/Fetch";
import { RedirectInfo, RouterProvider } from "../router";
import { IonAppConfig, IonAppConfigWithName } from "./Config";


export class Renderer
{
	public readonly server: Server;
	public readonly appConfig: IonAppConfigWithName;
	public readonly appComponent: React.FC | React.ComponentClass;

	public readonly runtimeSources: {
		scripts: string[];
		styles: string[];
	};

	public readonly appSources: {
		scripts: string[];
		styles: string[];
	};

	private readonly _clientApiInfo: ApiClientInfo;

	public constructor(server: Server, appConfig: IonAppConfigWithName, clientInfo: ApiClientInfo)
	{
		this.server = server;
		this.appConfig = appConfig;

		this._clientApiInfo = clientInfo;
		this.loadAppComponent();
	}

	public loadAppComponent()
	{
		(this as any).runtimeSources = this.server.manifest.runtime;
		(this as any).appSources = this.server.manifest.getAppFiles(this.appConfig.name);

		try
		{
			const appPath = this.appConfig.entry.replace(".tsx", "").replace(".ts", "");
			(this as any).appComponent = require(`../../../src/apps/${appPath}`).default;
		}
		catch (e)
		{
			console.log(`src/apps/${this.appConfig.entry} has no default exports!`);
			throw e;
		}
	}

	public handleRequest = async (req: Request, res: Response) =>
	{
		const fetcher = (url: string, method: "get" | "post" | "put" | "delete", data?: object) => new Promise(async (resolve, reject) => 
		{
			if (url.startsWith("/api")) // api call
			{
				try
				{
					const apiUrl = url.split("?")[0].replace("/api", "");
					const response = await this.server.callApi(apiUrl, method, data, req, res);
					resolve(response);
				}
				catch (e)
				{
					reject(e);
				}
			}
			else // external call
			{
				fetchUrl(url + (method === "get" ? (data ? `?data=${JSON.stringify(data)}` : "") : ""), {
					method: (method || "get").toUpperCase(),
					body: data ? JSON.stringify(data) : undefined,
				}, (err, response, data) =>
				{
					if (err)
					{
						reject(err);
					}
					else
					{
						try
						{
							resolve(JSON.parse(data));
						}
						catch
						{
							resolve(data);
						}
					}
				});
			}
		});

		let redirectInfo: RedirectInfo = null;

		const wrappedApp = (
			<FetchProvider fetcher={fetcher}>
				<RouterProvider url={req.url} onRedirect={(from, to) => { redirectInfo = { from, to }; }}>
					<this.appComponent />
				</RouterProvider>
			</FetchProvider>
		);

		const asyncData = await prefetch(wrappedApp, {}, () => !redirectInfo);

		if (redirectInfo)
		{
			let [redirectUrl, redirectQueryStr = ""] = redirectInfo!.to.split("?");
			redirectUrl += ("?" + redirectQueryStr + `${encodeURIComponent("redirect_info")}=${encodeURIComponent(JSON.stringify(redirectInfo))}`);
			res.redirect(redirectUrl);
		}
		else
		{
			const importPaths = getImportPaths(asyncData);

			const ssrData: SSRData = {
				api: this._clientApiInfo,
				async: asyncData
			};

			const appString = ReactDOMServer.renderToString(
				<AsyncProvider initData={asyncData}>
					{wrappedApp}
				</AsyncProvider>
			);

			const htmlStream = ReactDOMServer.renderToStaticNodeStream(this.renderHTML({ appString, ssrData, importPaths }));
			htmlStream.on("data", (data) => res.write(data));
			htmlStream.on("error", (err) => 
			{
				console.log(`HTML Stream Error!`, err);
				throw err;
			});
			htmlStream.on("close", () => res.end());
		}
	}

	protected renderHTML({ title, styles, scripts, appString, head, ssrData, favicon = "data:;base64,iVBORw0KGgo=", importPaths }: HTMLProps): JSX.Element
	{
		const chunkFiles = this.server.manifest.getChunkFiles(importPaths);

		return (
			<html>
				<head>
					<title>{title || this.appConfig.title}</title>
					{head}
					{this.renderStyles(this.runtimeSources.styles)}
					{this.renderStyles(chunkFiles.styles)}
					{styles && this.renderStyles(styles)}
					{this.renderStyles(this.appSources.styles)}
					<link rel="icon" href={favicon} />
				</head>
				<body>
					<div id="root" dangerouslySetInnerHTML={{ __html: appString }}></div>
					<script id="SSR_DATA" dangerouslySetInnerHTML={{ __html: `window.SSR_DATA = ${JSON.stringify(ssrData)};` }} />
					{this.renderScripts(this.runtimeSources.scripts)}
					{this.renderScripts(chunkFiles.scripts)}
					{scripts && this.renderScripts(scripts)}
					{this.renderScripts(this.appSources.scripts)}
				</body>
			</html>
		);
	}

	protected renderStyles(srcs: string[])
	{
		return srcs.map((s, i) => <link key={i} href={s} rel="stylesheet" />);
	}

	protected renderScripts(srcs: string[])
	{
		return srcs.map((s, i) => <script key={i} src={s} />)
	}
}

export type RendererType<T extends Renderer> = new (server: Server, appConfig: IonAppConfig, apiClientInfo: ApiClientInfo) => T;

export type HTMLProps = {
	title?: string;
	scripts?: string[];
	styles?: string[];
	appString: string;
	head?: JSX.Element;
	ssrData: SSRData;
	favicon?: string;
	importPaths: string[];
};
