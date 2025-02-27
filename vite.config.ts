import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

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
	};
});
