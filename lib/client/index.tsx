import React from "react";
import ReactDOM from "react-dom";
import { AsyncProvider, prefetch, FetchProvider } from "../async";
import { RouterProvider } from "../router";
import { SSRData } from "../server/SSRData";

export class Client
{
	public static render = async (App: React.FC | React.ComponentClass) =>
	{
		if (env.isDev)
			require("./live-reloader");

		const SSR_DATA_ID = "SSR_DATA";

		// get ssr data
		const ssrData: SSRData = window[SSR_DATA_ID] || {};

		if (!ssrData.api)
			ssrData.api = {};

		if (!ssrData.async)
		{
			ssrData.async = {};
		}
		else
		{
			// remove all the dynamic data so we can import the components on the client
			Object.keys(ssrData.async).forEach(k =>
			{
				if (k.startsWith("Dynamic:"))
					delete ssrData.async[k];
			});
		}

		document.getElementById(SSR_DATA_ID)?.remove();
		delete window[SSR_DATA_ID];


		const fetcher = async (url: string, method: "get" | "post" | "put" | "delete", data?: object) =>  
		{
			try
			{
				let response;
				if (method !== "get")
				{
					response = await fetch(url, {
						method: method.toUpperCase(),
						headers: {
							'Content-Type': 'application/json'
						},
						body: typeof data === "object" ? JSON.stringify(data) : undefined
					});

				}
				else
				{
					response = await fetch(`${url}${(data !== undefined && data !== null) ? `?data=${JSON.stringify(data)}` : ""}`);
				}

				const txt = await response.text();
				try
				{
					return JSON.parse(txt);
				}
				catch (e)
				{
					console.error(e);
					return txt;
				}
			}
			catch (e)
			{
				console.log(e);
				throw e;
			}
		};

		// create api structure
		const api = window["api"] = {};
		const createRecursive = (url: string[], rootObject: object) => 
		{
			const p = url.shift()!;
			rootObject[p] = {};
			if (url.length > 0)
				return createRecursive(url, rootObject[p]);
			return rootObject[p];
		}

		Object.keys(ssrData.api).forEach(url => 
		{
			const parts = url.split("/").filter(p => !!p);

			const ssrApi = ssrData.api[url];
			
			const o = createRecursive(parts, api);
			o.url = `/api` + ssrApi.url;
			
			(["get", "post", "put", "delete"] as any).forEach(m => 
			{
				if (ssrApi.methods.includes(m))
					o[m] = async (data: any) => await fetcher(o.url, m as any, data);
				else
					o[m] = () => { throw new Error(`/api${o.url} has no ${m} method!`); };
			});
		});

		RouterProvider.app = (
			<FetchProvider fetcher={fetcher}>
				<App />
			</FetchProvider>
		);

		const wrappedApp = (
			<RouterProvider url={window.location.pathname + window.location.search}>
				{RouterProvider.app}
			</RouterProvider>
		)

		ssrData.async = await prefetch(wrappedApp, ssrData.async);

		ReactDOM.hydrate(
			<AsyncProvider initData={ssrData.async}>
				{wrappedApp}
			</AsyncProvider>
			, document.getElementById("root"));
	}
}
