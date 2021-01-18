"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanAppEntries = exports.genAppEntry = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("../utils");
const genAppEntry = (projectDir, appEntry) => {
    if (appEntry[0] == "/" || appEntry[0] == "\\")
        appEntry = appEntry.substr(1, appEntry.length);
    appEntry = appEntry.replace(".tsx", "").replace(".ts", "");
    const entryFile = path_1.default.resolve(projectDir, "node_modules", ".gen", "apps", appEntry.replace(/\\/g, "_").replace(/\//g, "_") + ".js");
    utils_1.write(entryFile, `const { Client } = require("ion/client");
const App = require("../../../src/apps/${appEntry}").default;

Client.render(App);`);
    return entryFile;
};
exports.genAppEntry = genAppEntry;
const cleanAppEntries = (projectDir) => {
    const appsGenPath = path_1.default.resolve(projectDir, "node_modules", ".gen", "apps");
    if (fs_1.default.existsSync(appsGenPath)) {
        const files = utils_1.getFilesRecursive(appsGenPath);
        files.forEach(f => fs_1.default.unlinkSync(f));
    }
};
exports.cleanAppEntries = cleanAppEntries;
