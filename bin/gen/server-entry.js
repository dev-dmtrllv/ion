"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genServerEntry = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const genServerEntry = (projectDir, serverEntry) => {
    const entryFile = path_1.default.resolve(projectDir, "node_modules", ".gen", "server", path_1.default.basename(serverEntry));
    utils_1.write(entryFile, `const { Client } = require("ion/client");
const App = require("../../../src/app/${path_1.default.basename(serverEntry)}").default;

Client.render(App);`);
    return entryFile;
};
exports.genServerEntry = genServerEntry;
