export declare class Database {
    private static _pool;
    private static get pool();
    static query(query: string, values?: any): Promise<QueryResponse>;
}
export declare type QueryResponse = {
    results?: QueryOkPacket | any[];
    fields?: any;
};
export declare type QueryOkPacket = {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;
};
