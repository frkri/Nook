import snarkdown from 'snarkdown';
import { getFileEntryHandle, readEntryContents } from './explorer';

const linkRegex = new RegExp('src="(.*?)"', 'g');
/**
 * Uses snarkdown with some other customizations to parse markdown
 * @param markdown string to parse
 * @returns string with HTML tags
 */
export async function parseMarkdown(md: string) {
	// Initial pass with snarkdown
	md = snarkdown(md);

	// Replace URLs that link to local files
	// Example: ![example image](/850afff0-a045-4bd7-af34-bc412d2bbfd5/02ad896a-84ec-40dd-922f-ecc472153ef7/) -> converted to use Blob URL
	md = await replaceAsync(md, linkRegex, async (match: string, p1: string) => {
		// Check if the URL is a local file
		if (p1.startsWith('https://')) return match;
		const entryContents = await getEntryContent(p1);
		return `src="${entryContents}"`;
	});

	return md;
}

async function getEntryContent(path: string) {
	const items = path.split('/');
	const entryID = items[items.length - 1];

	const entryHandle = await getFileEntryHandle(entryID);
	if (entryHandle === undefined) return '';

	const entryContents = await readEntryContents(entryHandle);
	return entryContents;
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
