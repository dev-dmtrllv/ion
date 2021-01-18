"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const mysql_1 = __importDefault(require("mysql"));
const Config_1 = require("./Config");
class Database {
    static get pool() {
        if (!this._pool) {
            const { database } = Config_1.Config.get();
            if (!database)
                throw new Error("Please configure the database in the ion.json file!");
            const { databaseName } = database, props = __rest(database, ["databaseName"]);
            this._pool = mysql_1.default.createPool(Object.assign({ database: databaseName }, props));
        }
        return this._pool;
    }
    ;
    static query(query, values = []) {
        return new Promise((resolve, reject) => {
            this.pool.query(query, values, (err, results, fields) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ results, fields });
                }
            });
        });
    }
}
exports.Database = Database;
Database._pool = null;
