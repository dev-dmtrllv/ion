"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
const Session_1 = require("./Session");
class Api {
    constructor(req, res) {
        this.getApi = (type) => new type(this.req, this.res);
        this.req = req;
        this.res = res;
        this.session = new Session_1.Session(req, res);
    }
    static URL(url) {
        return (ctor) => {
            ctor.__API_URL__ = url;
        };
    }
    static createTree(apiDefinitions) {
        return apiDefinitions;
    }
}
exports.Api = Api;
Api.__IS_API__ = true;
