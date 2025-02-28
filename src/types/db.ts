export type Position = {
	x: number;
	y: number;
};

export type ColumnData = {
	name: string;
	type: string;
	pk?: boolean;
	fk?: string;
};

export type TableData = {
	tableName: string;
	columns: ColumnData[];
	position: Position;
};
