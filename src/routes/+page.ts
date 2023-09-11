import type { PageLoad } from './$types.js';

export const ssr = false;
export const prerender = true;

export const load = (async () => {
	return { likes: 10 };
}) satisfies PageLoad;
