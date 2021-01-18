declare interface Environment
{
	isDev: boolean;
	isServer: boolean;
	isClient: boolean;
}

declare const env: Environment;
