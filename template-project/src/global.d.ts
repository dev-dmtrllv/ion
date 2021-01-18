declare interface Environment
{
	isDev: boolean;
	isServer: boolean;
	isClient: boolean;
}

declare const env: Environment;

type ApiTree = typeof import("./server/api/index");

declare const api: ApiTree["default"];

declare module "*.png" {
	const data: string;
	export default data;
}

declare module "*.jpg" {
	const data: string;
	export default data;
}

declare module "*.jpeg" {
	const data: string;
	export default data;
}

declare module "*.svg" {
	const data: string;
	export default data;
}

declare module "*.css" {
	const data: string;
	export default data;
}

declare module "*.sass" {
	const data: string;
	export default data;
}

declare module "*.scss" {
	const data: string;
	export default data;
}
