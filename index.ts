import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import queryConfig from './config/query-config';
import { getCache } from './lib/cache';
import { fetchAllComposers, fetchAllWorks } from './lib/fetcher';
import { pushAllComposers, pushAllWorks } from './lib/pusher';
import { getComposers } from './lib/search';
import { saveToJSON } from './lib/utils/save-file';
import { initStream } from './lib/utils/stream-init';

const app: Express = express();
const port = process.env.PORT;

app.use(
	cors({
		origin: '*',
	})
);

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

app.get('/', (req: Request, res: Response) => {
	return res.send('Server Running');
});

app.get('/fetch/composers', async (req: Request, res: Response) => {
	try {
		const allComposers = await fetchAllComposers();
		if (!allComposers) throw new Error('No composers fetched');
		const saved = saveToJSON('./data/composers.json', allComposers);
		return res.send(
			allComposers.length + ' composers fetched, saved: ' + saved
		);
	} catch (error) {
		console.log(error);
		return res.send(error).status(500);
	}
});

app.get('/fetch/works', async (req: Request, res: Response) => {
	try {
		const allWorks = await fetchAllWorks();
		if (!allWorks) throw new Error('No works fetched');
		const saved = saveToJSON('./data/works.json', allWorks);
		return res.send(allWorks.length + ' works fetched, saved: ' + saved);
	} catch (error) {
		console.log(error);
		return res.send(error).status(500);
	}
});

app.get('/push/composers', async (req: Request, res: Response) => {
	try {
		const pushed = await pushAllComposers();
		return res.send(pushed + ' composers pushed').status(200);
	} catch (error) {
		console.log(error);
		return res.send(error).status(500);
	}
});

app.get('/push/works', async (req: Request, res: Response) => {
	try {
		const pushed = await pushAllWorks();
		return res.send(pushed + ' works pushed').status(200);
	} catch (error) {
		console.log(error);
		return res.send(error).status(500);
	}
});

app.get(
	'/search',
	async (
		req: Request<
			never,
			never,
			never,
			{ q: string; page?: string; perPage?: string }
		>,
		res: Response
	) => {
		const { q, page, perPage } = req.query;
		if (!q) return res.send('No query provided').status(400);

		initStream(res);

		const results = await getCache(q as string, parseInt(page as string));

		res.write('event: message\n');
		res.write('data: ' + JSON.stringify(results));
		res.write('\n\n');

		const remainingToFetch = perPage
			? parseInt(perPage) - results.length
			: queryConfig.composers.defaultPerPage - results.length;
		console.log(remainingToFetch);

		if (remainingToFetch > 0) {
			// get more results from db
			console.log('getting composers');
			const remaining = await getComposers({
				q,
				count: remainingToFetch,
				cache: results.map((r) => r.id),
			});
			res.write('event: message\n');
			res.write('data: ' + JSON.stringify(remaining));
			res.write('\n\n');
		}

		res.write('event: close\n');
		res.write('data: ' + JSON.stringify(Date.now()));
		res.write('\n\n');
	}
);
