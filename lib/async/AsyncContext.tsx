import React from "react";
import { AsyncResolver, AsyncState } from "./Async";

export const AsyncContext = React.createContext<AsyncContextType>(null as any);

export const AsyncProvider: React.FC<AsyncProviderProps> = ({ initData = {}, isPrefetching = false, onResolve, children }) =>
{
	const [data, setData] = React.useState(initData);

	const ref = React.useRef(initData);

	ref.current = data;

	const addData = (key: string, _data: AsyncData<any>) =>
	{
		ref.current[key] = _data;
		setData({ ...ref.current });
	};

	const deleteData = (key: string, rerender: boolean = true): boolean =>
	{
		if(!ref.current[key])
			return false;
		try {
			delete ref.current[key];
			delete data[key];
			if(rerender)
				setData({ ...ref.current });
			return true;
		}
		catch
		{
			return false;
		}
	};

	const updateDataPatch = (_data: AsyncDataMap, rerender: boolean = true) => 
	{
		for (const k in _data)
			ref.current[k] = data[k] = _data[k];
		if (rerender)
			setData({ ...ref.current });
	};

	const resolve = async (key, resolver, cache = false) => 
	{
		if (isPrefetching)
		{
			onResolve && onResolve(key, resolver, cache);
		}
		else
		{
			const cacheProp = typeof cache === "number" ? Date.now() + cache : !!cache
			try
			{
				const responseData = await resolver();
				addData(key, { isResolving: false, data: responseData, cache: cacheProp });
			}
			catch (e)
			{
				addData(key, { isResolving: false, error: e, cache: cacheProp })
			}
		}
	};

	const ctx: AsyncContextType = {
		resolve,
		deleteData,
		updateDataPatch,
		isPrefetching,
		data
	};

	React.useEffect(() => 
	{
		// clean up cache
		for (const k in ref.current)
		{
			const _cache = ref.current[k].cache;
			if ((typeof _cache === "number" && _cache < Date.now()) || !_cache)
			{
				delete ref.current[k];

				try 
				{
					delete data[k];
				}
				catch (e)
				{
					console.error(e);
				}
			}
		}
	}, [data]);

	return (
		<AsyncContext.Provider value={ctx}>
			{children}
		</AsyncContext.Provider>
	);
}

export type AsyncContextType = {
	data: AsyncDataMap;
	resolve: <D>(key: string, resolver: AsyncResolver<D>, cache?: number | boolean) => void;
	isPrefetching: boolean;
	updateDataPatch: (patch: AsyncDataMap, rerender?: boolean) => void;
	deleteData: (key: string, rerender?: boolean) => boolean;
};

export type AsyncData<T> = AsyncState<T> & { cache?: boolean | number; };

export type AsyncDataMap = { [key: string]: AsyncData<any> };

type AsyncProviderProps = {
	initData?: AsyncDataMap;
	isPrefetching?: boolean;
	onResolve?: <D>(key: string, resolver: AsyncResolver<D>, cache?: boolean | number) => void;
};
