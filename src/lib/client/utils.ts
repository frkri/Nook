// Using @types/wicg-file-system-access for FileSystem API types support

import type { Entry } from './explorer';

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
	map: Map<string, Entry>,
	value: string
): Promise<Entry | undefined> {
	for (const [, v] of map.entries()) {
		if (v.name === value) return v;
	}

	return undefined;
}
