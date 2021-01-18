"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientCompiler = void 0;
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const webpack_client_config_1 = require("./config/webpack-client-config");
const app_entry_1 = require("./gen/app-entry");
const utils_1 = require("./utils");
class ClientCompiler {
    constructor(projectDir, ionConfig, isDev = true) {
        this.watcher = null;
        this.close = () => {
            return new Promise((res) => {
                if (this.watcher)
                    this.watcher.close(() => res());
                else
                    res();
            });
        };
        this.watch = (onChange) => {
            return new Promise((res, rej) => {
                if (!this.watcher) {
                    console.log("client compiler started...");
                    let isResolved = false;
                    this.watcher = this.compiler.watch({ ignored: ["src/server/**", "node_modules/**"] }, (err, stats) => {
                        if (err) {
                            if (!isResolved) {
                                isResolved = true;
                                rej(err);
                            }
                            else {
                                console.error(err);
                            }
                        }
                        else {
                            if (stats) {
                                console.log(stats.toString("minimal"));
                            }
                            if (!isResolved) {
                                isResolved = true;
                                res();
                            }
                            else if (this.hash !== stats.hash) {
                                this.hash = stats.hash;
                                onChange();
                            }
                        }
                    });
                }
                else {
                    rej("Compiler is already watching!");
                }
            });
        };
        this.ionConfig = ionConfig;
        app_entry_1.cleanAppEntries(projectDir);
        const appEntries = {};
        for (const appName in ionConfig.apps)
            appEntries[appName] = app_entry_1.genAppEntry(projectDir, ionConfig.apps[appName].entry);
        this.compiler = webpack_1.default(webpack_client_config_1.createClientConfig(appEntries, (manifest) => { utils_1.writeJson(path_1.default.resolve(projectDir, "manifest.json"), manifest); }, isDev));
    }
}
exports.ClientCompiler = ClientCompiler;
