import React from "react";
import { RouterProviderContext } from "./RouterProvider";

export const RouterContext = React.createContext<RouterContextType>(null as any);

export const Router: React.FC<RouterProps> = ({ match = "first", children }) =>
{
	const ctx = React.useContext(RouterProviderContext);

	return (
		<RouterContext.Provider value={{ matchType: match, didMatch: false, match: ctx.match }}>
			{children}
		</RouterContext.Provider>
	);
}

type RouterContextType = {
	matchType: MatchType;
	didMatch: boolean;
	match: (url: string, exact?: boolean) => boolean;
};

type RouterProps = {
	match?: "first" | "all";
};

type MatchType = "first" | "all";
