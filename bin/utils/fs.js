"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilesRecursive = exports.writeJson = exports.write = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const write = (filePath, data) => {
    const fileName = path_1.default.basename(filePath);
    const dir = filePath.substr(0, filePath.length - (fileName.length + 1));
    fs_1.default.mkdirSync(dir, { recursive: true });
    fs_1.default.writeFileSync(filePath, data, "utf-8");
};
exports.write = write;
const writeJson = (filePath, data) => exports.write(filePath, JSON.stringify(data, null, 4));
exports.writeJson = writeJson;
const getFilesRecursive = (dir, foundDirs = []) => {
    fs_1.default.readdirSync(dir, "utf-8").forEach((p) => {
        p = path_1.default.resolve(dir, p);
        if (fs_1.default.statSync(p).isDirectory()) {
            exports.getFilesRecursive(p, foundDirs);
        }
        else {
            foundDirs.push(p);
        }
    });
    return foundDirs;
};
exports.getFilesRecursive = getFilesRecursive;
