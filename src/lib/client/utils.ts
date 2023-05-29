// Using @types/wicg-file-system-access for FileSystem API types support
import type { EntryData } from '$lib/types';

/**
 * Walk the directory tree to get the directory handle of a directory or file using its name
 * @param startDirHandle
 * @param endEntryName
 * @returns The directory handle of the directory or file, or undefined if not found
 */
export async function walkDirectory(
	startDirHandle: FileSystemDirectoryHandle,
	endEntryName: string
): Promise<FileSystemDirectoryHandle | undefined> {
	// Get all entries for this Directory
	const entries = startDirHandle.values();

	for await (const entry of entries) {
		if (entry.name === endEntryName) {
			// Return the directory handle
			return entry.kind === 'directory' ? entry : startDirHandle;
		} else {
			if (entry.kind !== 'directory') continue;
			// Recursively call the function
			const dirHandle = await walkDirectory(entry, endEntryName);
			if (dirHandle) return dirHandle;
		}
	}
	// If the entry is not found, return undefined
	return undefined;
}

/**
 * Get entry in the map cache by its name
 * @param map
 * @param value
 * @returns The key of the entry in the map, or undefined if not found
 */
export async function getMapEntryByName(
	map: Map<string, EntryData>,
	value: string
): Promise<EntryData | undefined> {
	for (const [, v] of map.entries()) {
		if (v.name === value) return v;
	}

	return undefined;
}

/**
 * Convert an async iterable to an array
 * @param iter Async iterable
 * @returns Array of items found in the iterable
 */
export async function iterToArray<T>(iter: AsyncIterable<T>): Promise<T[]> {
	const arr: T[] = [];

	for await (const item of iter) {
		arr.push(item);
	}
	return arr;
}

/**
 * Download a file based on its name, extension, type and data
 * @param name
 * @param extension
 * @param type MIME type
 * @param data
 */
export async function downloadFile(
	name: string,
	extension: string,
	type: string,
	data: string | ArrayBuffer
) {
	let blob: Blob;
	if (type) blob = new Blob([data], { type });
	else blob = new Blob([data]);
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;

	if (!extension) link.download = `${name}`;
	else link.download = `${name}.${extension}`;

	link.click();

	// Cleanup
	URL.revokeObjectURL(url);
	link.remove();
}

/**
 * Fetch a remote file and return its content as a string
 * @param url of remote resource
 * @returns string content of the file
 */
export async function fetchRemoteFile(url: URL) {
	const response = await fetch(url);
	return await response.text();
}

export function createURLFromBuffer(arrayBuffer: ArrayBuffer) {
	const blob = new Blob([arrayBuffer]);
	const url = URL.createObjectURL(blob);

	return url;
}

export function createBase64FromBuffer(arrayBuffer: ArrayBuffer) {
	// See: https://stackoverflow.com/questions/15341912/how-to-go-from-blob-to-arraybuffer

	return new Promise<string>((resolve, reject) => {
		const blob = new Blob([arrayBuffer]);
		const reader = new FileReader();

		reader.onload = () => {
			resolve(reader.result as string);
		};

		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

export function createBufferFromBase64(base: string) {
	// See: https://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer

	// Decode the base64 string and convert it to a byte string
	const byteString = atob(base.split(',')[1]);
	// Create an ArrayBuffer with a length equal to the byte string's length
	const arrayBuffer = new ArrayBuffer(byteString.length);
	// Create a Uint8Array view of the ArrayBuffer
	const uint8Array = new Uint8Array(arrayBuffer);

	// Iterate over each character in the byte string
	for (let i = 0; i < byteString.length; i++) {
		// Convert the character to its char code and store it in the Uint8Array
		uint8Array[i] = byteString.charCodeAt(i);
	}

	return arrayBuffer;
}

/*
 * File type checkers
 * See: https://developer.mozilla.org/en-US/docs/Web/Media/Formats for list of formats
 */
export function isImage(filename: string): boolean {
	const imageExtensions = /\.(jpg|jpeg|png|webp|gif|avif|apng)$/i;
	return imageExtensions.test(filename);
}
export function isVideo(filename: string): boolean {
	const videoExtensions = /\.(mp4|webm|webm|mkv|avi)$/i;
	return videoExtensions.test(filename);
}
export function isAudio(filename: string): boolean {
	const audioExtensions = /\.(mp3|wav|ogg)$/i;
	return audioExtensions.test(filename);
}
export function isText(filename: string): boolean {
	const textExtensions = /\.(txt|md)$/i;
	return textExtensions.test(filename);
}
