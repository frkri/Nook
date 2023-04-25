import type { LayoutLoad } from './$types';

export const load = (async (params) => {
	console.log('load', params);
	return {};
}) satisfies LayoutLoad;
