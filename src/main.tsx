import { createRoot } from "react-dom/client";

import { StrictMode } from "react";
import App from "./App";

let root = document.getElementById("app");
if (root === null) {
	root = document.createElement("div");
	document.body.appendChild(root);
	root.id = "app";
}

const Root: React.FC = () => {
	return (
		<StrictMode>
			<App />
		</StrictMode>
	);
};

createRoot(root).render(<Root />);
