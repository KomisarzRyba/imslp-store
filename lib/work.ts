import { z } from 'zod';

export const fetchedWorkSchema = z.object({
	id: z.string(),
	type: z.literal('2'),
	parent: z.string(),
	intvals: z.object({
		composer: z.string(),
		worktitle: z.string(),
		icatno: z.string().optional(),
		pageid: z.string().optional(),
	}),
	permlink: z.string(),
});
export type FetchedWork = z.infer<typeof fetchedWorkSchema>;
