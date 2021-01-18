import React from "react";
import { AsyncContext } from "../async";
import { RouterContext } from "./Router";
import { RouterProviderContext } from "./RouterProvider";

export const Redirect: React.FC<RouteProps> = ({ from, to, exact }) =>
{
	const { url, redirect } = React.useContext(RouterProviderContext);
	const ctx = React.useContext(RouterContext);
	const { isPrefetching } = React.useContext(AsyncContext);

	React.useEffect(() => 
	{
		if (!ctx.didMatch && ctx.match(from || url, exact))
		{
			ctx.didMatch = true;
			redirect(from || url, to, exact);
		}
	}, []);
	if (isPrefetching && !ctx.didMatch && ctx.match(from || url, exact))
	{
		ctx.didMatch = true;
		redirect(from || url, to, exact);
	}

	return null;
}

type RouteProps = {
	from?: string;
	to: string;
	exact?: boolean;
};
