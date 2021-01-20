import { QueryOkPacket } from "./Database";
export declare class Table<T> {
    private static readonly tables;
    readonly tableName: string;
    readonly scheme: TableScheme<Model<T>>;
    constructor(tableName: string, scheme: TableScheme<T>);
    static readonly initializeTables: () => Promise<void>;
    private static alterTable;
    private static createColumnDefinition;
    private static createTable;
    select<K extends keyof Model<Required<T>>>(what: K[], match?: Match<Model<T>>, order?: QueryOrder<Model<T>>): Promise<Pick<Model<T>, K>[]>;
    select<K extends keyof Model<Required<T>> | "*">(what: K, match?: Match<Model<T>>, order?: QueryOrder<Model<T>>): Promise<Model<Required<T>>[]>;
    insert(props: T | T[]): Promise<QueryOkPacket>;
    update(what: AtLeastOne<Partial<T>>, match: Match<Model<T>>): Promise<QueryOkPacket>;
    delete(match: Match<Model<T>>): Promise<QueryOkPacket>;
}
declare type Model<T> = {
    readonly id: number;
} & T;
declare type QueryOrder<T, U = {
    [K in keyof T]: Pick<T, K>;
}, V = U[keyof U]> = {
    [K in keyof V]: "ASC" | "DESC";
};
declare type AtLeastOne<T, U = {
    [K in keyof T]: Pick<T, K>;
}> = U[keyof U];
declare type NumberMatchCondition = "<" | "<=" | ">" | ">=";
declare type Matcher<T> = {
    [K in keyof T]?: T[K] extends number ? (T[K] | [NumberMatchCondition, T[K]] | [NumberMatchCondition, T[K]][]) : T[K];
};
declare type Match<T> = Matcher<T> | Matcher<T>[];
declare type ForeignKeyInfo = {
    column: string;
    table: string;
    refColumn: string;
    onDelete: string;
    onUpdate: string;
};
declare type GenerateInfo = {
    expression: string;
    type: "VIRTUAL" | "STORED";
};
declare type ScehemTypeInfo<T> = {
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
declare type TableScheme<T> = {
    [K in keyof T]: ScehemTypeInfo<T[K]>;
};
export {};
