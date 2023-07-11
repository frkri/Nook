import snarkdown from 'snarkdown';
import { getEntriesByID, getFileEntryHandle, readEntryContents } from './explorer';
import { createURLFromBuffer } from './utils';

const linkRegex = new RegExp('src="(.*?)"', 'g');

/**
 * Uses snarkdown with some other customizations to parse markdown
 * @param str string to parse
 * @returns HTML string
 */
export async function parseMarkdown(str: string) {
	// Initial pass with snarkdown
	str = snarkdown(str);

	// Replace URLs that link to local files
	// Example: ![example image](/850afff0-a045-4bd7-af34-bc412d2bbfd5/02ad896a-84ec-40dd-922f-ecc472153ef7/) -> converted to use Blob URL
	str = await replaceAsync(str, linkRegex, async (match: string, p1: string) => {
		// Check if the URL is a local file
		if (p1.startsWith('https://')) return match;
		const entryContents = await getEntryContent(p1);
		if (entryContents === null) return match;
		return `src="${entryContents}"`;
	});

	return str;
}

async function getEntryContent(path: string) {
	const items = path.split('/');
	const entryID = items[items.length - 1];

	const entry = (await getEntriesByID([entryID]))[0];
	if (entry === null) return null;

	const entryHandle = await getFileEntryHandle(entryID);
	if (entryHandle === undefined) return null;

	const entryContents = await readEntryContents(entryHandle);

	if (entry.type == 'note') return entryContents;
	else return createURLFromBuffer(entryContents as ArrayBuffer);
}

// See: https://stackoverflow.com/questions/33631041/javascript-async-await-in-replace
// This isn't the most efficient way to do this
async function replaceAsync(
	str: string,
	regex: RegExp,
	asyncFn: (...args: string[]) => Promise<string>
): Promise<string> {
	const promises: Promise<string>[] = [];
	str.replace(regex, (match: string, ...args: string[]) => {
		const promise = asyncFn(match, ...args);
		promises.push(promise);
		return match;
	});
	const data: string[] = await Promise.all(promises);
	return str.replace(regex, () => data.shift() || '');
}
