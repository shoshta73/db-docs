import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Settings = {
	theme: "light" | "dark";
};

type SavedSettings = {
	state: Settings;
	version: number;
};

export interface SettingsActions {
	toggleTheme: () => void;
}

export const useSettingsStore = create<Settings & SettingsActions>()(
	persist(
		(set, _get) => {
			const getSavedState = (): Settings | null => {
				const serializedState = localStorage.getItem("settings");
				if (serializedState === null) {
					return null;
				}

				const blob: SavedSettings = JSON.parse(serializedState);

				return blob.state;
			};

			let savedState = getSavedState();

			const initialTheme = (): "light" | "dark" => {
				if (typeof window === "undefined") {
					return "light";
				}

				if (!window.matchMedia) {
					return "light";
				}

				if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
					return "dark";
				}

				return "light";
			};

			if (savedState === null) {
				savedState = {
					theme: initialTheme(),
				};
			}

			if (savedState.theme === "light") {
				document.documentElement.classList.add("light");
				document.documentElement.classList.remove("dark");
			} else {
				document.documentElement.classList.add("dark");
				document.documentElement.classList.remove("light");
			}

			return {
				...savedState,
				toggleTheme: () =>
					set((state) => {
						let nextTheme: "light" | "dark";
						if (state.theme === "light") {
							document.documentElement.classList.remove("light");
							document.documentElement.classList.add("dark");
							nextTheme = "dark";
						} else {
							document.documentElement.classList.remove("dark");
							document.documentElement.classList.add("light");
							nextTheme = "light";
						}

						return {
							...state,
							theme: nextTheme,
						};
					}),
			};
		},
		{
			name: "settings",
			storage: createJSONStorage(() => localStorage),
			version: 0,
		},
	),
);
