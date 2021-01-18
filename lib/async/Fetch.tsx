import React from "react";
import type { Api, CallableApi } from "../server/Api";
import { Async, AsyncFC, AsyncRender } from "./Async";

export const FetchContext = React.createContext<FetchContextType>(null as any);

export const FetchProvider: React.FC<{ fetcher: Fetcher }> = ({ fetcher, children }) =>
{
	return (
		<FetchContext.Provider value={{ fetch: fetcher }}>
			{children}
		</FetchContext.Provider>
	);
}

export const Fetch: AsyncFC<FetchProps> = ({ url, data, method = "get", ...rest }) =>
{
	const ctx = React.useContext(FetchContext);
	return (
		<Async id={url + method + (data ? JSON.stringify(data) : "")} componentID="Fetch" resolver={() => ctx.fetch(url, method, data)} {...rest} />
	);
};

const fetchApi = <T extends Api, K extends keyof Omit<CallableApi<T>, "url">>(api: CallableApi<T>, method: K, data: InferApiData<CallableApi<T>[K]> | null, onRender: AsyncRender<FetchApiResponseType<T, K>>) =>
{
	return (
		<Fetch method={method as any} url={(api as any).url} data={data as any}>
			{(props, a, b) => onRender(props, a, b)}
		</Fetch>
	);
}

fetchApi.lazy = <T extends Api, K extends keyof Omit<CallableApi<T>, "url">>(api: CallableApi<T>, method: K, data: InferApiData<CallableApi<T>[K]> | null, onRender: AsyncRender<FetchApiResponseType<T, K>>) =>
{
	return (
		<Fetch prefetch={false} method={method as any} url={(api as any).url} data={data as any}>
			{(props, updater, deleter) => onRender(props, updater, deleter)}
		</Fetch>
	);
};

export { fetchApi };

type FetchMethods = "get" | "post" | "put" | "delete";

type FetchProps = {
	url: string;
	data?: object;
	method?: FetchMethods;
	children: AsyncRender<any>;
};

type Fetcher = (url: string, method: FetchMethods, data?: object) => Promise<any>;

type FetchContextType = {
	fetch: Fetcher;
};

type UnPromisify<T> = T extends Promise<infer P> ? P : T;

type FetchApiResponseType<T extends Api, K extends keyof CallableApi<T>> = UnPromisify<ReturnType<CallableApi<T>[K]>>;

type InferApiData<T> = T extends (props: infer Props) => any ? Props : never;
