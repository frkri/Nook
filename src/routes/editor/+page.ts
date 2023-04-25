import { getEntriesByID } from '$lib/client/explorer';
import type { PageLoad } from './$types';

export const load = (async (params) => {
	const file = await getEntriesByID(params)

	return {file, fileHandle};
}) satisfies PageLoad;
