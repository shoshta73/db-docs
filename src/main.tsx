import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

let root = document.getElementById("app");
if (root === null) {
	root = document.createElement("div");
	document.body.appendChild(root);
	root.id = "app";
}

const Root = () => {
	return (
		<StrictMode>
			<h1>Db Docs</h1>
			<p>Its empty here. Come by later.</p>
		</StrictMode>
	);
};

createRoot(root).render(<Root />);
