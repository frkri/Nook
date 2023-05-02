// Using @types/wicg-file-system-access for FileSystem API types support
import { db } from '$lib/client/db';
import { getMapEntryByName, walkDirectory } from '../client/utils';

/**
 * Key-Value cache for entries
 */
const entryCache = new Map<string, EntryData>();

/**
 * Key-Value cache for handles
 */
const handleCache = new Map<string, FileSystemDirectoryHandle>();

/**
 * Get multiple entries from the database using IDs
 * @param ids
 * @returns Array with Entries, or null if not found
 */
export async function getEntriesByID(ids: string[]): Promise<(EntryData | null)[]> {
	// Open new transaction
	const tx = db.transaction('entries', 'readonly');

	// For each ID, check the cache first, then the database
	// If it's not in either, return null
	const entries = await Promise.all(
		ids.map(async (id) => {
			// Check cache for entry
			let entry = entryCache.get(id);

			if (entry) {
				console.debug('Cache hit for', id);
				return entry;
			} else {
				// If not in cache, fetch from database & add to cache
				console.debug('Cache miss for', id);

				entry = await tx.store.get(id);
				if (entry) {
					entryCache.set(id, entry);
					return entry;
				}

				// If not in database, return null
				return null;
			}
		})
	);

	tx.commit();
	return entries;
}

/**
 * Get multiple entries from the database using names
 * @param names
 * @returns Array with resolved Entries, or null if not found
 */
export async function getEntriesByName(names: string[]): Promise<(EntryData | null)[]> {
	// Open new transaction
	const tx = db.transaction('entries', 'readonly');
	const index = tx.store.index('name-index');

	// For each name, check the cache first, then the database
	// If it's not in either, return null
	const entries = await Promise.all(
		names.map(async (name) => {
			// Check cache for entry
			let entry = await getMapEntryByName(entryCache, name);

			if (entry) {
				console.debug('Cache hit for', name);
				return entry;
			} else {
				// If not in cache, fetch from database & add to cache
				console.debug('Cache miss for', name);

				entry = await index.get(name);
				if (entry) {
					entryCache.set(name, entry);
					return entry;
				}

				// If not in database, return null
				return null;
			}
		})
	);

	tx.commit();
	return entries;
}

/**
 * Helper function to resolve entries using IDs
 * Meant to be used with a path array and to verify whether the path exists
 * @param Array of IDs
 * @returns Array of entries data until and excluding the first null entry
 */
export async function resolveEntriesByID(path: string[]): Promise<EntryData[]> {
	const entries = await getEntriesByID(path);
	const resolvedPath = entries.splice(
		0,
		entries.indexOf(null) === -1 ? entries.length : entries.indexOf(null)
	) as EntryData[];
	return resolvedPath;
}

/**
 * Helper function to resolve entries using names
 * Meant to be used with a path array and to verify whether the path exists
 * @param Array of IDs
 * @returns Array of entries data until and excluding the first null entry
 */
export async function resolveEntriesByName(path: string[]): Promise<EntryData[]> {
	const entries = await getEntriesByName(path);
	// Matches up to the first null entry
	const resolvedPath = entries.splice(
		0,
		entries.indexOf(null) === -1 ? entries.length : entries.indexOf(null)
	) as EntryData[];
	return resolvedPath;
}

/**
 * Creates multiple new Entries in the current directory
 * @param newEntries
 * @param currentDirHandle Stays Root if not provided
 * @returns The created entry
 */
export async function createEntries(
	newEntries: EntryDataBasic[],
	currentDirHandle?: FileSystemDirectoryHandle
) {
	// Get root directory handle if not provided
	if (!currentDirHandle) currentDirHandle = await navigator.storage.getDirectory();

	console.log('Creating entries', newEntries, 'in', currentDirHandle);

	// Open new transaction
	const tx = db.transaction('entries', 'readwrite');

	for await (const newEntry of newEntries) {
		const entry: EntryData = {
			id: crypto.randomUUID(),
			created: Date.now(),
			modified: Date.now(),
			description: '',
			...newEntry
		};

		// Add entry to database, throw error if it already exists (shouldn't happen with UUIDs)
		if ((await tx.store.add(entry)) === undefined)
			throw new Error(`Entry "${entry.id}" already exists`);

		// Add entry to cache
		entryCache.set(entry.id, entry);

		// Add entry to current directory (& add to cache)
		if (entry.type === 'directory') {
			const handle = await currentDirHandle.getDirectoryHandle(entry.id, { create: true });
			handleCache.set(entry.id, handle);
		} else if (entry.type === 'file') {
			await currentDirHandle.getFileHandle(entry.id, { create: true });
		}
	}

	return newEntries;
}

export async function getDirEntryHandle(
	id: string,
	currentDirHandle?: FileSystemDirectoryHandle
): Promise<FileSystemDirectoryHandle | undefined> {
	// Get root directory handle if not provided
	if (currentDirHandle === undefined) currentDirHandle = await navigator.storage.getDirectory();

	// Chrome and Firefox have different names for the root directory
	if (id === 'root' || id === '') return currentDirHandle;

	// Check cache for handle
	let handle = handleCache.get(id);

	if (handle) {
		console.debug('Cache hit for', id);
		return handle;
	} else {
		// If not in cache, fetch from directory & add to cache
		console.debug('Cache miss for', id);

		handle = await walkDirectory(currentDirHandle, id);
		if (handle) {
			handleCache.set(id, handle);
			return handle;
		}
	}

	return undefined;
}

export async function getFileEntryHandle(
	id: string,
	currentDirHandle?: FileSystemDirectoryHandle
): Promise<FileSystemFileHandle | undefined> {
	// Get root directory handle if not provided
	if (currentDirHandle === undefined) currentDirHandle = await navigator.storage.getDirectory();

	// Find parent directory of file
	const dirHandle = await walkDirectory(currentDirHandle, id);
	const fileHandle = await dirHandle?.getFileHandle(id);

	return fileHandle;
}

export async function readEntryContents(fileHandle: FileSystemFileHandle): Promise<string> {
	const file = await fileHandle.getFile();

	return await file.text();
}

export async function writeEntryContents(
	fileHandle: FileSystemFileHandle,
	content: string
): Promise<void> {
	const writable = await fileHandle.createWritable();
	await writable.write(content);
	await writable.close();

	console.debug('Saved file: ' + fileHandle.name);
}

/**
 * Removes multiple entries by IDs from the current directory
 * @param ids Array of IDs
 * @param currentDirHandle Root if not provided
 */
export async function removeEntries(
	ids: string[],
	currentDirHandle?: FileSystemDirectoryHandle
): Promise<void> {
	// Get root directory handle if not provided
	if (!currentDirHandle)
		currentDirHandle = (await navigator.storage.getDirectory()) as FileSystemDirectoryHandle;

	// Open new transaction
	const tx = db.transaction('entries', 'readwrite');

	for await (const id of ids) {
		// Remove entry from cache
		entryCache.delete(id);

		// Remove entry from database
		await tx.store.delete(id);

		// Remove entry from current directory & remove from cache
		const handle = await walkDirectory(currentDirHandle, id);
		if (handle) {
			await handle.removeEntry(id, { recursive: true });
			handleCache.delete(id);
		}
	}
}
