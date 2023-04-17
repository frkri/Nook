import { getEntriesByID } from '$lib/client/explorer';
import { writable } from 'svelte/store';

interface currentPath {
	pathData: EntryData[]; // Path with EntryData objects
	pathID: string[]; // path with IDs
}

function createPathStore() {
	const { subscribe, set } = writable<currentPath>({
		pathData: [],
		pathID: []
	});

	return {
		subscribe,
		setPathFromID: (path: string[]) => {
			// Get path from ID
			getEntriesByID(path).then((entries) => {
				set({
					pathData: entries,
					pathID: path
				});
			});
		}
	};
}

export const currentPath = createPathStore();
