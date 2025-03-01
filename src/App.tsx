import { useEffect, useRef, useState } from "react";

import * as d3 from "d3";

// @ts-expect-error Cannot find module './main.css' or its corresponding type declarations.ts(2307)
import "./main.css";
import { Tooltip } from "@radix-ui/react-tooltip";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { Badge } from "./components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import {
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./components/ui/tooltip";
import type { ColumnData, TableData } from "./types/db";

function PKIcon() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Badge>🔑</Badge>
				</TooltipTrigger>
				<TooltipContent>
					<p>Primary Key</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

function FKIcon() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Badge>🔗</Badge>
				</TooltipTrigger>
				<TooltipContent>
					<p>Foreign Key</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

const schema: TableData[] = [
	{
		tableName: "Users",
		columns: [
			{ name: "id", type: "INT", pk: true }, // Primary Key
			{ name: "name", type: "VARCHAR(255)" },
			{ name: "email", type: "VARCHAR(255)" },
			{ name: "role_id", type: "INT", fk: "Roles.id" }, // Foreign Key to "Roles" table
		],
		position: { x: 100, y: 100 }, // Initial position of the table
	},
	{
		tableName: "Roles",
		columns: [
			{ name: "id", type: "INT", pk: true }, // Primary Key
			{ name: "role_name", type: "VARCHAR(255)" },
		],
		position: { x: 600, y: 300 }, // Initial position of the table
	},
];

type Connection = {
	from: {
		tableName: string;
		columnName: string;
	};
	to: {
		tableName: string;
		columnName: string;
	};
};

const connections: Connection[] = [
	{
		from: {
			tableName: "Users",
			columnName: "role_id",
		},
		to: {
			tableName: "Roles",
			columnName: "id",
		},
	},
];

function Table({ table }: { table: TableData }) {
	let maxWidth = 0;
	for (const col of table.columns) {
		if (col.name.length > maxWidth) {
			maxWidth = col.name.length;
		}
	}

	return (
		<Card
			id={table.tableName}
			className="w-fit min-w-[250px] absolute"
			style={{
				left: `${table.position.x}px`,
				top: `${table.position.y}px`,
			}}
		>
			<CardHeader>
				<CardTitle>{table.tableName}</CardTitle>
			</CardHeader>
			<CardContent>
				{table.columns.map((col: ColumnData, idx: number) => {
					return (
						<li
							key={`${col.name}-${idx}`}
							id={`${table.tableName}-${col.name}`}
							className="flex justify-between p-2 border-b last:border-none"
						>
							{/* Field Name */}
							<span
								className="font-medium font-mono"
								style={{ minWidth: `${maxWidth}ch` }}
							>
								{col.name}
							</span>

							{/* PK/KF Icons */}

							{col.pk ? <PKIcon /> : <></>}
							{col.fk ? <FKIcon /> : <></>}

							{/* Data Type and Icons for PK/FK */}
							<span className="text-gray-500 text-sm">{col.type}</span>
						</li>
					);
				})}
			</CardContent>
		</Card>
	);
}

const DBSchema = ({
	schema,
	connections,
}: { schema: TableData[]; connections: Connection[] }) => {
	const svgRef = useRef<SVGSVGElement | null>(null);
	const [tables, _] = useState<TableData[]>(schema); // Store table positions

	// 🎯 Draw Foreign Key Relationships with D3
	useEffect(() => {
		const svg = d3.select(svgRef.current); // Select the SVG element
		svg.selectAll("*").remove(); // Clear previous lines before redrawing

		for (const conn of connections) {
			for (const tbl of tables) {
				if (conn.from.tableName === tbl.tableName) {
					for (const col of tbl.columns) {
						if (col.name === conn.from.columnName) {
							const from = document.getElementById(
								`${tbl.tableName}-${col.name}`,
							);
							console.log("🚀 ~ useEffect ~ from:", from);
							console.log(
								"🚀 ~ useEffect ~ from:",
								`${tbl.tableName}-${col.name}`,
							);

							const to = document.getElementById(
								`${conn.to.tableName}-${conn.to.columnName}`,
							);
							console.log("🚀 ~ useEffect ~ to:", to);
							console.log(
								"🚀 ~ useEffect ~ to:",
								`${conn.to.tableName}-${conn.to.columnName}`,
							);

							if (from && to) {
								const fromRect = from.getBoundingClientRect();
								console.log("🚀 ~ useEffect ~ fromRect:", fromRect);

								const toRect = to.getBoundingClientRect();
								console.log("🚀 ~ useEffect ~ toRect:", toRect);

								// Calculate center points
								const sourceX = fromRect.x + fromRect.width / 2;
								const sourceY = fromRect.y - fromRect.height;
								const targetX = toRect.x + toRect.width / 2;
								const targetY = toRect.y - toRect.height;

								// Define the line generator with step curve
								const line = d3
									.line()
									// @ts-expect-error TODO: Fix this
									.x((d) => d.x)
									// @ts-expect-error TODO: Fix this
									.y((d) => d.y)
									.curve(d3.curveStep);

								// Create points array for the line
								const points = [
									{ x: sourceX, y: sourceY },
									{ x: targetX, y: targetY },
								];

								// Draw the path
								svg
									.append("path")
									.datum(points)
									// @ts-expect-error TODO: Fix this
									.attr("d", line)
									.attr("fill", "none")
									.attr("stroke", "black")
									.attr("stroke-width", 2);
							}
						}
					}
				}
			}
		}
	}, [tables, connections]); // Run this effect when the `tables` state updates

	return (
		<div className="relative w-full h-screen bg-gray-100">
			{/* Background Container for the Schema */}

			{/* SVG for Drawing Relationship Lines */}
			<svg ref={svgRef} className="absolute top-0 left-0 w-full h-full" />

			{/* Render All Tables */}
			{tables.map((table) => (
				<Table key={table.tableName} table={table} />
			))}
		</div>
	);
};

const MainApp = () => {
	return (
		<>
			<h1 className="text-3xl font-bold underline">Db Docs</h1>
			<p>Its empty here. Come by later.</p>
			<DBSchema schema={schema} connections={connections} />
		</>
	);
};

const router = createHashRouter([
	{
		path: "/",
		element: <MainApp />,
	},
]);

export default function App() {
	return <RouterProvider router={router} />;
}
