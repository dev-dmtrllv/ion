import { AsyncDataMap } from "../async";
import { ApiMethods } from "./Api";

export type SSRData = {
	api: { [key: string]: { methods: ApiMethods[]; url: string; } };
	async: AsyncDataMap;
};
