import { Work } from '@prisma/client';
import fs from 'fs';
import { array as zArray } from 'zod';
import { FetchedComposer, fetchedComposerSchema } from './composer';
import db from './db';
import { FetchedWork, fetchedWorkSchema } from './work';
import { Prisma } from '@prisma/client';

type Composer = {
	lastName: string;
	firstName: string;
	// works: string[];
};

export const pushAllComposers = async (): Promise<number> => {
	const rawComposers = fs.readFileSync('./data/composers.json', 'utf-8');
	const fetchedComposers = zArray(fetchedComposerSchema).parse(
		JSON.parse(rawComposers)
	);

	const composers: Composer[] = fetchedComposers.map((composer) => {
		let [lastName, firstName] = composer.id
			.replace(/Category:|,/, '')
			.split(', ');
		firstName = firstName ?? 'unknown';

		return {
			lastName,
			firstName,
		};
	});

	const payload = await db.composer.createMany({
		data: composers,
		skipDuplicates: true,
	});

	return payload.count;
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

export const pushAllWorks = async (): Promise<number> => {
	const rawWorks = fs.readFileSync('./data/works.json', 'utf-8');
	const fetchedWorks = zArray(fetchedWorkSchema).parse(JSON.parse(rawWorks));
	const allComposers: Composer[] = await db.composer.findMany();
	const orphans = findOrphanedWorkIDs(allComposers, fetchedWorks);

	const works: Prisma.WorkCreateManyInput[] = fetchedWorks.reduce(
		(acc: Prisma.WorkCreateManyInput[], work) => {
			if (orphans.has(work.id)) {
				return acc;
			}
			const { worktitle, composer, pageid } = work.intvals;
			const [cLastName, cFirstName] = composer.split(', ');
			const imslpID = pageid ? parseInt(pageid) : null;
			const workToPush: Prisma.WorkCreateManyInput = {
				title: worktitle,
				cLastName,
				cFirstName,
				imslpID,
			};
			acc.push(workToPush);
			return acc;
		},
		[]
	);

	try {
		const payload = await db.work.createMany({
			data: works,
			skipDuplicates: true,
		});

		return payload.count;
	} catch (error) {
		console.log(error);
		return 0;
	}
};
