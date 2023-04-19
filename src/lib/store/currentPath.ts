import { resolveEntriesByID, resolveEntriesByName } from '$lib/client/explorer';
import { writable } from 'svelte/store';

interface currentPath {
	pathData: EntryData[]; // Path with EntryData objects
	pathID: string[]; // Path with IDs
	currentDirID: string; // Current directory ID
}

function createPathStore() {
	const { subscribe, set } = writable<currentPath>({
		pathData: [],
		pathID: [],
		currentDirID: ''
	});

	return {
		subscribe,
		setPathFromID: (path: string[]) => {
			resolveEntriesByID(path).then((entries) => {
				// New array with only the ID of the entries
				const resolvedPathIDs = entries.map((entry) => entry.id);

				set({
					pathData: entries,
					pathID: resolvedPathIDs,
					currentDirID: resolvedPathIDs[resolvedPathIDs.length - 1] || ''
				});
			});
		},
		setPathFromName: (path: string[]) => {
			resolveEntriesByName(path).then((entries) => {
				// New array with only the ID of the entries
				const resolvedPathIDs = entries.map((entry) => entry.id);

				set({
					pathData: entries,
					pathID: resolvedPathIDs,
					currentDirID: resolvedPathIDs[resolvedPathIDs.length - 1] || ''
				});
			});
		}
	};
}

export const currentPath = createPathStore();
