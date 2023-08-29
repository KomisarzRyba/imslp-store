import { Response } from 'express';

export const initStream = (res: Response) => {
	if (!res) return;

	res.set({
		'Cache-Control': 'no-cache',
		'Content-Type': 'text/event-stream; charset=utf-8',
		Connection: 'keep-alive',
		'X-Accel-Buffering': 'no',
	});
	res.flushHeaders();
	console.log('Client connected');

	res.on('close', () => {
		console.log('Client disconnected');
		res.end();
	});
};
