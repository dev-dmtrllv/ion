import mysql from "mysql";
import { Config } from "./Config";

export class Database
{
	private static _pool: mysql.Pool | null = null;

	private static get pool() 
	{
		if (!this._pool)
		{
			const { database } = Config.get();

			if(!database)
				throw new Error("Please configure the database in the ion.json file!");

			const { databaseName, ...props } = database;

			this._pool = mysql.createPool({
				database: databaseName,
				...props
			});
		}

		return this._pool;
	};

	public static query(query: string, values: any = [])
	{
		return new Promise<QueryResponse>((resolve, reject) => 
		{
			this.pool.query(query, values, (err, results, fields) => 
			{
				if(err)
				{
					reject(err);
				}
				else
				{
					resolve({ results, fields });
				}
			});
		});
	}
}

export type QueryResponse = {
	results?: QueryOkPacket | any[];
	fields?: any;	
};

export type QueryOkPacket = {
	fieldCount: number;
	affectedRows: number;
	insertId: number;
	serverStatus: number;
	warningCount: number;
	message: string;
	protocol41: boolean;
	changedRows: number;
}
