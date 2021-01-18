"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApiDefinition = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const updateApiDefinition = (globalDTS, newApiEntryPath) => {
    let dts = fs_1.default.readFileSync(globalDTS, "utf-8");
    const regex = /^(type ApiTree = typeof import\(")(.*)("\);)$/gi;
    if (newApiEntryPath === undefined) // remove the api definition
     {
        dts.replace(regex, "");
    }
    else {
        if (regex.test(dts)) {
            newApiEntryPath = newApiEntryPath.endsWith("index") ? newApiEntryPath : path_1.default.join(newApiEntryPath, "index");
            dts.replace(regex, `type ApiTree = typeof import("${newApiEntryPath}");`);
        }
        else {
            dts += `\r\n type ApiTree = typeof import("${newApiEntryPath}");`;
        }
    }
    fs_1.default.writeFileSync(globalDTS, dts, "utf-8");
};
exports.updateApiDefinition = updateApiDefinition;
