import { getEntriesByID } from '$lib/client/explorer';
import { writable } from 'svelte/store';

interface currentPath {
	pathData: EntryData[]; // Path with EntryData objects
	pathID: string[]; // path with IDs
	currentDirID: string; // Current directory ID
}

function createPathStore() {
	const { subscribe, set } = writable<currentPath>({
		pathData: [],
		pathID: [],
		currentDirID: 'root'
	});

	return {
		subscribe,
		setPathFromID: (path: string[]) => {
			// Get path from ID
			getEntriesByID(path).then((entries) => {
				set({
					pathData: entries,
					pathID: path,
					currentDirID: path[path.length - 1]
				});
			});
		}
	};
}

export const currentPath = createPathStore();
