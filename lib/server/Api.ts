import type { Request, Response } from "express";
import { Session } from "./Session";

export class Api
{
	public static URL(url: string)
	{
		return (ctor: any) =>
		{
			ctor.__API_URL__ = url;
		};
	}
	
	private static readonly __IS_API__: boolean = true;
	
	public static createTree<T extends ApiDefinition>(apiDefinitions: T): ApiTree<T>
	{
		return apiDefinitions as any;
	}
	
	protected readonly req: Request;
	protected readonly res: Response;
	protected readonly session: Session;

	protected readonly getApi = <T extends Api>(type: ApiType<T>): T => new type(this.req, this.res);

	public constructor(req: Request, res: Response)
	{
		this.req = req;
		this.res = res;
		this.session = new Session(req, res);
	}

	public get?: (props?: object) => any;
	public post?: (props?: object) => any;
	public put?: (props?: object) => any;
	public delete?: (props?: object) => any;
}

export type ApiType<T extends Api> = new (req: Request, res: Response) => T;

type InferApiType<T> = T extends ApiType<infer Api> ? Api : never;

export type ApiDefinition = {
	[k: string]: ApiType<any> | ApiDefinition;
};

type ApiTree<T> = {
	[K in keyof T]: T[K] extends ApiType<Api> ? CallableApi<InferApiType<T[K]>> : T[K] extends ApiTree<ApiDefinition> ? ApiTree<T[K]> : never;
};

type Promisify<T> = T extends (props: infer Props) => infer ReturnType ? ReturnType extends Promise<any> ? T : Props extends Object ? (props: Props) => Promise<ReturnType> : () => Promise<ReturnType> : never;

export type CallableApi<T extends Api> = {
	[K in keyof ExcludeOptionalProps<T>]: Promisify<T[K]>;
} & {
	url: string;
};

type RequiredKeys<T> = {
	[K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K
}[keyof T];

type ExcludeOptionalProps<T> = Pick<T, RequiredKeys<T>>;

export type ApiMethods = "get" | "post" | "put" | "delete";

export type ApiClientInfo = {
	[key: string]: {
		url: string;
		methods: ApiMethods[];
	}
};
