import fs from 'fs';
import { array as zArray } from 'zod';
import { FetchedComposer, fetchedComposerSchema } from './composer';
import db from './utils/db';
import { FetchedWork, fetchedWorkSchema } from './work';
import { composers, works } from '../drizzle/schema';
import { Worker } from 'worker_threads';

const createPushWorker = (
	typeOfResource: 'composers' | 'works',
	batchToPush: NewComposer[] | NewWork[]
): Promise<number> =>
	new Promise((resolve, reject) => {
		const worker = new Worker(require.resolve('./push-worker'), {
			execArgv:
				process.env.NODE_ENV === 'development'
					? ['-r', 'ts-node/register/transpile-only']
					: undefined,
			workerData: { type: typeOfResource, batch: batchToPush },
		});
		worker.on('message', (data) => resolve(data));
		worker.on('error', (error) =>
			reject('An error ocurred: ' + error.message)
		);
	});

export type NewComposer = typeof composers.$inferInsert;
type Composer = typeof composers.$inferSelect;

export const getNewComposer = (composer: FetchedComposer): NewComposer => {
	const { id } = composer;
	const rawId = id.replace('Category:', '');

	const cId = rawId.replace(/ /g, '_');
	const [lastName, firstName] = rawId.split(', ');

	return {
		cId,
		lastName,
		firstName,
	};
};

export const getComposerID = (composerName: string): string =>
	composerName.replace(/ /g, '_');

export const pushAllComposersMultithreaded = async (): Promise<number> => {
	const rawComposers = fs.readFileSync('./data/composers.json', 'utf-8');
	const fetchedComposers = zArray(fetchedComposerSchema).parse(
		JSON.parse(rawComposers)
	);
	const newComposers: NewComposer[] = fetchedComposers.map((composer) =>
		getNewComposer(composer)
	);
	let totalPushed = 0;
	try {
		const workerPromises: ReturnType<typeof createPushWorker>[] = [];
		const batchSize =
			newComposers.length / parseInt(process.env.THREAD_COUNT!) || 8;
		for (let i = 0; i < newComposers.length; i += batchSize) {
			const batch = newComposers.slice(i, i + batchSize);
			workerPromises.push(createPushWorker('composers', batch));
		}
		const results = await Promise.all(workerPromises);
		totalPushed = results.reduce((acc, curr) => acc + curr, 0);
	} catch (error) {
		console.log(error);
	}
	try {
		fs.writeFileSync('./data/c-pushed.txt', totalPushed.toString(), {
			encoding: 'utf-8',
		});
	} catch (error) {
		console.log(error);
	}
	return totalPushed;
};

export const pushBatchComposers = async (
	batch: NewComposer[]
): Promise<number> => {
	try {
		const payload = await db.insert(composers).values(batch).returning();
		return payload.length;
	} catch (error) {
		console.log(error);
		return 0;
	}
};

const findOrphanedWorkIDs = (
	allComposers: Composer[],
	allWorks: FetchedWork[]
): Set<string> => {
	const composersSet = new Set<string>();
	allComposers.forEach((composer) => {
		composersSet.add(
			`Category:${composer.lastName}, ${composer.firstName}`
		);
	});

	const orphanedWorkIDs: string[] = allWorks.reduce((acc: string[], work) => {
		if (!composersSet.has(work.parent)) {
			acc.push(work.id);
		}
		return acc;
	}, []);

	return new Set(orphanedWorkIDs);
};

export type NewWork = typeof works.$inferInsert;

export const pushAllWorksMultithreaded = async (): Promise<number> => {
	const rawWorks = fs.readFileSync('./data/works.json', 'utf-8');
	const fetchedWorks = zArray(fetchedWorkSchema).parse(JSON.parse(rawWorks));
	const allComposers: Composer[] = await db.select().from(composers);
	const orphans = findOrphanedWorkIDs(allComposers, fetchedWorks);

	const newWorks: NewWork[] = fetchedWorks.reduce((acc: NewWork[], work) => {
		if (orphans.has(work.id)) {
			return acc;
		}
		const { worktitle, composer, pageid } = work.intvals;
		const cId = getComposerID(composer);
		const imslpId = pageid ? parseInt(pageid) : null;
		const workToPush: NewWork = {
			title: worktitle,
			cId,
			imslpId,
		};
		acc.push(workToPush);
		return acc;
	}, []);

	let totalPushed = 0;
	try {
		const workerPromises: ReturnType<typeof createPushWorker>[] = [];
		const batchSize =
			newWorks.length / parseInt(process.env.THREAD_COUNT!) || 8;
		for (let i = 0; i < newWorks.length; i += batchSize) {
			const batch = newWorks.slice(i, i + batchSize);
			workerPromises.push(createPushWorker('works', batch));
		}
		const results = await Promise.all(workerPromises);
		totalPushed = results.reduce((acc, curr) => acc + curr, 0);
	} catch (error) {
		console.log(error);
	}
	try {
		fs.writeFileSync('./data/w-pushed.txt', totalPushed.toString(), {
			encoding: 'utf-8',
		});
	} catch (error) {
		console.log(error);
	}
	return totalPushed;
};

export const pushBatchWorks = async (batch: NewWork[]): Promise<number> => {
	const payload = await db.insert(works).values(batch).returning();
	return payload.length;
};
