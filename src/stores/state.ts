import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type State = {
	editorSize: number;
};

type SavedState = {
	state: State;
	version: number;
};

export type Actions = {
	setEditorSize: (editorSize: number) => void;
};

export const useStateStore = create<State & Actions>()(
	persist(
		(set, _get) => {
			const getSavedState = (): State | null => {
				const serializedState = localStorage.getItem("state");
				if (serializedState === null) {
					return null;
				}

				const blob: SavedState = JSON.parse(serializedState);

				return blob.state;
			};

			let savedState = getSavedState();

			if (savedState === null) {
				savedState = {
					editorSize: 50,
				};
			}

			return {
				...savedState,
				setEditorSize: (editorSize: number) =>
					set((state) => {
						return {
							...state,
							editorSize: editorSize,
						};
					}),
			};
		},
		{
			name: "state",
			storage: createJSONStorage(() => localStorage),
			version: 0,
		},
	),
);
