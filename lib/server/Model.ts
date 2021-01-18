export type Model<T extends {} = {}> = {
	readonly id: number;
} & T;
