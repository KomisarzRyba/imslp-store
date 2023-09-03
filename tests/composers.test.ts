import { FetchedComposer } from '../lib/composer';
import { getComposerID, getNewComposer } from '../lib/pusher';
import { fetchedComposerSchema } from '../lib/composer';
import { array as zArray } from 'zod';
import fs from 'fs';

test('get NewComposer from Composer', () => {
	const fetchedComposer: FetchedComposer = {
		id: 'Category:Adams, John',
		intvals: [],
		parent: '',
		permlink: '',
		type: '1',
	};
	const newComposer = getNewComposer(fetchedComposer);
	expect(newComposer).toEqual({
		cId: 'Adams,_John',
		lastName: 'Adams',
		firstName: 'John',
	});

	const fetchedComposer2: FetchedComposer = {
		id: 'Category:Bach, Johann Sebastian',
		intvals: [],
		parent: '',
		permlink: '',
		type: '1',
	};
	const newComposer2 = getNewComposer(fetchedComposer2);
	expect(newComposer2).toEqual({
		cId: 'Bach,_Johann_Sebastian',
		lastName: 'Bach',
		firstName: 'Johann Sebastian',
	});
});

test('get ComposerID from composerName', () => {
	const composerName = 'Adams, John';
	const composerID = getComposerID(composerName);
	expect(composerID).toEqual('Adams,_John');

	const composerName2 = 'Bach, Johann Sebastian';
	const composerID2 = getComposerID(composerName2);
	expect(composerID2).toEqual('Bach,_Johann_Sebastian');
});

test('all composers were pushed to db', () => {
	const rawComposers = fs.readFileSync('./data/composers.json', 'utf-8');
	const fetchedComposers = zArray(fetchedComposerSchema).parse(
		JSON.parse(rawComposers)
	);
	const lastPushed = fs.readFileSync('./data/c-pushed.txt', 'utf-8');
	expect(fetchedComposers.length).toEqual(parseInt(lastPushed));
});
