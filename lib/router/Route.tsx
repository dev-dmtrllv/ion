import React from "react";
import { RouterContext } from "./Router";
import { RouterProviderContext } from "./RouterProvider";

export const RouteContext = React.createContext<RouteContext>({ params: {}, path: "", exact: false });

export const Route: React.FC<RouteProps> = ({ path, exact = false, children }) =>
{
	const ctx = React.useContext(RouterContext);
	const { getParams } = React.useContext(RouterProviderContext);

	if (ctx.matchType === "first" && ctx.didMatch)
		return null;
	if (ctx.match(path, exact))
	{
		ctx.didMatch = true;
		return (
			<RouteContext.Provider value={{ path, exact, params: getParams(path),  }}>
				{children}
			</RouteContext.Provider>
		);
	}
	return null;
}

type RouteProps = {
	path: string;
	exact?: boolean;
};

type RouteContext = {
	readonly path: string;
	readonly exact?: boolean;
	readonly params: { readonly [key: string]: string };
};
