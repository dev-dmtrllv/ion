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
exports.findAvailablePort = void 0;
const net_1 = __importDefault(require("net"));
const isPortAvailable = (port) => new Promise(res => {
    const tester = net_1.default.createServer().once("error", (err) => res(err.code == "EADDRINUSE")).once("listening", () => {
        tester.once("close", () => res(true)).close();
    }).listen(port);
});
const findAvailablePort = (port) => __awaiter(void 0, void 0, void 0, function* () {
    let isAvailable = yield isPortAvailable(port);
    while (!isAvailable) {
        port++;
        isAvailable = yield isPortAvailable(port);
    }
    return port;
});
exports.findAvailablePort = findAvailablePort;
