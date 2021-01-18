"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideRequire = void 0;
const path_1 = __importDefault(require("path"));
const module_1 = __importDefault(require("module"));
let isOverridden = false;
const overrideRequire = () => {
    if (isOverridden)
        return;
    isOverridden = true;
    const cssExtensions = [
        ".css",
        ".sass",
        ".scss",
        ".less",
    ];
    const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".gif",
        ".png",
        ".svg",
    ];
    cssExtensions.forEach(i => require.extensions[i] = () => { });
    var originalRequire = module_1.default.prototype.require;
    module_1.default.prototype.require = function () {
        const name = arguments["0"];
        for (const e of imageExtensions)
            if (name.endsWith(e))
                return "/" + path_1.default.join("images", path_1.default.basename(name)).replace(/\\/g, "/");
        return originalRequire.apply(this, arguments);
    };
};
exports.overrideRequire = overrideRequire;
