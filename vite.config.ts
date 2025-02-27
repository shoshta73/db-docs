import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(() => {
	let base = {};
	if (process.env.NODE_ENV === "production") {
		base = {
			base: "/db-docs/",
		};
	}

	return {
		...base,
		plugins: [react()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
	};
});
