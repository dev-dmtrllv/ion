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
const Config_1 = require("./Config");
const Database_1 = require("./Database");
class Table {
    constructor(tableName, scheme) {
        if (Table.tables.has(tableName)) {
            throw new Error(`${tableName} already exists!`);
        }
        else {
            Table.tables.set(tableName, this);
        }
        this.tableName = tableName;
        this.scheme = Object.assign({ id: {
                type: "int",
                isPrimaryKey: true,
                autoIncrement: true,
                isNotNull: true
            } }, scheme);
    }
    static alterTable(tableName, oldScheme, scheme, add, update, remove) {
        return __awaiter(this, void 0, void 0, function* () {
            if (add.length > 0) {
                const primaryKeys = [];
                const foreignKeys = [];
                const uniques = [];
                const columns = [];
                add.forEach(prop => columns.push("ADD " + this.createColumnDefinition(prop, scheme[prop], uniques, primaryKeys, foreignKeys)));
                let sql = `ALTER TABLE ${tableName} ${columns.join(", ")}`;
                if (primaryKeys.length > 0)
                    sql += `,${primaryKeys.map((column) => `PRIMARY KEY (\`${column}\`)`).join(", ")}`;
                if (foreignKeys.length > 0)
                    sql += `,${foreignKeys.map(({ column, refColumn, table }) => `INDEX \`fk_${column}_idx\` (\`${column}\` ASC) VISIBLE, CONSTRAINT \`fk_${column}\` FOREIGN KEY (\`${column}\`) REFERENCES \`${table}\`(\`${refColumn}\`)`).join(", ")}`;
                if (uniques.length > 0)
                    sql += `,${uniques.map((column) => `UNIQUE INDEX \`${column}_UNIQUE\` (\`${column}\` ASC) VISIBLE`).join(", ")}`;
                yield Database_1.Database.query(sql);
            }
            if (remove.length > 0) {
                const sql = `ALTER TABLE ${tableName} ${remove.map(s => `DROP ${s}`).join(", ")}`;
                yield Database_1.Database.query(sql);
            }
            if (update.length > 0) {
                // todo ALTER TABLE ... MODIFY .... logic implementation
                let drop = [];
                let add = [];
                let _update = [];
                const primaryKeys = [];
                const foreignKeys = [];
                const uniques = [];
                const columns = [];
                for (const column in scheme) {
                    if (oldScheme[column].foreignKey && !scheme[column].foreignKey) {
                        drop.push(`FOREIGN KEY \`${column}\``, `INDEX \`fk_${column}_idx\``);
                    }
                    else if (!oldScheme[column].foreignKey && scheme[column].foreignKey) {
                        add.push(column);
                    }
                    else if (oldScheme[column].foreignKey && scheme[column].foreignKey) {
                        for (let p in oldScheme[column].foreignKey)
                            if (oldScheme[column].foreignKey[p] !== scheme[column].foreignKey[p]) {
                                drop.push(`FOREIGN KEY \`${column}\``, `INDEX \`fk_${column}_idx\``);
                                update.push(column);
                                break;
                            }
                    }
                    if (oldScheme[column].generate && !scheme[column].generate) {
                        update.push(column);
                    }
                    else if (!oldScheme[column].generate && scheme[column].generate) {
                        update.push(column);
                    }
                }
                drop.forEach(prop => columns.push(`DELETE ${prop}`));
                add.forEach(prop => columns.push("ADD " + this.createColumnDefinition(prop, scheme[prop], uniques, primaryKeys, foreignKeys)));
                let sql = `ALTER TABLE ${tableName} ${columns.join(", ")}`;
                if (primaryKeys.length > 0)
                    sql += `,${primaryKeys.map((column) => `PRIMARY KEY (\`${column}\`)`).join(", ")}`;
                if (foreignKeys.length > 0)
                    sql += `,${foreignKeys.map(({ column, refColumn, table }) => `INDEX \`fk_${column}_idx\` (\`${column}\` ASC) VISIBLE, CONSTRAINT \`fk_${column}\` FOREIGN KEY (\`${column}\`) REFERENCES \`${table}\`(\`${refColumn}\`)`).join(", ")}`;
                if (uniques.length > 0)
                    sql += `,${uniques.map((column) => `UNIQUE INDEX \`${column}_UNIQUE\` (\`${column}\` ASC) VISIBLE`).join(", ")}`;
                console.log(sql);
                // await Database.query(sql);
            }
        });
    }
    static createColumnDefinition(columnName, info, uniques, primaryKeys, foreignKeys) {
        const { type, size, autoIncrement, defaultValue, foreignKey, isBinary, generate, isNotNull, isPrimaryKey, isUnique, isUnsigned, zeroFill } = info;
        const c = [columnName, type];
        if (size)
            c.push(`(${size})`);
        if (isBinary && !generate)
            c.push("BINARY");
        if (isBinary && generate)
            console.error(`cannot use generate and binary on column ${columnName}!`);
        if (zeroFill)
            c.push("ZEROFILL");
        if (isUnsigned)
            c.push("UNSIGNED");
        if (isNotNull)
            c.push("NOT NULL");
        if (autoIncrement && !generate)
            c.push("AUTO_INCREMENT");
        if (autoIncrement && generate)
            console.error(`cannot use generate and auto increment on column ${columnName}!`);
        if (isUnique && !isPrimaryKey)
            uniques.push(columnName);
        if (defaultValue !== undefined)
            c.push(`DEFAULT ${defaultValue === "" ? "\"\"" : defaultValue}`);
        if (foreignKey) {
            foreignKeys.push({
                column: columnName,
                refColumn: foreignKey.column,
                table: foreignKey.table,
                onDelete: foreignKey.onDelete || "NO ACTION",
                onUpdate: foreignKey.onUpdate || "NO ACTION",
            });
        }
        if (isPrimaryKey) {
            primaryKeys.push(columnName);
        }
        if (generate) {
            const { expression, type } = generate;
            c.push(`GENERATED ALWAYS AS (${expression}) ${type}`);
        }
        return c.join(" ");
    }
    static createTable(tableName, scheme) {
        return __awaiter(this, void 0, void 0, function* () {
            const columns = [];
            const primaryKeys = [];
            const foreignKeys = [];
            const uniques = [];
            for (const p in scheme)
                columns.push(this.createColumnDefinition(p, scheme[p], uniques, primaryKeys, foreignKeys));
            let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(", ")}`;
            if (primaryKeys.length > 0)
                sql += `,${primaryKeys.map((column) => `PRIMARY KEY (\`${column}\`)`).join(", ")}`;
            if (foreignKeys.length > 0)
                sql += `,${foreignKeys.map(({ column, refColumn, table }) => `INDEX \`fk_${column}_idx\` (\`${column}\` ASC) VISIBLE, CONSTRAINT \`fk_${column}\` FOREIGN KEY (\`${column}\`) REFERENCES \`${table}\`(\`${refColumn}\`)`).join(", ")}`;
            if (uniques.length > 0)
                sql += `,${uniques.map((column) => `UNIQUE INDEX \`${column}_UNIQUE\` (\`${column}\` ASC) VISIBLE`).join(", ")}`;
            yield Database_1.Database.query(sql + ")");
        });
    }
    select(what, match, order) {
        return __awaiter(this, void 0, void 0, function* () {
            const whatString = Array.isArray(what) ? what.join(",") : what;
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
Table.tables = new Map();
Table.initializeTables = () => __awaiter(void 0, void 0, void 0, function* () {
    const { database } = Config_1.Config.get();
    if (!database)
        return;
    const schemaName = database.databaseName;
    const { results, fields } = yield Database_1.Database.query(`SELECT * FROM information_schema.columns WHERE table_schema = '${schemaName}'`);
    const fkQueryResult = yield Database_1.Database.query(`SELECT TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA = '${schemaName}'`);
    const fkeys = fkQueryResult.results;
    if (results) {
        for (const [_, t] of Table.tables) {
            const newScheme = t.scheme;
            const check = yield Database_1.Database.query(`SHOW TABLES LIKE '${t.tableName}'`);
            // table does not exists! create it 
            if (check.results.length === 0) {
                console.log(`creating table ${t.tableName}...`);
                yield Table.createTable(t.tableName, newScheme);
                return;
            }
            const oldScheme = {
                id: {
                    type: "int",
                    isPrimaryKey: true,
                    autoIncrement: true,
                    isUnique: true,
                    isNotNull: true
                },
            };
            results.forEach(r => {
                var _a, _b;
                if (r.TABLE_NAME === t.tableName) {
                    const columnName = r.COLUMN_NAME;
                    const info = {
                        type: r.DATA_TYPE.toLowerCase()
                    };
                    if ((_a = r.COLLATION_NAME) === null || _a === void 0 ? void 0 : _a.includes("bin"))
                        info.isBinary = true;
                    if ((_b = r.COLUMN_TYPE) === null || _b === void 0 ? void 0 : _b.includes("unsigned"))
                        info.isUnsigned = true;
                    if (r.IS_NULLABLE === "NO")
                        info.isNotNull = true;
                    if (r.CHARACTER_MAXIMUM_LENGTH)
                        info.size = r.CHARACTER_MAXIMUM_LENGTH;
                    if (r.EXTRA) {
                        if (r.EXTRA === "auto_increment") {
                            info.autoIncrement = true;
                        }
                        else if (r.EXTRA === "VIRTUAL GENERATED" && r.GENERATION_EXPRESSION) {
                            info.generate = {
                                expression: r.GENERATION_EXPRESSION.split("\\'")[1],
                                type: "VIRTUAL"
                            };
                        }
                        else if (r.EXTRA === "STORED GENERATED" && r.GENERATION_EXPRESSION) {
                            info.generate = {
                                expression: r.GENERATION_EXPRESSION.split("\\'")[1],
                                type: "STORED"
                            };
                        }
                    }
                    if (r.COLUMN_KEY) {
                        if (r.COLUMN_KEY === "PRI")
                            info.isPrimaryKey = true;
                        else if (r.COLUMN_KEY === "UNI")
                            info.isUnique = true;
                    }
                    // check foreign keys
                    const fk = fkeys.find(r => (r.TABLE_NAME === t.tableName && r.COLUMN_NAME === columnName));
                    if (fk) {
                        info.foreignKey = {
                            table: fk.REFERENCED_TABLE_NAME,
                            column: fk.REFERENCED_COLUMN_NAME,
                            refColumn: "",
                            onDelete: "NO ACTION",
                            onUpdate: "NO ACTION"
                        };
                    }
                    oldScheme[columnName] = info;
                }
            });
            // check old and new table schemes
            const oldProps = Object.keys(oldScheme);
            const newProps = Object.keys(newScheme);
            const all = [...oldProps, ...newProps];
            const remove = [];
            const add = [];
            const modify = [];
            all.forEach(p => {
                if (oldProps.includes(p) && !newProps.includes(p))
                    remove.push(p);
                else if (!oldProps.includes(p) && newProps.includes(p))
                    add.push(p);
                else // compare inner structure
                 {
                    const oldInfo = oldScheme[p];
                    const newInfo = newScheme[p];
                    const allProps = [...Object.keys(oldInfo), ...Object.keys(newInfo)];
                    for (const prop of allProps) {
                        if (prop === "generate") {
                            const _old = oldInfo[prop];
                            const _new = newInfo[prop];
                            if (_old.expression !== _new.expression || _old.type !== _new.type) {
                                modify.push(p);
                                break;
                            }
                        }
                        else if (prop === "foreignKey") {
                            const _old = oldInfo[prop];
                            const _new = newInfo[prop];
                            for (const _prop in _old) {
                                if (_old[_prop] !== _new[_prop]) {
                                    modify.push(p);
                                    break;
                                }
                            }
                        }
                        if (oldInfo[prop] !== newInfo[prop]) {
                            modify.push(p);
                            break;
                        }
                    }
                    ;
                }
            });
            if (remove.length > 0 || modify.length > 0 || add.length > 0) {
                console.log(oldScheme, newScheme);
                console.log(`Table ${t.tableName} is altered! Please provide a correct interface.`);
                // 	await Table.alterTable(t.tableName, oldScheme, newScheme, add, modify, remove);
            }
        }
    }
    else {
        throw new Error("Could not initialize tables!");
    }
});
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
