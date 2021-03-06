"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const socket = socket_io_client_1.default("http://localhost:3002", {
    forceNew: true,
    autoConnect: true,
    reconnection: true,
});
socket.on("reload", () => window.location.reload());
