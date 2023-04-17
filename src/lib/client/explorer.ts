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
const handleCache = new Map<string, FileSystemHandleUnion>();

/**
 * Get multiple entries from the database using IDs
 * @param ids
 * @returns Array with resolved Entries, or null if not found
 */
export async function getEntriesByID(ids: string[]): Promise<EntryData[]> {
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
	// Filter out null entries
	return entries.filter((entry) => entry !== null) as EntryData[];
}

/**
 * Get multiple entries from the database using names
 * @param names
 * @returns Array with resolved Entries, or null if not found
 */
export async function getEntriesByName(names: string[]): Promise<EntryData[]> {
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
	// Filter out null entries
	return entries.filter((entry) => entry !== null) as EntryData[];
}

/**
 * Creates multiple new Entries in the current directory
 * @param newEntry
 * @param currentDirHandle
 * @returns The created entry
 */
export async function createEntries(
	newEntries: EntryDataBasic[],
	currentDirHandle?: FileSystemDirectoryHandle
) {
	// Get root directory handle if not provided
	if (!currentDirHandle) currentDirHandle = await navigator.storage.getDirectory();

	// Open new transaction
	const tx = db.transaction('entries', 'readwrite');

	for await (const newEntry of newEntries) {
		const entry: EntryData = {
			id: crypto.randomUUID(),
			created: Date.now(),
			modified: Date.now(),
			...newEntry
		};

		// Add entry to database, throw error if it already exists (shouldn't happen with UUIDs)
		if ((await tx.store.add(entry)) === undefined)
			throw new Error(`Entry "${entry.id}" already exists`);

		// Add entry to cache
		entryCache.set(entry.id, entry);

		// Add entry to current directory & add to cache
		const handle = await currentDirHandle.getDirectoryHandle(entry.id, { create: true });
		handleCache.set(entry.id, handle);
	}

	tx.commit();
}

export async function getEntryHandle(
	id: string,
	currentDirHandle?: FileSystemDirectoryHandle
): Promise<FileSystemDirectoryHandle | FileSystemFileHandle | undefined> {
	// Get root directory handle if not provided
	if (currentDirHandle == undefined) currentDirHandle = await navigator.storage.getDirectory();

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
