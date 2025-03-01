import { useEffect, useRef, useState } from "react";

import * as d3 from "d3";

// @ts-expect-error Cannot find module './main.css' or its corresponding type declarations.ts(2307)
import "./main.css";
import { Tooltip } from "@radix-ui/react-tooltip";
import { Outlet, RouterProvider, createHashRouter } from "react-router-dom";
import { Badge } from "./components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import {
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./components/ui/tooltip";
import type { ColumnData, TableData } from "./types/db";
import { Button } from "./components/ui/button";
import { useSettingsStore } from "./stores/settings";
import { MoonIcon, SunIcon } from "lucide-react";

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
		position: { x: 400, y: 300 }, // Initial position of the table
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
							className="flex justify-between p-2 border"
							data-table={table.tableName}
							data-column={col.name}
						>
							<span
								className="font-medium font-mono"
								style={{ minWidth: `${maxWidth}ch` }}
							>
								{col.name}
							</span>

							{col.pk ? <PKIcon /> : <></>}
							{col.fk ? <FKIcon /> : <></>}

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
}: {
	schema: TableData[];
	connections: Connection[];
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement | null>(null);
	const [tables] = useState<TableData[]>(schema);
	const { theme } = useSettingsStore();
	const [dims, setDims] = useState({ width: 2000, height: 2000 });

	// Calculate and update the SVG dimensions based on table positions
	useEffect(() => {
		const calculateDimensions = () => {
			let maxX = 0;
			let maxY = 0;

			for (const table of tables) {
				const tableElement = document.getElementById(table.tableName);
				if (tableElement) {
					const rect = tableElement.getBoundingClientRect();
					const right = table.position.x + rect.width;
					const bottom = table.position.y + rect.height;

					if (right > maxX) maxX = right;
					if (bottom > maxY) maxY = bottom;
				}
			}

			// Add some padding
			setDims({
				width: maxX + 200,
				height: maxY + 200,
			});
		};

		// Run after DOM has had time to render tables
		setTimeout(calculateDimensions, 100);

		window.addEventListener("resize", calculateDimensions);
		return () => window.removeEventListener("resize", calculateDimensions);
	}, [tables]);

	// Draw Foreign Key Relationships with D3
	useEffect(() => {
		if (!svgRef.current || !containerRef.current) return;

		// Redraw function that will run after a small delay to ensure DOM is ready
		const drawConnections = () => {
			const svg = d3.select(svgRef.current);
			svg.selectAll("*").remove(); // Clear previous lines

			// Create arrowhead marker definition
			const defs = svg.append("defs");
			defs
				.append("marker")
				.attr("id", "arrowhead")
				.attr("viewBox", "0 -5 10 10")
				.attr("refX", 5)
				.attr("refY", 0)
				.attr("markerWidth", 6)
				.attr("markerHeight", 6)
				.attr("orient", "auto")
				.append("path")
				.attr("d", "M0,-5L10,0L0,5")
				.attr("fill", theme === "light" ? "#000000" : "#ffffff");

			for (const conn of connections) {
				const fromElement = document.getElementById(
					`${conn.from.tableName}-${conn.from.columnName}`,
				);
				const toElement = document.getElementById(
					`${conn.to.tableName}-${conn.to.columnName}`,
				);

				if (!fromElement || !toElement) {
					console.log(
						"Elements not found:",
						`${conn.from.tableName}-${conn.from.columnName}`,
						`${conn.to.tableName}-${conn.to.columnName}`,
					);
					return;
				}

				// Get table positions from the schema (these are absolute positions)
				const fromTable = tables.find(
					(t) => t.tableName === conn.from.tableName,
				);
				const toTable = tables.find((t) => t.tableName === conn.to.tableName);

				if (!fromTable || !toTable) return;

				// Get bounding rectangles
				const fromRect = fromElement.getBoundingClientRect();
				const toRect = toElement.getBoundingClientRect();
				const fromTableElement = document.getElementById(fromTable.tableName);
				const toTableElement = document.getElementById(toTable.tableName);

				if (!fromTableElement || !toTableElement) return;

				// Get table rectangles
				const fromTableRect = fromTableElement.getBoundingClientRect();
				const toTableRect = toTableElement.getBoundingClientRect();

				// Calculate positions directly based on schema positions and offsets within tables
				const sourceX = fromRect.right;
				const sourceY =
					fromTable.position.y +
					(fromRect.top - fromTableRect.top) +
					fromRect.height / 2;

				const targetX = toRect.left;
				const targetY =
					toTable.position.y +
					(toRect.top - toTableRect.top) +
					toRect.height / 2;

				// Create the path
				const midX = (sourceX + targetX) / 2;
				const line = d3.path();

				// Draw the curved line
				line.moveTo(sourceX, sourceY);
				line.bezierCurveTo(
					midX,
					sourceY, // Control point 1
					midX,
					targetY, // Control point 2
					targetX,
					targetY, // End point
				);

				// Add the path to the SVG
				svg
					.append("path")
					.attr("d", line.toString())
					.attr("fill", "none")
					.attr("stroke", theme === "light" ? "#000000" : "#ffffff")
					.attr("stroke-width", 2)
					.attr("marker-end", "url(#arrowhead)");
			}
		};

		// Delay drawing to make sure DOM elements are ready
		const timer = setTimeout(drawConnections, 300);

		return () => clearTimeout(timer);
	}, [tables, connections, theme]);

	return (
		<div
			ref={containerRef}
			className="relative w-full h-[calc(100vh-56px)] overflow-auto bg-background"
		>
			<div
				className="relative"
				style={{ width: `${dims.width}px`, height: `${dims.height}px` }}
			>
				<svg
					ref={svgRef}
					width={dims.width}
					height={dims.height}
					className="absolute top-0 left-0 pointer-events-none"
					style={{ zIndex: 10 }}
				/>

				{tables.map((table) => (
					<Table key={table.tableName} table={table} />
				))}
			</div>
		</div>
	);
};

function Header() {
	const { theme, toggleTheme } = useSettingsStore();

	return (
		<div className="w-full flex h-14 items-center px-2">
			<div className="flex-1" />
			<h1>Db Docs</h1>
			<div className="flex-1" />
			<Button variant="outline" onClick={toggleTheme}>
				{theme === "light" ? <MoonIcon /> : <SunIcon />}
			</Button>
		</div>
	);
}

function Container() {
	return (
		<div className="bg-background max-w-screen max-h-screen">
			<Header />
			<Outlet />
		</div>
	);
}

const MainApp = () => {
	return <DBSchema schema={schema} connections={connections} />;
};

const router = createHashRouter([
	{
		path: "/",
		element: <Container />,
		children: [
			{
				index: true,
				element: <MainApp />,
			},
		],
	},
]);

export default function App() {
	return <RouterProvider router={router} />;
}
