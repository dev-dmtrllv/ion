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
const client_compiler_1 = require("../client-compiler");
const ion_config_1 = require("../config/ion-config");
const server_1 = require("../server");
const socket_io_1 = __importDefault(require("socket.io"));
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
let ionConfig;
let clientCompiler;
let server;
const socketApp = express_1.default();
const socketServer = http_1.default.createServer(socketApp);
socketApp.use(cors_1.default());
const socket = new socket_io_1.default.Server(socketServer, {
    cors: {
        credentials: false,
        methods: ["GET", "POST", "PUT", "DELETE"],
        origin: "http://localhost:3001"
    }
});
socketServer.listen(3002, "localhost");
socketApp.listen();
const sendReloadMessage = () => {
    socket.emit("reload");
};
const start = (cwd, ...args) => __awaiter(void 0, void 0, void 0, function* () {
    ionConfig = ion_config_1.IonConfig.fromPath(cwd);
    clientCompiler = new client_compiler_1.ClientCompiler(cwd, ionConfig, true);
    server = new server_1.Server(cwd, ionConfig);
    yield clientCompiler.watch(() => {
        server.updateApp();
        sendReloadMessage();
    });
    ionConfig.watch(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log("ion config changed!");
        yield clientCompiler.close();
        clientCompiler = new client_compiler_1.ClientCompiler(cwd, ionConfig, true);
        yield clientCompiler.watch(() => server.updateApp());
        yield server.start(true);
    }));
    server.watch(() => { console.log("server change"); sendReloadMessage(); });
    yield server.start();
});
exports.default = start;
