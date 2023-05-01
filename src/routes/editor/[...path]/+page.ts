import { getFileEntryHandle, resolveEntriesByID } from '$lib/client/explorer';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params, depends }) => {
	// Allows force refresh on create or remove events
	depends('entries:editor-loader');

	const fileID = params.path.split('/').pop() || 'root';

	// Get Entry of File
	const entry = await resolveEntriesByID([fileID]);
	const entryHandle = await getFileEntryHandle(fileID);

	if (!entry || !entryHandle) throw error(404, 'Entry not found');

	return {
		entry: entry[0],
		entryHandle: entryHandle
	};
}) satisfies PageLoad;
