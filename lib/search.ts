import db from './utils/db';

export type ComposerQueryParams = {
	q: string;
	count: number;
	page?: number;
	cache?: string[];
};

export const getComposers = async ({
	q,
	count,
	page,
	cache,
}: ComposerQueryParams) => {
	const composers = await db.composer.findMany({
		take: count,
		skip: count * ((page ?? 1) - 1),
		where: {
			OR: [
				{
					lastName: {
						startsWith: q,
						mode: 'insensitive',
					},
				},
				{
					firstName: {
						startsWith: q,
						mode: 'insensitive',
					},
				},
			],
			NOT: {
				AND: [
					{
						lastName: {
							in:
								cache?.map((c) =>
									c
										.slice(0, c.indexOf(',_'))
										.replace('_', ' ')
								) ?? [],
						},
					},
					{
						firstName: {
							in:
								cache?.map((c) =>
									c
										.slice(c.indexOf(',_') + 2)
										.replace('_', ' ')
								) ?? [],
						},
					},
				],
			},
			works: {
				some: {},
			},
		},
		orderBy: {
			works: {
				_count: 'desc',
			},
		},
	});

	console.log(cache);
	console.log(composers);
	return composers;
};
