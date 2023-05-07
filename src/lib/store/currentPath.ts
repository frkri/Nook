import { resolveEntriesByID, resolveEntriesByName } from '$lib/client/explorer';
import { writable } from 'svelte/store';

interface currentPath {
	pathData: EntryData[]; // Path with EntryData objects
	pathID: string[]; // Path with IDs
	currentEntryID: string; // Current directory ID
	currentEntryName: string; // Current directory name
}

function createPathStore() {
	const { subscribe, set } = writable<currentPath>({
		pathData: [],
		pathID: [],
		currentEntryID: '',
		currentEntryName: ''
	});

	return {
		subscribe,
		setPathFromID: async (path: string[]) => {
			const entries = await resolveEntriesByID(path);
			// New array with only the ID of the entries
			const resolvedPathIDs = entries.map((entry) => entry.id);

			set({
				pathData: entries,
				pathID: resolvedPathIDs,
				currentEntryID: resolvedPathIDs[resolvedPathIDs.length - 1] || '',
				currentEntryName: entries[entries.length - 1]?.name || ''
			});
		},
		setPathFromName: async (path: string[]) => {
			const entries = await resolveEntriesByName(path);
			// New array with only the ID of the entries
			const resolvedPathIDs = entries.map((entry) => entry.id);

			set({
				pathData: entries,
				pathID: resolvedPathIDs,
				currentEntryID: resolvedPathIDs[resolvedPathIDs.length - 1] || '',
				currentEntryName: entries[entries.length - 1]?.name || ''
			});
		}
	};
}

export const currentPath = createPathStore();
