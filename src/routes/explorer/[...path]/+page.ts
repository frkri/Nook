import { getEntriesByID, getDirEntryHandle } from '$lib/client/explorer';
import { iterToArray } from '$lib/client/utils';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params, depends }) => {
	// Allows force refresh on create or remove events
	depends('entries:loader');

	const currDirID = params.path.split('/').pop() || 'root';
	const currDirHandle = await getDirEntryHandle(currDirID);

	console.log(currDirHandle, currDirID);

	// Show 404 if entry not found
	if (!currDirHandle) throw error(404, 'Entry not found');
	if (currDirHandle.kind !== 'directory') throw error(404, 'Entry is not a directory');

	// Get entries of current Directory
	const reslovedEntries = await getEntriesByID(await iterToArray(currDirHandle.keys()));

	const dirEntries = reslovedEntries.filter((entry) => entry.type === 'directory');
	const fileEntries = reslovedEntries.filter((entry) => entry.type === 'file');

	return {
		dirEntries,
		fileEntries
	};
}) satisfies PageLoad;
