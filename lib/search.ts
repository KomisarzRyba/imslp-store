import redis from './redis';

export const perPage = 2;

//redis cache - sorted set, content format : c:LastName,_FirstName (composer) or w:WorkTitle (work)

export type CacheResult = {
	entries: { type: 'c' | 'w'; id: string }[];
	isLastPage: boolean;
};

export const getCache = async (
	query: string,
	page: number = 1
): Promise<CacheResult> => {
	const cacheResults: string[] = await redis.zrange(
		query,
		(page - 1) * perPage,
		page * perPage,
		{ rev: true }
	);

	if (cacheResults.length > perPage) {
		cacheResults.pop();
		var isLastPage = false;
	} else {
		var isLastPage = true;
	}

	const entries = cacheResults.map((result) => {
		const [typeStr, id] = result.split(':');
		const type = typeStr as 'c' | 'w';
		return { type, id };
	});

	return { entries, isLastPage };
};
