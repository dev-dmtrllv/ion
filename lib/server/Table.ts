import { table } from "console";
import { Config } from "./Config";
import { Database, QueryOkPacket } from "./Database";

export class Table<T>
{
	private static readonly tables: Map<string, Table<any>> = new Map();

	public readonly tableName: string;

	public readonly scheme: TableScheme<Model<T>>;

	public constructor(tableName: string, scheme: TableScheme<T>)
	{
		if (Table.tables.has(tableName))
		{
			throw new Error(`${tableName} already exists!`);
		}
		else
		{
			Table.tables.set(tableName, this);
		}

		this.tableName = tableName;

		this.scheme = {
			id: {
				type: "int",
				isPrimaryKey: true,
				autoIncrement: true,
				isNotNull: true
			},
			...scheme
		} as TableScheme<Model<T>>;
	}

	public static readonly initializeTables = async () =>
	{
		const { database } = Config.get();

		if (!database)
			return;

		const schemaName: string = database.databaseName;

		const { results, fields } = await Database.query(`SELECT * FROM information_schema.columns WHERE table_schema = '${schemaName}'`);
		const fkQueryResult = await Database.query(`SELECT TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA = '${schemaName}'`)
		const fkeys = fkQueryResult.results! as any[];

		if (results)
		{
			Table.tables.forEach(async t => 
			{
				const newScheme = t.scheme;
				const check = await Database.query(`SHOW TABLES LIKE '${t.tableName}'`);

				// table does not exists! create it 
				if ((check.results as any).length === 0)
				{
					console.log(`creating table ${t.tableName}...`);
					await Table.createTable(t.tableName, newScheme);
					return;
				}

				const oldScheme: TableScheme<Model<any>> = {
					id: {
						type: "int",
						isPrimaryKey: true,
						autoIncrement: true,
						isUnique: true,
						isNotNull: true
					},
				};

				(results as any).forEach(r =>
				{
					if (r.TABLE_NAME === t.tableName)
					{
						const columnName = r.COLUMN_NAME;

						const info: ScehemTypeInfo<any> = {
							type: r.DATA_TYPE.toLowerCase()
						};

						if (r.COLLATION_NAME?.includes("bin"))
							info.isBinary = true;
						if (r.COLUMN_TYPE?.includes("unsigned"))
							info.isUnsigned = true;
						if (r.IS_NULLABLE === "NO")
							info.isNotNull = true;
						if (r.CHARACTER_MAXIMUM_LENGTH)
							info.size = r.CHARACTER_MAXIMUM_LENGTH;
						if (r.EXTRA)
						{
							if (r.EXTRA === "auto_increment")
							{
								info.autoIncrement = true;
							}
							else if (r.EXTRA === "VIRTUAL GENERATED" && r.GENERATION_EXPRESSION)
							{
								info.generate = {
									expression: r.GENERATION_EXPRESSION.split("\\'")[1],
									type: "VIRTUAL"
								}
							}
							else if (r.EXTRA === "STORED GENERATED" && r.GENERATION_EXPRESSION)
							{
								info.generate = {
									expression: r.GENERATION_EXPRESSION.split("\\'")[1],
									type: "STORED"
								}
							}
						}
						if (r.COLUMN_KEY)
						{
							if (r.COLUMN_KEY === "PRI")
								info.isPrimaryKey = true;
							else if (r.COLUMN_KEY === "UNI")
								info.isUnique = true;
						}

						// check foreign keys
						const fk = fkeys.find(r => (r.TABLE_NAME === t.tableName && r.COLUMN_NAME === columnName));
						if (fk)
						{
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

				const remove: string[] = [];
				const add: string[] = [];
				const modify: string[] = [];

				all.forEach(p => 
				{
					if (oldProps.includes(p) && !newProps.includes(p))
						remove.push(p);
					else if (!oldProps.includes(p) && newProps.includes(p))
						add.push(p);
					else // compare inner structure
					{
						const oldInfo: ScehemTypeInfo<any> = oldScheme[p];
						const newInfo: ScehemTypeInfo<any> = newScheme[p];

						const allProps = [...Object.keys(oldInfo), ...Object.keys(newInfo)];
						for (const prop of allProps)
						{
							if (prop === "generate")
							{
								const _old = oldInfo[prop] as GenerateInfo;
								const _new = newInfo[prop] as GenerateInfo;

								if (_old.expression !== _new.expression || _old.type !== _new.type)
								{
									modify.push(p);
									break;
								}
							}
							else if (prop === "foreignKey")
							{
								const _old = oldInfo[prop] as ForeignKeyInfo;
								const _new = newInfo[prop] as ForeignKeyInfo;

								for (const _prop in _old)
								{
									if (_old[_prop] !== _new[_prop])
									{
										modify.push(p);
										break;
									}
								}
							}
							if (oldInfo[prop] !== newInfo[prop])
							{
								modify.push(p);
								break;
							}
						};
					}
				});

				if (remove.length > 0 || modify.length > 0 || add.length > 0)
					await Table.alterTable(t.tableName, oldScheme, newScheme, add, modify, remove);
			});
		}
		else
		{
			throw new Error("Could not initialize tables!");
		}
	}

	private static async alterTable(tableName: string, oldScheme: TableScheme<any>, scheme: TableScheme<any>, add: string[], update: string[], remove: string[])
	{
		if (add.length > 0)
		{
			const primaryKeys: string[] = [];
			const foreignKeys: ForeignKeyInfo[] = [];
			const uniques: string[] = [];
			const columns: string[] = [];

			add.forEach(prop => columns.push("ADD " + this.createColumnDefinition(prop, scheme[prop], uniques, primaryKeys, foreignKeys)));

			let sql = `ALTER TABLE ${tableName} ${columns.join(", ")}`;

			if (primaryKeys.length > 0)
				sql += `,${primaryKeys.map((column) => `PRIMARY KEY (\`${column}\`)`).join(", ")}`;

			if (foreignKeys.length > 0)
				sql += `,${foreignKeys.map(({ column, refColumn, table }) => `INDEX \`fk_${column}_idx\` (\`${column}\` ASC) VISIBLE, CONSTRAINT \`fk_${column}\` FOREIGN KEY (\`${column}\`) REFERENCES \`${table}\`(\`${refColumn}\`)`).join(", ")}`;

			if (uniques.length > 0)
				sql += `,${uniques.map((column) => `UNIQUE INDEX \`${column}_UNIQUE\` (\`${column}\` ASC) VISIBLE`).join(", ")}`;

			await Database.query(sql);
		}

		if (remove.length > 0)
		{
			const sql = `ALTER TABLE ${tableName} ${remove.map(s => `DROP ${s}`).join(", ")}`;
			await Database.query(sql);
		}

		if (update.length > 0)
		{
			// todo ALTER TABLE ... MODIFY .... logic implementation

			let drop: string[] = [];
			let add: string[] = [];
			let _update: string[] = [];

			const primaryKeys: string[] = [];
			const foreignKeys: ForeignKeyInfo[] = [];
			const uniques: string[] = [];
			const columns: string[] = [];

			for (const column in scheme)
			{
				if (oldScheme[column].foreignKey && !scheme[column].foreignKey)
				{
					drop.push(`FOREIGN KEY \`${column}\``, `INDEX \`fk_${column}_idx\``)
				}
				else if (!oldScheme[column].foreignKey && scheme[column].foreignKey)
				{
					add.push(column);
				}
				else if (oldScheme[column].foreignKey && scheme[column].foreignKey)
				{
					for (let p in oldScheme[column].foreignKey)
						if (oldScheme[column].foreignKey![p] !== scheme[column].foreignKey![p])
						{
							drop.push(`FOREIGN KEY \`${column}\``, `INDEX \`fk_${column}_idx\``)
							update.push(column);
							break;
						}
				}

				if(oldScheme[column].generate && !scheme[column].generate)
				{
					update.push(column);
				}
				else if(!oldScheme[column].generate && scheme[column].generate)
				{
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
	}

	private static createColumnDefinition(columnName: string, info: ScehemTypeInfo<any>, uniques: string[], primaryKeys: string[], foreignKeys: ForeignKeyInfo[])
	{
		const { type, size, autoIncrement, defaultValue, foreignKey, isBinary, generate, isNotNull, isPrimaryKey, isUnique, isUnsigned, zeroFill } = info;

		const c: string[] = [columnName, type];

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
			c.push(`DEFAULT ${defaultValue === "" ? "\"\"" : defaultValue}`)

		if (foreignKey)
		{
			foreignKeys.push({
				column: columnName,
				refColumn: foreignKey.column,
				table: foreignKey.table,
				onDelete: foreignKey.onDelete || "NO ACTION",
				onUpdate: foreignKey.onUpdate || "NO ACTION",
			});
		}

		if (isPrimaryKey)
		{
			primaryKeys.push(columnName);
		}

		if (generate)
		{
			const { expression, type } = generate;
			c.push(`GENERATED ALWAYS AS (${expression}) ${type}`);
		}

		return c.join(" ");
	}

	private static async createTable(tableName: string, scheme: TableScheme<any>)
	{
		const columns: string[] = [];
		const primaryKeys: string[] = [];
		const foreignKeys: ForeignKeyInfo[] = [];
		const uniques: string[] = [];

		for (const p in scheme)
			columns.push(this.createColumnDefinition(p, scheme[p], uniques, primaryKeys, foreignKeys));

		let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(", ")}`;

		if (primaryKeys.length > 0)
			sql += `,${primaryKeys.map((column) => `PRIMARY KEY (\`${column}\`)`).join(", ")}`;

		if (foreignKeys.length > 0)
			sql += `,${foreignKeys.map(({ column, refColumn, table }) => `INDEX \`fk_${column}_idx\` (\`${column}\` ASC) VISIBLE, CONSTRAINT \`fk_${column}\` FOREIGN KEY (\`${column}\`) REFERENCES \`${table}\`(\`${refColumn}\`)`).join(", ")}`;

		if (uniques.length > 0)
			sql += `,${uniques.map((column) => `UNIQUE INDEX \`${column}_UNIQUE\` (\`${column}\` ASC) VISIBLE`).join(", ")}`;

		await Database.query(sql + ")");
	}

	public async select<K extends keyof Model<Required<T>>>(what: K[], match?: Match<Model<T>>, order?: QueryOrder<Model<T>>): Promise<Pick<Model<T>, K>[]>;
	public async select<K extends keyof Model<Required<T>> | "*">(what: K, match?: Match<Model<T>>, order?: QueryOrder<Model<T>>): Promise<Model<Required<T>>[]>;
	public async select<K extends keyof Model<Required<T>>>(what: K[] | "*", match?: Match<Model<T>>, order?: QueryOrder<Model<T>>)
	{
		const whatString = what == "*" ? what : what.join(",");
		const data = [];
		let whereString: string | null = null;
		let orderString: string | null = null;

		if (match)
			whereString = matchToString(match, data);

		if (order)
		{
			let parts: string[] = [];
			for (const prop in order)
				parts.push(`${prop} ${order[prop]}`);
			orderString = parts.join(", ");
		}

		const query = `SELECT ${whatString} from ${this.tableName} ${whereString ? `WHERE ${whereString}` : ""} ${orderString ? `ORDER BY ${orderString}` : ""}`;
		const { results } = await Database.query(query, data);
		return [...results as any];
	}

	public async insert(props: T | T[]): Promise<QueryOkPacket>
	{
		props = Array.isArray(props) ? props : [props];

		const keys = Array.isArray(props) ? Object.keys(props[0]) : Object.keys(props);
		const data: any[] = [];

		let values: string[] = [];

		props.forEach((p) => 
		{
			let v: any[] = [];
			for (const k in p)
			{
				v.push("?");
				data.push(p[k]);
			}
			values.push(`(${v.join(", ")})`);
		});

		const { results } = await Database.query(`INSERT INTO ${this.tableName} (${keys.join(",")}) VALUES ${values.join(", ")}`, data);

		return results as QueryOkPacket;
	}

	public async update(what: AtLeastOne<Partial<T>>, match: Match<Model<T>>)
	{
		const data: any[] = [];
		let whatParts: string[] = [];
		for (const p in what)
		{
			whatParts.push(`${p} = ?`);
			data.push(what[p]);
		}

		const whereString = matchToString(match, data);

		const query = `UPDATE ${this.tableName} SET ${whatParts.join(" ")} WHERE ${whereString}`;
		const { results } = await Database.query(query, data);

		return results as QueryOkPacket;
	}

	public async delete(match: Match<Model<T>>)
	{
		const data: any[] = [];
		let whereString = matchToString(match, data);
		const query = `DELETE FROM ${this.tableName} WHERE ${whereString}`;
		const { results } = await Database.query(query, data);
		return results as QueryOkPacket;
	}
}

const matchToString = <T>(matcher: Match<Model<T>>, dataRef: any[] = []) => 
{
	let rootMatchParts: any[] = [];

	matcher = Array.isArray(matcher) ? matcher : [matcher];

	matcher.forEach((m) => 
	{
		let parts: string[] = [];
		for (const k in m)
		{
			const val = m[k];
			if (Array.isArray(val)) // the type is a number lets get the operator values
			{
				if (Array.isArray(val[0])) // we got multiple number operators (combine with AND)
				{
					for (const [operator, value] of val)
					{
						parts.push(`${k} ${operator} ?`);
						dataRef.push(value);
					}
				}
				else
				{
					const [operator, value] = val;
					parts.push(`${k} ${operator} ?`);
					dataRef.push(value);
				}
			}
			else
			{
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

type Model<T> = {
	readonly id: number;
} & T;

type QueryOrder<T, U = { [K in keyof T]: Pick<T, K> }, V = U[keyof U]> = {
	[K in keyof V]: "ASC" | "DESC";
};

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = U[keyof U];

type NumberMatchCondition = "<" | "<=" | ">" | ">=";

type Matcher<T> = {
	[K in keyof T]?: T[K] extends number ? (T[K] | [NumberMatchCondition, T[K]] | [NumberMatchCondition, T[K]][]) : T[K];
};

type Match<T> = Matcher<T> | Matcher<T>[];

type ForeignKeyInfo = {
	column: string;
	table: string;
	refColumn: string;
	onDelete: string;
	onUpdate: string;
};

type GenerateInfo = {
	expression: string;
	type: "VIRTUAL" | "STORED";
};

type ScehemTypeInfo<T> = {
	type: "int" | "varchar" | "tinyint" | "date" | "datetime" | "time" | "timestamp" | "binary" | "text";
	size?: number;
	isNotNull?: boolean;
	isUnique?: boolean;
	isBinary?: boolean;
	isUnsigned?: boolean;
	zeroFill?: boolean;
	autoIncrement?: boolean;
	generate?: GenerateInfo;
	defaultValue?: T;
	isPrimaryKey?: boolean;
	foreignKey?: ForeignKeyInfo;
};

type TableScheme<T> = {
	[K in keyof T]: ScehemTypeInfo<T[K]>;
};
