import { StrictMode, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

import * as d3 from "d3";

// @ts-expect-error Cannot find module './main.css' or its corresponding type declarations.ts(2307)
import "./main.css";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

let root = document.getElementById("app");
if (root === null) {
	root = document.createElement("div");
	document.body.appendChild(root);
	root.id = "app";
}

// Define Types
interface NodeData {
	id: string;
	x?: number;
	y?: number;
	fx?: number | null;
	fy?: number | null;
}

interface LinkData {
	source: string | NodeData;
	target: string | NodeData;
}

const FlowGraph: React.FC = () => {
	const svgRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		const width = 600;
		const height = 400;
		const distance = 100;
		const chargeCoefficient = -7;

		const svg = d3
			.select(svgRef.current)
			.attr("viewBox", `0 0 ${width} ${height}`);

		// Define Nodes and Links
		const nodes: NodeData[] = [
			{ id: "Start" },
			{ id: "Process 1" },
			{ id: "Process 2" },
			{ id: "End" },
		];

		const links: LinkData[] = [
			{ source: "Start", target: "Process 1" },
			{ source: "Start", target: "Process 2" },
			{ source: "Process 1", target: "End" },
			{ source: "Process 2", target: "End" },
		];

		// D3 Simulation
		const simulation = d3
			.forceSimulation<NodeData>(nodes)
			.force(
				"link",
				d3
					.forceLink<NodeData, LinkData>(links)
					.id((d) => d.id)
					.distance(distance),
			)
			.force(
				"charge",
				d3.forceManyBody().strength(distance * chargeCoefficient),
			)
			.alphaMin(0.1)
			.force("center", d3.forceCenter(width / 2, height / 2));

		// Create Links
		const link = svg
			.append("g")
			.attr("stroke", "#888")
			.attr("stroke-width", 2)
			.selectAll("line")
			.data(links)
			.enter()
			.append("line");

		// Create Nodes
		const node = svg
			.append("g")
			.selectAll("circle")
			.data(nodes)
			.enter()
			.append("circle")
			.attr("r", 25)
			.attr("fill", "#3498db")
			.call(
				d3
					.drag<SVGCircleElement, NodeData>()
					.on("start", (event, d) => {
						if (!event.active) simulation.alphaTarget(0.3).restart();
						d.fx = d.x;
						d.fy = d.y;
					})
					.on("drag", (event, d) => {
						d.fx = event.x;
						d.fy = event.y;
					})
					.on("end", (event, d) => {
						if (!event.active) simulation.alphaTarget(0);
						d.fx = null;
						d.fy = null;
					}),
			);

		// Add Labels
		const text = svg
			.append("g")
			.selectAll("text")
			.data(nodes)
			.enter()
			.append("text")
			.attr("fill", "#fff")
			.attr("text-anchor", "middle")
			.attr("dy", 5)
			.attr("font-size", "12px")
			.text((d) => d.id);

		let tick = 0;

		// Tick Simulation
		simulation.on("tick", () => {
			console.log(++tick);
			link
				.attr("x1", (d) => (d.source as NodeData).x ?? 0)
				.attr("y1", (d) => (d.source as NodeData).y ?? 0)
				.attr("x2", (d) => (d.target as NodeData).x ?? 0)
				.attr("y2", (d) => (d.target as NodeData).y ?? 0);

			node.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);
			text.attr("x", (d) => d.x ?? 0).attr("y", (d) => d.y ?? 0);
		});
	}, []);

	return (
		<Card className="p-4 shadow-md rounded-lg">
			<CardContent className="flex justify-center items-center">
				<svg ref={svgRef} width="100%" height="400" />
			</CardContent>
		</Card>
	);
};

const Root: React.FC = () => {
	return (
		<StrictMode>
			<h1 className="text-3xl font-bold underline">Db Docs</h1>
			<p>Its empty here. Come by later.</p>
			<Button>Hello</Button>
			<FlowGraph />
		</StrictMode>
	);
};

createRoot(root).render(<Root />);
