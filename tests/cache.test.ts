import { getCache, perPage } from '../lib/search';

test('getCache returns correct number of results', async () => {
	const results = await getCache('bach', 1);
	console.log(results);
	expect(results.entries.length).toBe(perPage);
});

test('getCache returns results in correct order', async () => {
	const results = await getCache('bach', 1);
	expect(results.entries[0].id).toBe('Bach,_Johann_Sebastian');
});

test('getCache returns correct type', async () => {
	const results = await getCache('bach', 1);
	expect(results.entries[0].type).toBe('c');
});

test('getCache flags isLastPage correctly', async () => {
	const results1 = await getCache('bach', 1);
	expect(results1.isLastPage).toBe(false);
	const results2 = await getCache('bach', 2);
	expect(results2.isLastPage).toBe(true);
});
