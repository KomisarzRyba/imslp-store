import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import { fetchAllComposers, fetchAllWorks } from './lib/fetcher';
import { pushAllComposers, pushAllWorks } from './lib/pusher';
import { saveToJSON } from './lib/save-file';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

app.get('/', (req: Request, res: Response) => {
	res.send('Server Running');
});

app.get('/fetch/composers', async (req: Request, res: Response) => {
	try {
		const allComposers = await fetchAllComposers();
		if (!allComposers) throw new Error('No composers fetched');
		const saved = saveToJSON('./data/composers.json', allComposers);
		res.send(allComposers.length + ' composers fetched, saved: ' + saved);
	} catch (error) {
		console.log(error);
	}
});

app.get('/fetch/works', async (req: Request, res: Response) => {
	try {
		const allWorks = await fetchAllWorks();
		if (!allWorks) throw new Error('No works fetched');
		const saved = saveToJSON('./data/works.json', allWorks);
		res.send(allWorks.length + ' works fetched, saved: ' + saved);
	} catch (error) {
		console.log(error);
	}
});

app.get('/push/composers', async (req: Request, res: Response) => {
	try {
		const pushed = await pushAllComposers();
		res.send(pushed + ' composers pushed').status(200);
	} catch (error) {
		console.log(error);
		res.send(error).status(500);
	}
});

app.get('/push/works', async (req: Request, res: Response) => {
	try {
		const pushed = await pushAllWorks();
		res.send(pushed + ' works pushed').status(200);
	} catch (error) {
		console.log(error);
		res.send(error).status(500);
	}
});

app.get('/search', async (req: Request, res: Response) => {});
