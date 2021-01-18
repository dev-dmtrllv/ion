"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawn = void 0;
const child_process_1 = __importDefault(require("child_process"));
const os_1 = require("os");
const spawn = (command, args, cwd = process.cwd()) => {
    command = os_1.platform() === "win32" ? command + ".cmd" : command;
    return new Promise((res) => child_process_1.default.spawn(command, args, { cwd, stdio: "inherit" }).on("exit", res));
};
exports.spawn = spawn;
