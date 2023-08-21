import axios, { AxiosError } from 'axios';
import { ZodError, array as zArray } from 'zod';
import { FetchedComposer, fetchedComposerSchema } from './composer';
import { FetchedWork, fetchedWorkSchema } from './work';

type ResponseMetadata = {
	start: number;
	limit: number;
	sortby: string;
	sortdirection: string;
	moreresultsavailable: boolean;
	timestamp: number;
	apiversion: number;
};

export const fetchAllComposers = async (): Promise<
	FetchedComposer[] | undefined
> => {
	try {
		let moreResultsAvailable = true;
		let start = 0;
		let allComposers: FetchedComposer[] = [];
		while (moreResultsAvailable) {
			const { data } = await axios.get(
				`http://imslp.org/imslpscripts/API.ISCR.php?account=worklist/disclaimer=accepted/sort=id/type=1/start=${start}/retformat=json`
			);
			const composersData = Object.values(data);
			const metadata = composersData.pop() as ResponseMetadata;

			const composersFetched = zArray(fetchedComposerSchema).parse(
				composersData
			);

			allComposers.push(...composersFetched);
			console.log(allComposers.length);

			moreResultsAvailable = metadata.moreresultsavailable;
			start = metadata.start + metadata.limit;
		}
		return allComposers;
	} catch (error) {
		if (error instanceof ZodError) {
			console.log('Parsing error: ' + error.message);
		} else if (error instanceof AxiosError) {
			console.log('Fetch error: ' + error.message);
		} else {
			console.log(error);
		}
	}
};

export const fetchAllWorks = async (): Promise<FetchedWork[] | undefined> => {
	try {
		let moreResultsAvailable = true;
		let start = 0;
		let allWorks: FetchedWork[] = [];
		while (moreResultsAvailable) {
			const { data } = await axios.get(
				`http://imslp.org/imslpscripts/API.ISCR.php?account=worklist/disclaimer=accepted/sort=id/type=2/start=${start}/retformat=json`
			);
			const worksData = Object.values(data);
			const metadata = worksData.pop() as ResponseMetadata;

			const worksFetched = zArray(fetchedWorkSchema).parse(worksData);

			allWorks.push(...worksFetched);
			console.log(allWorks.length);

			moreResultsAvailable = metadata.moreresultsavailable;
			start = metadata.start + metadata.limit;
		}
		return allWorks;
	} catch (error) {
		if (error instanceof ZodError) {
			console.log('Parsing error: ' + error.message);
		} else if (error instanceof AxiosError) {
			console.log('Fetch error: ' + error.message);
		} else {
			console.log(error);
		}
	}
};
