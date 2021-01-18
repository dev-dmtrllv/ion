import React from "react";
import { AsyncContext, prefetch } from "../async";

export const RouterProviderContext = React.createContext<RouterProviderContextType>(null as any);

/**
 * Gets the redirect info from the urls query string
 * @param url the url from which to parse the redirect info
 */
const getRedirectInfo = (url: string): RedirectInfo => 
{
	const [, query = ""] = url.split("?");
	const parts = query.split("&");
	for (const str in parts)
		if (str.startsWith("redirect_info="))
		{
			const [, val] = str.split("=")
			return JSON.parse(decodeURIComponent(val));
		}
	return null;
};

export const RouterProvider: React.FC<RouterProviderProps> & { app: JSX.Element | null } = (props) =>
{
	const { updateDataPatch, data } = React.useContext(AsyncContext);
	const [url, setUrl] = React.useState(props.url);
	const urlRef = React.useRef(props.url);
	const redirectInfo = React.useRef<RedirectInfo>(getRedirectInfo(props.url));
	const updateCallCounter = React.useRef(0);
	const changeHandlers = React.useRef<RouteChangeListener[]>([]);
	const updateUrlTimeout = React.useRef<{ url: string, timeout: NodeJS.Timeout } | null>(null);

	const updateURL = (_url: string, fromPushState: boolean = false) =>
	{
		// keep count references to each updateURL call this way we know which call to cancel
		// when another updateURL call was made
		const callID = ++updateCallCounter.current;

		// first cancle all the routing
		if (updateUrlTimeout.current)
		{
			const { url } = updateUrlTimeout.current;
			changeHandlers.current.forEach((listener) => listener("canceled", url));
		}

		if (_url !== urlRef.current)
		{
			// lets start routing
			const parts = _url.split("?");
			_url = parts[0];

			// we need to get the max ms to wait before routing from the routeChangeListeners
			let msToWait = 0;
			changeHandlers.current.forEach((listener) => 
			{
				let ms = listener("start", _url);
				if (typeof ms === "number" && (ms > msToWait))
					msToWait = ms;
			});

			const timeout = setTimeout(async () => 
			{
				let redirects: string[] = [_url];

				// recursive methods to keep prefetching, unless a redirect cycle is detected ofcourse
				const prefetchRoutes = async (routeUrl: string) => 
				{
					let redirectTo: string | null = null;
					const wrappedApp = (
						<RouterProvider url={routeUrl} onRedirect={(from, to) => { redirectTo = to; }}>
							{RouterProvider.app}
						</RouterProvider>
					);

					const initData = await prefetch(wrappedApp, { ...data }, () => !redirectTo && (callID == updateCallCounter.current));

					if (callID == updateCallCounter.current)
					{
						if (redirectTo)
						{
							if (redirects.includes(redirectTo) || (redirectTo === urlRef.current))
							{
								throw new Error(`Found redirection cycle! ${urlRef.current} -> ${redirects.join(" -> ")}`);
							}
							else
							{
								redirects.push(redirectTo);
								return await prefetchRoutes(redirectTo);
							}
						}

						return initData;
					}

					return null;
				};

				const newInitData = await prefetchRoutes(_url);

				if (callID == updateCallCounter.current)
				{

					let routeToUrl = redirects.pop()!;
					updateDataPatch(newInitData, false);
					if (redirects.length > 0) // we got a redirect!
					{
						redirectInfo.current = {
							from: _url,
							to: routeToUrl
						};
						const redirectQueryStr = `${encodeURIComponent("redirect_info")}=${encodeURIComponent(JSON.stringify(redirectInfo))}`;
						routeToUrl += (!routeToUrl.includes("?") ? "?" : "") + redirectQueryStr;
					}
					else
					{
						redirectInfo.current = null;
						routeToUrl += parts[1] ? `?${parts[1]}` : "";
					}

					if (!fromPushState)
					{
						document.title = urlRef.current;
						window.history.pushState(null, urlRef.current, urlRef.current);
						window.history.replaceState(null, routeToUrl, routeToUrl);
					}

					urlRef.current = routeToUrl;
					setUrl(routeToUrl);
				}
				else if (env.isDev)
				{
					console.info("canceled routing to " + redirects.pop()!);
				}
			}, msToWait);

			updateUrlTimeout.current = {
				timeout,
				url: _url
			};
		}
	}

	const handleRedirect = (from: string, to: string, exact?: boolean) =>
	{
		props.onRedirect && props.onRedirect(from, to, exact);
	};

	const routeTo = (to: string) => { updateURL(to); };

	const matcher = (matchUrl: string, exact?: boolean) =>
	{
		const p1 = url.split("?")[0].split("/").filter(s => !!s);
		const p2 = matchUrl.split("?")[0].split("/").filter(s => !!s);
		if (exact && (p1.length !== p2.length))
			return false;
		else if (p1.length < p2.length)
			return false;
		for (let i = 0; i < p1.length; i++)
		{
			const m1 = p1[i];
			const m2 = p2[i];
			if (m2 && !m2.startsWith(":") && (m1 !== m2))
				return false;
		}
		return true;
	}

	const getParams = (matchUrl: string, exact?: boolean) =>
	{
		if (!matcher(matchUrl, exact))
			return {};

		const p1 = url.split("?")[0].split("/").filter(s => !!s);
		const p2 = matchUrl.split("?")[0].split("/").filter(s => !!s);

		const params: { [key: string]: string } = {};

		for (let i = 0; i < p1.length; i++)
		{
			const m1 = p1[i];
			const m2 = p2[i];
			if (m2 && m2.startsWith(":"))
				params[m2.substring(1, m2.length)] = m1;
		}
		return params;
	}

	const [, queryStr = ""] = url.split("?");
	const query = {};

	queryStr.split("&").forEach(p => 
	{
		let [key, val] = p.split("=");
		if (key)
		{
			key = decodeURIComponent(key);
			val = decodeURIComponent(val);
			if (key === "redirect_info")
			{
				redirectInfo.current = JSON.parse(val);
			}
			else
			{
				try { val = JSON.parse(val); } catch { }
				query[key] = val;
			}
		}
	});

	const addChangeListener = (listener) => { (!changeHandlers.current.includes(listener)) && changeHandlers.current.push(listener); }
	const removeChangeListener = (listener) => { (changeHandlers.current.includes(listener)) && changeHandlers.current.splice(changeHandlers.current.indexOf(listener), 1); }

	const ctx: RouterProviderContextType = {
		url,
		match: matcher,
		redirect: handleRedirect,
		routeTo,
		getParams,
		query,
		redirectInfo: redirectInfo.current,
		addChangeListener,
		removeChangeListener,
		cache: (url: string, duration?: number) => { props.onCache && props.onCache(url, duration); }
	};

	React.useEffect(() => 
	{
		ctx.redirect = (from: string, to: string, exact?: boolean) => 
		{
			if (props.onRedirect)
			{
				props.onRedirect(from, to, exact);
				updateURL(to);
			}
		}

		window.onpopstate = (e) =>
		{
			e.preventDefault();
			const queryStr = window.location.search === "?" ? "" : window.location.search;
			updateURL(window.location.pathname + queryStr, true);
			return false;
		}
	}, []);

	const isInitialMount = React.useRef(true);
	React.useEffect(() => 
	{
		if (!isInitialMount.current)
		{
			changeHandlers.current.forEach(listener => listener("end", url));
			updateUrlTimeout.current = null;
		}
		else
		{
			isInitialMount.current = false;
		}
	}, [url]);

	return (
		<RouterProviderContext.Provider value={ctx}>
			{props.children}
		</RouterProviderContext.Provider>
	);
}

/**
 * The app should register itself on the client side so that prefetching data on route change works correctly.
 */
RouterProvider.app = null;

type RouterProviderContextType = {
	url: string;
	match: (url: string, exact?: boolean) => boolean;
	redirect: (from: string, to: string, exact?: boolean) => void;
	redirectInfo: RedirectInfo;
	routeTo: (to: string) => void;
	getParams: (path: string) => { readonly [key: string]: string };
	readonly query: { readonly [key: string]: string };
	/**
	 * when a number (x) is returned the router will wait (x) ms before the routing starts
	 */
	addChangeListener: (onChangeListener: RouteChangeListener) => void;
	removeChangeListener: (onChangeListener: RouteChangeListener) => void;
	cache: (url: string, duration?: number) => void;
};

type RouteChangeEventType = "start" | "end" | "canceled";

export type RouteChangeListener = (event: RouteChangeEventType, routeToUrl: string) => any;

type RouterProviderProps = {
	url: string;
	onRedirect?: (from: string, to: string, exact?: boolean) => void;
	onCache?: (url: string, duration?: number) => void;
};

export type RedirectInfo = {
	from: string;
	to: string;
} | null;
