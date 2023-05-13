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
export async function downloadFile(name: string, extension: string, type: string, data: string) {
	const blob = new Blob([data], { type });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = `${name}.${extension}`;

	link.click();

	// Cleanup
	URL.revokeObjectURL(url);
	link.remove();
}
