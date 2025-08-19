import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import fs from 'fs/promises';

export const load: PageServerLoad = async ({ url, params }) => {
	const graphPath = url.searchParams.get('graph');

	if (graphPath) {
		try {
			const graphData = await fs.readFile(graphPath, 'utf-8');
			return {
				graph: JSON.parse(graphData)
			};
		} catch (err) {
			throw error(404, 'Graph JSON not found');
		}
	}

	return {
		graph: null
	};
};
