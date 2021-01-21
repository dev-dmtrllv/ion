"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genPackageJson = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const genPackageJson = (projectDir, name) => {
    utils_1.writeJson(path_1.default.resolve(projectDir, "package.json"), {
        name,
        version: "0.1.0",
        description: "a server side rendered react app with request prefetching and caching",
        main: "./dist/server.js",
        scripts: {
            start: "ion start",
            dev: "ion start",
            build: "ion build"
        },
        author: "",
        license: "MIT",
        repository: "example.repository",
    });
};
exports.genPackageJson = genPackageJson;
