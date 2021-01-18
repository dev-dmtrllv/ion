"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const Database_1 = require("./Database");
class Table {
    constructor(tableName) {
        this.tableName = tableName;
    }
    select(what, match, order) {
        return __awaiter(this, void 0, void 0, function* () {
            const whatString = what == "*" ? what : what.join(",");
            const data = [];
            let whereString = null;
            let orderString = null;
            if (match)
                whereString = matchToString(match, data);
            if (order) {
                let parts = [];
                for (const prop in order)
                    parts.push(`${prop} ${order[prop]}`);
                orderString = parts.join(", ");
            }
            const query = `SELECT ${whatString} from ${this.tableName} ${whereString ? `WHERE ${whereString}` : ""} ${orderString ? `ORDER BY ${orderString}` : ""}`;
            const { results } = yield Database_1.Database.query(query, data);
            return [...results];
        });
    }
    insert(props) {
        return __awaiter(this, void 0, void 0, function* () {
            props = Array.isArray(props) ? props : [props];
            const keys = Array.isArray(props) ? Object.keys(props[0]) : Object.keys(props);
            const data = [];
            let values = [];
            props.forEach((p) => {
                let v = [];
                for (const k in p) {
                    v.push("?");
                    data.push(p[k]);
                }
                values.push(`(${v.join(", ")})`);
            });
            const { results } = yield Database_1.Database.query(`INSERT INTO ${this.tableName} (${keys.join(",")}) VALUES ${values.join(", ")}`, data);
            return results;
        });
    }
    update(what, match) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            let whatParts = [];
            for (const p in what) {
                whatParts.push(`${p} = ?`);
                data.push(what[p]);
            }
            const whereString = matchToString(match, data);
            const query = `UPDATE ${this.tableName} SET ${whatParts.join(" ")} WHERE ${whereString}`;
            const { results } = yield Database_1.Database.query(query, data);
            return results;
        });
    }
    delete(match) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            let whereString = matchToString(match, data);
            const query = `DELETE FROM ${this.tableName} WHERE ${whereString}`;
            const { results } = yield Database_1.Database.query(query, data);
            return results;
        });
    }
}
exports.Table = Table;
const matchToString = (matcher, dataRef = []) => {
    let rootMatchParts = [];
    matcher = Array.isArray(matcher) ? matcher : [matcher];
    matcher.forEach((m) => {
        let parts = [];
        for (const k in m) {
            const val = m[k];
            if (Array.isArray(val)) // the type is a number lets get the operator values
             {
                if (Array.isArray(val[0])) // we got multiple number operators (combine with AND)
                 {
                    for (const [operator, value] of val) {
                        parts.push(`${k} ${operator} ?`);
                        dataRef.push(value);
                    }
                }
                else {
                    const [operator, value] = val;
                    parts.push(`${k} ${operator} ?`);
                    dataRef.push(value);
                }
            }
            else {
                parts.push(`${k} = ?`);
                dataRef.push(val);
            }
        }
        rootMatchParts.push(`(${parts.join(" AND ")})`);
    });
    if (rootMatchParts.length > 1)
        return `(${rootMatchParts.join(" OR ")})`;
    else
        return rootMatchParts.join(" OR ");
};
