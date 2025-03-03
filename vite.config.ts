import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
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
		plugins: [react(), visualizer()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						react: [
							"react",
							"react-dom",
							"react-dom/client",
							"react-router-dom",
						],
						ui: [
							"@radix-ui/react-tooltip",
							"@radix-ui/react-slot",
							"react-resizable-panels",
						],
						d3: ["d3"],
						zustand: ["zustand", "zustand/middleware"],
						tailwind: [
							"class-variance-authority",
							"clsx",
							"tailwind-merge",
							"tailwindcss-animate",
						],
						lucide: ["lucide-react"],
						editor: ["@uiw/react-textarea-code-editor"],
					},
				},
			},
		},
	};
});
