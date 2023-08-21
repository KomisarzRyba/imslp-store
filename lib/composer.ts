import { z } from 'zod';

export const fetchedComposerSchema = z.object({
	id: z.string(),
	type: z.literal('1'),
	parent: z.literal(''),
	intvals: z.array(z.never()),
	permlink: z.string(),
});
export type FetchedComposer = z.infer<typeof fetchedComposerSchema>;
