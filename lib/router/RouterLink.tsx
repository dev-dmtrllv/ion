import React from "react";
import { RouterContext } from "./Router";
import { RouterProviderContext } from "./RouterProvider";

export const RouterLink: React.FC<RouterLinkProps> = ({ to, exact, children }) =>
{
	const ctx = React.useContext(RouterContext);
	const { routeTo } = React.useContext(RouterProviderContext);

	const active = ctx.match(to, exact);

	return (
		<a className={`router-link ${active ? "active" : ""}`} href={to} onClick={(e) => { e.preventDefault(); routeTo(to); }}>
			{children}
		</a>
	);
}

type RouterLinkProps = {
	to: string;
	exact?: boolean;
};
