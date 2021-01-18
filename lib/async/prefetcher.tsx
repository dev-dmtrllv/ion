import React from "react";
import ReactDOMServer from "react-dom/server";
import { AsyncResolver } from "./Async";
import { AsyncDataMap, AsyncProvider } from "./AsyncContext";

export const prefetch = async (app: JSX.Element, initData: AsyncDataMap = {}, onShouldResolve: () => boolean = () => true) =>
{
	const info: { key: string, cache: boolean | number; }[] = [];
	const resolvers: (() => Promise<any>)[] = [];

	const onResolve = (key: string, resolver: AsyncResolver<any>, cache: boolean | number = true) => 
	{
		if (!info.find(i => i.key === key))
		{
			info.push({ key, cache: typeof cache === "number" ? (Date.now() + cache) : cache });
			resolvers.push(resolver);
		}
	}

	ReactDOMServer.renderToStaticMarkup(
		<AsyncProvider initData={initData} onResolve={onResolve} isPrefetching={true}>
			{app}
		</AsyncProvider>
	);

	if ((info.length > 0) && onShouldResolve())
	{
		const resolvePromises = resolvers.map(r => r());
		const data: any[] = await Promise.allSettled<any>(resolvePromises) as any;
		data.forEach((d, i) => 
		{
			const k = info[i].key;
			const cache = info[i].cache;
			if (d.value)
				initData[k] = { data: d.value, isResolving: false, cache };
			else
				initData[k] = { error: d.reason, isResolving: false, cache };
		});
		await prefetch(app, initData);
	}
	return initData;
}
