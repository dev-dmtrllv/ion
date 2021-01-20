"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const init_ts_loader_1 = require("./init-ts-loader");
const [, , ionConfigStr, projectDir = process.cwd()] = process.argv;
(() => __awaiter(void 0, void 0, void 0, function* () {
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
        yield server.initializeDatabase();
        server.listen();
    }
}))();
