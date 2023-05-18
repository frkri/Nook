import type { EntryData } from '$lib/types';

import { getDirEntryHandle, getEntriesByID } from '$lib/client/explorer';
import { iterToArray } from '$lib/client/utils';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params, depends }) => {
	// Allows force refresh on create or remove events
	depends('entries:explorer-loader');

	const currDirID = params.path.split('/').pop() || 'root';
	const currDirHandle = await getDirEntryHandle(currDirID);

	// Show 404 if entry not found
	if (!currDirHandle) throw error(404, 'Entry not found');
	if (currDirHandle.kind !== 'directory') throw error(404, 'Entry is not a directory');

	// Check if current directory is root
	const dirKeys = await iterToArray(currDirHandle.keys());

	// Prematurely return if directory is empty
	if (dirKeys.length === 0) {
		return {
			dirEntries: [],
			fileEntries: []
		};
	}

	// Get entries of current Directory
	const reslovedEntries = await getEntriesByID(dirKeys);

	const dirEntries = reslovedEntries.filter(
		(entry) => entry?.type === 'directory' && entry !== null
	) as EntryData[];
	const fileEntries = reslovedEntries.filter(
		(entry) => entry?.type === 'file' && entry !== null
	) as EntryData[];

	// Sort entries by name
	dirEntries.sort((a, b) => a.name.localeCompare(b.name));
	fileEntries.sort((a, b) => a.name.localeCompare(b.name));

	return {
		dirEntries,
		fileEntries
	};
}) satisfies PageLoad;
