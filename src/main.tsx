import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// @ts-expect-error Cannot find module './main.css' or its corresponding type declarations.ts(2307)
import "./main.css";
import { Button } from "./components/ui/button";

let root = document.getElementById("app");
if (root === null) {
	root = document.createElement("div");
	document.body.appendChild(root);
	root.id = "app";
}

const Root = () => {
	return (
		<StrictMode>
			<h1 className="text-3xl font-bold underline">Db Docs</h1>
			<p>Its empty here. Come by later.</p>
			<Button>Hello</Button>
		</StrictMode>
	);
};

createRoot(root).render(<Root />);
