import React from "react";
import { RouteContext } from "./Route";
import { RouteChangeListener, RouterProviderContext } from "./RouterProvider"

export const useRedirectInfo = () => React.useContext(RouterProviderContext).redirectInfo;

export const useRouteListener = (listener: RouteChangeListener) =>
{
	const { addChangeListener, removeChangeListener } = React.useContext(RouterProviderContext);

	React.useEffect(() => 
	{
		addChangeListener(listener);
		return () => removeChangeListener(listener);
	}, []);
};

export const withRouter = () =>
{
	const { match, routeTo, query } = React.useContext(RouterProviderContext);
	const { params, path, exact } = React.useContext(RouteContext);

	return { params, path, query, exact, routeTo, match };
}
