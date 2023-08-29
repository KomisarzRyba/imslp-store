import redis from './utils/redis';

//redis cache - sorted set, content format : c:LastName,_FirstName (composer) or w:WorkTitle (work)

export type CacheResults = { type: 'c' | 'w'; id: string }[];

export const getCache = async (
	query: string,
	page: number = 1
): Promise<CacheResults> => {
	const cacheResults: string[] = await redis.zrange(query, page - 1, -1, {
		rev: true,
	});

	return cacheResults.map((result) => {
		const [typeStr, id] = result.split(':');
		const type = typeStr as 'c' | 'w';
		return { type, id };
	});
};
