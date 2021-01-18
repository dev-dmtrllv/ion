import { QueryOkPacket } from "./Database";
export declare class Table<T> {
    readonly tableName: string;
    constructor(tableName: string);
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
export {};
