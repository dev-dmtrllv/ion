"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const init_ts_loader_1 = require("./init-ts-loader");
const [, , ionConfigStr, projectDir = process.cwd()] = process.argv;
if (ionConfigStr) {
    const ionConfig = JSON.parse(ionConfigStr);
    const serverEntry = path_1.default.resolve(projectDir, "src", "server", ionConfig.server.entry || "index.ts");
    global.env = {
        isDev: true,
        isServer: true,
        isClient: false,
    };
    init_ts_loader_1.initTsLoader();
    const ServerClass = require(serverEntry).default;
    const server = new ServerClass(ionConfig);
    server.listen();
}
