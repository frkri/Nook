import { getEntriesByID, getEntriesByName } from '$lib/client/explorer';
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
		currentDirID: ''
	});

	return {
		subscribe,
		setPathFromID: (path: string[]) => {
			getEntriesByID(path).then((entries) => {
				const resolvedPathData = entries.splice(0, entries.indexOf(null)) as EntryData[];
				const resolvedPathIDs = resolvedPathData.map((entry) => entry.id);

				console.log('temp', resolvedPathData, resolvedPathIDs);

				set({
					pathData: resolvedPathData,
					pathID: resolvedPathIDs,
					currentDirID: resolvedPathIDs[resolvedPathIDs.length - 1] || ''
				});
			});
		},
		setPathFromName: (path: string[]) => {
			getEntriesByName(path).then((entries) => {
				const resolvedPathData = entries.splice(0, entries.indexOf(null)) as EntryData[];
				const resolvedPathIDs = resolvedPathData.map((entry) => entry.id);

				console.log(resolvedPathData, resolvedPathIDs);
				set({
					pathData: resolvedPathData,
					pathID: resolvedPathIDs,
					currentDirID: resolvedPathIDs[resolvedPathIDs.length - 1] || ''
				});
			});
		}
	};
}

export const currentPath = createPathStore();
