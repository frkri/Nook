import { resolveIDsFromPath, resolvePathFromIDs } from '$lib/client/explorer';
import { writable } from 'svelte/store';

interface currentPath {
	resolvedPath: string[]; // Path with names
	path: string[]; // path with IDs

	currentDirID: string; // ID of current directory
	currentDirName: string; // Name of current directory
}

function createPathStore() {
	const { subscribe, set } = writable<currentPath>({
		resolvedPath: [],
		path: [],
		currentDirID: '',
		currentDirName: ''
	});

	return {
		subscribe,
		setResolvedPath: async (resolvedPath: string) => {
			const newCurrentPathID = await resolveIDsFromPath(resolvedPath.split('/'));
			const newCurrentPath = await resolvePathFromIDs(newCurrentPathID); // Mozda ima bolji nacin da se ovo uradi

			set({
				resolvedPath: newCurrentPath,
				path: newCurrentPathID,
				currentDirID: newCurrentPathID[newCurrentPathID.length - 1] || 'root',
				currentDirName: newCurrentPath[newCurrentPath.length - 1] || 'root'
			});

			return newCurrentPathID;
		},
		/**
		 * Set the current path using IDs
		 * @param path
		 */
		setPath: async (path: string) => {
			const newCurrentPathID = path.split('/');
			const newCurrentPath = await resolvePathFromIDs(newCurrentPathID);

			set({
				resolvedPath: newCurrentPath,
				path: newCurrentPathID,
				currentDirID: newCurrentPathID[newCurrentPathID.length - 1] || 'root',
				currentDirName: newCurrentPath[newCurrentPathID.length - 1] || 'root'
			});

			return newCurrentPath;
		}
	};
}

export const currentPath = createPathStore();
