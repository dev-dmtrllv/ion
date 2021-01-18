"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
class Config {
    static get() {
        if (!this.config) {
            const config = require("../../../ion.json");
            if (!env.isDev) {
                const { database } = require("../../../ion.secrets.json");
                if (config.database && database)
                    config.database = Object.assign(Object.assign({}, config.database), database);
            }
            this.config = config;
            if (!this.config.server.host)
                this.config.server.host = "localhost";
            if (!this.config.server.port)
                this.config.server.port = 3001;
            if (!this.config.server.entry)
                this.config.server.entry = "index.ts";
        }
        return this.config;
    }
}
exports.Config = Config;
Config.config = null;
