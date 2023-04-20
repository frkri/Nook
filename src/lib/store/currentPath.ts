import { resolveEntriesByID, resolveEntriesByName } from '$lib/client/explorer';
import { writable } from 'svelte/store';

interface currentPath {
	pathData: EntryData[]; // Path with EntryData objects
	pathID: string[]; // Path with IDs
	currentDirID: string; // Current directory ID
	currentDirName: string; // Current directory name
}

function createPathStore() {
	const { subscribe, set } = writable<currentPath>({
		pathData: [],
		pathID: [],
		currentDirID: '',
		currentDirName: ''
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
					currentDirID: resolvedPathIDs[resolvedPathIDs.length - 1] || '',
					currentDirName: entries[entries.length - 1]?.name || ''
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
					currentDirID: resolvedPathIDs[resolvedPathIDs.length - 1] || '',
					currentDirName: entries[entries.length - 1]?.name || ''
				});
			});
		}
	};
}

export const currentPath = createPathStore();
