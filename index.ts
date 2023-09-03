import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { fetchAllComposers, fetchAllWorks } from './lib/fetcher';
import {
	pushAllComposersMultithreaded,
	pushAllWorksMultithreaded,
} from './lib/pusher';
import { saveToJSON } from './lib/utils/save-file';

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
		const pushed = await pushAllComposersMultithreaded();
		return res.send(pushed + ' composers pushed').status(200);
	} catch (error) {
		console.log(error);
		return res.send(error).status(500);
	}
});

app.get('/push/works', async (req: Request, res: Response) => {
	try {
		const pushed = await pushAllWorksMultithreaded();
		return res.send(pushed + ' works pushed').status(200);
	} catch (error) {
		console.log(error);
		return res.send(error).status(500);
	}
});
