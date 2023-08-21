import fs from 'fs';

export const saveToJSON = (path: string, data: Object): boolean => {
	try {
		fs.writeFileSync(path, JSON.stringify(data), { encoding: 'utf-8' });
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
};
