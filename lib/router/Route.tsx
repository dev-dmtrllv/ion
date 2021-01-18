import React from "react";
import { RouterContext } from "./Router";
import { RouterProviderContext } from "./RouterProvider";

export const RouteContext = React.createContext<RouteContext>({ params: {}, path: "", exact: false });

export const Route: React.FC<RouteProps> = ({ path, exact = false, cache, children }) =>
{
	const ctx = React.useContext(RouterContext);
	const providerContext = React.useContext(RouterProviderContext);

	if (ctx.matchType === "first" && ctx.didMatch)
		return null;
	if (ctx.match(path, exact))
	{
		if (env.isServer)
		{
			if (cache)
			{
				if (typeof cache === "function")
				{
					const _cache = cache(providerContext.url);
					if (_cache)
						providerContext.cache(providerContext.url, _cache);
				}
				else if (cache)
				{
					providerContext.cache(providerContext.url, cache);
				}
			}
		}
		ctx.didMatch = true;
		return (
			<RouteContext.Provider value={{ path, exact, params: providerContext.getParams(path), }}>
				{children}
			</RouteContext.Provider>
		);
	}
	return null;
}

type RouteProps = {
	path: string;
	exact?: boolean;
	cache?: number | ((url: string) => number);
};

type RouteContext = {
	readonly path: string;
	readonly exact?: boolean;
	readonly params: { readonly [key: string]: string };
};
