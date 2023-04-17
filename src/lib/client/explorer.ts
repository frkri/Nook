// Using @types/wicg-file-system-access for FileSystem API types support

import { db } from '$lib/client/db';
import { getMapEntryByName, walkDirectory } from './utils';

// Simple Key-Value cache for entries
// ID - Entry Object
const entryCache = new Map<string, Entry>();

export interface Entry {
	name: string;
	icon: string;
	kind: 'directory' | 'file';
	id?: string;
	created?: number;
	modified?: number;
	parent?: string;
}

enum EntryType {
	Directory = 'directory',
	File = 'file'
}

export interface EntryData {
	id: string; // UUID
	icon: string; // Image URL
	name: string;
	created: number; // Timestamp
	modified: number; // Timestamp
	type: EntryType;
	handle: FileSystemDirectoryHandle | FileSystemFileHandle;
}

/**
 * Get multiple entries from the database using IDs
 * @param ids
 * @returns Array with resolved Entries, or null if not found
 */
export async function getEntriesByID(ids: string[]): Promise<(Entry | null)[]> {
	// Open new transaction
	const tx = db.transaction('entries', 'readonly');

	// For each ID, check the cache first, then the database
	// If it's not in either, return null
	const entries = await Promise.all(
		ids.map(async (id) => {
			// Check cache first
			const cachedEntry = entryCache.get(id);

			if (cachedEntry) {
				console.debug('Cache hit for', id);
				return cachedEntry;
			} else {
				// If not in cache, fetch from database & add to cache
				console.debug('Cache miss for', id);
				const entry = await tx.store.get(id);
				if (entry) {
					entryCache.set(id, entry);
					return entry;
				}
			}

			return null;
		})
	);

	// Filter out any entries that weren't in the database
	//return entries.filter((entry) => entry !== undefined) as Entry[];
	tx.commit();
	return entries;
}

export async function getEntriesByName(names: string[]): Promise<(Entry | null)[]> {
	// Open new transaction
	const tx = db.transaction('entries', 'readonly');
	const index = tx.store.index('by-name');

	// For each name, check the cache first, then the database
	// If it's not in either, return null
	const entries = await Promise.all(
		names.map(async (name) => {
			// Check cache first
			const cachedEntry = await getMapEntryByName(entryCache, name);

			if (cachedEntry) {
				console.debug('Cache hit for', name);

				return cachedEntry;
			} else {
				// If not in cache, fetch from database & add to cache
				console.debug('Cache miss for', name);

				const entry = await index.get(name);
				if (entry && entry.id) {
					entryCache.set(entry.id, entry);
					return entry;
				}

				return null;
			}
		})
	);

	return entries;
}

export async function getEntryByID(id: string): Promise<Entry | null> {
	// Check cache first
	const cachedEntry = entryCache.get(id);
	if (cachedEntry) {
		console.debug('Cache hit for', id);
		return cachedEntry;
	}

	// If not in cache, fetch from database and add to cache
	const entry = await db.get('entries', id);
	if (entry) {
		console.debug('Cache miss for', id);
		entryCache.set(id, entry);
		return entry;
	}

	return null;
}

export async function getEntryByName(name: string): Promise<Entry | null> {
	// Check cache first
	const cachedEntry = Array.from(entryCache.values()).find((entry) => entry.name === name);
	if (cachedEntry) {
		console.debug('Cache hit for', name);
		return cachedEntry;
	}

	// If not in cache, fetch from database and add to cache
	const entry = await db.getFromIndex('entries', 'by-name', name);
	if (entry?.id !== undefined) {
		console.debug('Cache miss for', name);
		entryCache.set(entry.id, entry);

		return entry;
	}

	return null;
}

export async function getEntryHandle(id?: string): Promise<FileSystemDirectoryHandle | undefined> {
	const dirHandle = await navigator.storage.getDirectory();

	// If no ID or "root" is provided, return root directory handle
	if (!id || id === '' || id === 'root') return dirHandle;

	const reqDirHandle = await walkDirectory(dirHandle, id);

	return reqDirHandle;
}

// Returns an array of resolved names from IDs
export async function resolvePathFromIDs(IDs: string[]): Promise<string[]> {
	const resolvedPath: string[] = [];

	for await (const id of IDs) {
		const entry = await getEntryByID(id);
		if (entry === null) continue;

		resolvedPath.push(entry.name);
	}

	return resolvedPath;
}

export async function resolveIDsFromPath(Path: string[]): Promise<string[]> {
	const resolvedIDs: string[] = [];

	for await (const name of Path) {
		const entry = await getEntryByName(name);
		if (entry?.id === undefined) continue;

		resolvedIDs.push(entry.id);
	}

	return resolvedIDs;
}

export async function createEntry(
	newEntry: Entry = {
		name: 'New Entry',
		icon: '📂',
		kind: 'directory'
	},
	currentDirHandle?: FileSystemDirectoryHandle
): Promise<FileSystemDirectoryHandle | FileSystemFileHandle> {
	// Error out if the entry already exists
	// Push message to svelte component to add entry to UI.

	if (!currentDirHandle) currentDirHandle = await navigator.storage.getDirectory();

	// Set default values
	newEntry.created = Date.now();
	newEntry.modified = Date.now();
	newEntry.parent = currentDirHandle.name;
	newEntry.id = crypto.randomUUID();

	let newEntryHandle: FileSystemDirectoryHandle | FileSystemFileHandle;

	// Add entry to database only if it doesn't exist
	await db.add('entries', newEntry);

	if (newEntry.kind === 'directory') {
		newEntryHandle = await currentDirHandle.getDirectoryHandle(newEntry.id, { create: true });
	} else {
		newEntryHandle = await currentDirHandle.getFileHandle(newEntry.id, { create: true });
	}

	console.log('Created new entry: ' + newEntry.name + ' with ID: ' + newEntry.id);

	return newEntryHandle;
}

// Removes Entry using its ID, if currentDirHandle is provided, it won't search for the entry
export async function removeEntryByID(id: string, currentDirHandle?: FileSystemDirectoryHandle) {
	console.log('Removing entry with ID: ' + id);

	// Remove entry from cache
	entryCache.delete(id);

	// Remove entry from database
	db.delete('entries', id);

	// Remove entry from file system
	if (currentDirHandle) {
		await currentDirHandle.removeEntry(id, { recursive: true });
	} else {
		await getEntryHandle(id).then((entryHandle) => {
			entryHandle?.removeEntry(id, { recursive: true });
		});
	}
}
