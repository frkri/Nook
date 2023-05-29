import { getFileEntryHandle, resolveEntriesByID } from '$lib/client/explorer';
import { createURLFromBuffer } from '$lib/client/utils';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params, depends }) => {
	// Allows force refresh on create or remove events
	depends('entries:editor-loader');

	const fileID = params.path.split('/').pop() || 'root';

	// Get Entry of File
	const entry = (await resolveEntriesByID([fileID]))[0];
	const entryHandle = await getFileEntryHandle(fileID);

	if (!entry || !entryHandle) throw error(404, 'Entry not found');

	const file = await entryHandle.getFile();
	let entryContent: string | URL = '';

	if (entry.type === 'note') entryContent = await file.text();
	else entryContent = createURLFromBuffer(await file.arrayBuffer());

	return {
		entry,
		entryHandle,
		entryContent
	};
}) satisfies PageLoad;
