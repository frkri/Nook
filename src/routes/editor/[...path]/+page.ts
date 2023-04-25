import { getDirEntryHandle, getEntriesByID, resolveEntriesByID } from '$lib/client/explorer';
import { iterToArray } from '$lib/client/utils';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params, depends }) => {
	// Allows force refresh on create or remove events
	depends('entries:editor-loader');

	const currDirID = params.path.split('/').pop() || 'root';

	const entry = await resolveEntriesByID([currDirID]);
	const currDirHandle = await getDirEntryHandle(currDirID);

	// Show 404 if entry not found
	if (!currDirHandle) throw error(404, 'Entry not found');
	if (currDirHandle.kind !== 'directory') throw error(404, 'Entry is a directory, not a file');

	// Get entries of current Directory
	const reslovedEntries = await getEntriesByID(await iterToArray(currDirHandle.keys()));

	return {};
}) satisfies PageLoad;
