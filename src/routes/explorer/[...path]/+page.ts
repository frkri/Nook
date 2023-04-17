import { getEntriesByID, getEntryHandle, type Entry } from '$lib/client/explorer';
import type { PageLoad } from './$types';

// This route cannot be prerendered
export const prerender = false;

export const load = (async ({ params, depends }) => {
	// Allows force refresh of Entries on new or removed entries
	depends('entries:loader');

	const dirEntries: Array<Entry> = [];
	const fileEntries: Array<Entry> = [];

	const currDirID = params.path.split('/').pop();
	console.log('Fetching entries for', currDirID || 'root');

	const currDirHandle = await getEntryHandle(currDirID);
	if (!currDirHandle)
		return {
			dirEntries,
			fileEntries
		};

	const entriesIDs: string[] = [];

	for await (const ID of currDirHandle.keys()) {
		entriesIDs.push(ID);
	}

	const Entries = getEntriesByID(entriesIDs);

	for await (const entry of await Entries) {
		if (!entry) {
			console.error(`Failed to find ${entry}`);
			continue;
		}

		if (entry.kind === 'directory') {
			dirEntries.push(entry);
		} else if (entry.kind === 'file') {
			fileEntries.push(entry);
		}
	}

	return {
		dirEntries,
		fileEntries
	};
}) satisfies PageLoad;
