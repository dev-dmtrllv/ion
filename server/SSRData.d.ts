import { AsyncDataMap } from "../async";
import { ApiMethods } from "./Api";
export declare type SSRData = {
    api: {
        [key: string]: {
            methods: ApiMethods[];
            url: string;
        };
    };
    async: AsyncDataMap;
};
