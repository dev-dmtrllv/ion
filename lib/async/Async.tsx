import React from "react";
import { AsyncContext, AsyncData } from "./AsyncContext";

export const useAsyncContext = () => React.useContext(AsyncContext);

export const Async: React.FC<AsyncProps<any>> = <D extends any>({ componentID, id, resolver, children, prefetch = true, cache = true }: AsyncProps<D>) =>
{
	const ctx = React.useContext(AsyncContext);

	if (!ctx)
		throw new Error("No AsyncContext available!");

	const key = `${componentID}:${id}`;

	let data: AsyncData<D> | null = ctx.data[key] || null;

	const [nonCacheState, setNonCacheState] = React.useState(data);

	if (!data && (cache === false))
		data = nonCacheState;

	React.useEffect(() => 
	{
		const key = `${componentID}:${id}`;
		const data = ctx.data[key] || null;
		if (!data || (!data.error && !data.data))
		{
			if (cache === false)
			{
				setNonCacheState({ isResolving: true });
				resolver().then(r => 
				{
					setNonCacheState({ isResolving: false, data: r });
				}).catch(e => 
				{
					setNonCacheState({ isResolving: false, error: e });
				});
			}
			else
				ctx.resolve(key, resolver, cache);
		}
	}, [id]);

	const updater = (newData) => ctx.updateDataPatch({ [key]: { data: newData, isResolving: false, cache } }, true);
	const deleter = () => ctx.deleteData(key, true);

	const render = (data: AsyncData<D>) => children && children(data, updater, deleter) || null;

	if (!data && ctx.isPrefetching)
	{
		if (prefetch)
			ctx.resolve(key, resolver, cache);
		return render({ isResolving: true });
	}
	else if (data)
	{
		return render(data);
	}
	return render({ isResolving: true });
};

export type AsyncProps<D> = {
	id: string;
	componentID: string;
	resolver: AsyncResolver<D>;
	children: AsyncRender<D>;
	prefetch?: boolean;
	cache?: boolean | number;
};

export type AsyncState<D> = {
	isResolving: boolean;
	data?: D;
	error?: Error;
};

export type AsyncResolver<D> = () => Promise<D>;

export type AsyncRender<D> = (state: AsyncState<D>, updateData: (data: D) => void, deleteData: () => boolean) => (JSX.Element | null);

export type AsyncFC<P> = React.FC<P & { prefetch?: boolean; cache?: boolean | number; }>;
