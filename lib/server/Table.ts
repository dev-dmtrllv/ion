import { Database, QueryOkPacket } from "./Database";

export class Table<T>
{
	public readonly tableName: string;

	public constructor(tableName: string)
	{
		this.tableName = tableName;
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
		for(const p in what)
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
