"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IonConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
class IonConfig {
    constructor(projectPath, apps = IonConfig.defaultConfig.apps, serverConfig = IonConfig.defaultConfig.server, databaseConfig) {
        this.isWatching = false;
        this.watchTimeout = null;
        this.removeDuplicateApps = () => {
            const appKeys = Object.keys(this.apps);
            const apps = appKeys.map(k => this.apps[k]);
            for (let i = 0; i < apps.length; i++) {
                const target = apps[i];
                for (let j = i + 1; j < apps.length; j++) {
                    const comparer = apps[j];
                    if (target.entry === comparer.entry) {
                        console.log(`found duplicate entry for the apps "${appKeys[i]}" and "${appKeys[j]}"!`);
                        delete this.apps[appKeys[j]];
                    }
                    else if (target.url === comparer.url) {
                        console.log(`found duplicate url for the apps "${appKeys[i]}" and "${appKeys[j]}"`);
                        delete this.apps[appKeys[j]];
                    }
                }
            }
        };
        this.configPath = path_1.default.resolve(projectPath, "ion.json");
        this.apps = apps;
        this.server = Object.assign({ entry: "index.ts" }, serverConfig);
        this.database = databaseConfig;
        this.removeDuplicateApps();
    }
    static fromPath(projectPath) {
        const configPath = path_1.default.resolve(projectPath, "ion.json");
        if (fs_1.default.existsSync(configPath)) {
            const config = JSON.parse(fs_1.default.readFileSync(configPath, "utf-8"));
            return new IonConfig(projectPath, config.apps, config.server, config.database);
        }
        return new IonConfig(projectPath);
    }
    save() {
        utils_1.writeJson(this.configPath, {
            apps: this.apps,
            server: this.server,
            database: this.database
        });
    }
    watch(onChange) {
        if (!this.isWatching) {
            this.isWatching = true;
            fs_1.default.watch(this.configPath, {}, (e, file) => {
                if (e === "change" && !this.watchTimeout) {
                    this.watchTimeout = setTimeout(() => {
                        if (fs_1.default.existsSync(this.configPath)) {
                            const json = JSON.parse(fs_1.default.readFileSync(this.configPath, "utf-8"));
                            this.apps = json.apps;
                            this.serverConfig = json.server;
                            this.databaseConfig = json.database;
                        }
                        else {
                            console.warn(`Could not find ion configuration file "ion.json"! falling back to default config!`);
                            this.apps = IonConfig.defaultConfig.server;
                            this.serverConfig = IonConfig.defaultConfig.server;
                            this.databaseConfig = undefined;
                        }
                        this.removeDuplicateApps();
                        onChange();
                        this.watchTimeout = null;
                    }, 100);
                }
            });
        }
    }
}
exports.IonConfig = IonConfig;
IonConfig.defaultConfig = {
    apps: {
        app: {
            entry: "index.tsx",
            url: "/",
            title: "App"
        }
    },
    server: {
        host: "localhost",
        port: 3001,
        apiPath: "server/api",
        staticPath: "static",
        session: {
            secret: "keyboard cat"
        }
    }
};
