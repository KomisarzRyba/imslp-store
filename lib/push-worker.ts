import { register } from 'ts-node';
import { parentPort, workerData } from 'worker_threads';
import { pushBatchComposers, pushBatchWorks } from './pusher';

register();
const { type, batch } = workerData;
switch (type) {
	case 'composers':
		pushBatchComposers(batch).then((count) =>
			parentPort?.postMessage(count)
		);
		break;
	case 'works':
		pushBatchWorks(batch).then((count) => parentPort?.postMessage(count));
		break;
	default:
		throw new Error('Invalid type of resource');
}
