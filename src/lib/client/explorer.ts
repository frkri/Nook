// Using @types/wicg-file-system-access for FileSystem API types support
import type { EntryData, EntryDataBasic, EntryType, Export } from '$lib/types';

import { db } from '$lib/client/db';
import {
	createBase64FromBuffer,
	createBufferFromBase64,
	getMapEntryByName,
	iterToArray,
	walkDirectory
} from './utils';

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
 * @param IDs
 * @returns Array with Entries, or null if not found
 */
export async function getEntriesByID(ids: string[]): Promise<(EntryData | null)[]> {
	// Open new transaction
	const tx = db.transaction('entries', 'readonly');

	// For each ID, check the cache first, then the database
	// If it's not in either, return null
	const entries = await Promise.all(
		ids.map(async (id) => {
			if (id === 'root' || id === '') return null;

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
 * @param Names
 * @returns Array with resolved Entries, or null if not found
 */
export async function getEntriesByName(entriesNames: string[]): Promise<(EntryData | null)[]> {
	// Open new transaction
	const tx = db.transaction('entries', 'readonly');
	const index = tx.store.index('name-index');

	// For each name, check the cache first, then the database
	// If it's not in either, return null
	const entries = await Promise.all(
		entriesNames.map(async (entryName) => {
			// Check cache for entry
			let entry = await getMapEntryByName(entryCache, entryName);

			if (entry) {
				console.debug('Cache hit for', entryName);
				return entry;
			} else {
				console.debug('Cache miss for', entryName);
				entry = await index.get(entryName);
				if (entry) {
					entryCache.set(entry.id, entry);
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
 * @param IDs
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
	currentDirHandle?: FileSystemDirectoryHandle,
	contents?: (string | ArrayBuffer)[]
) {
	// Get root directory handle if not provided
	if (!currentDirHandle) currentDirHandle = await navigator.storage.getDirectory();
	console.log('Creating entries', newEntries, 'in', currentDirHandle);

	for await (const newEntry of newEntries) {
		const entry: EntryData = {
			id: crypto.randomUUID(),
			modified: Date.now(),
			description: '',
			...newEntry
		};

		// Open new transaction
		const tx = db.transaction('entries', 'readwrite');

		// Add entry to database, throw error if it already exists (shouldn't happen with UUIDs)
		if ((await tx.store.add(entry)) === undefined)
			throw new Error(`Entry "${entry.id}" already exists`);

		// Add entry to cache
		entryCache.set(entry.id, entry);

		// Add entry to current directory (& add to cache)
		if (entry.type === 'directory') {
			const handle = await currentDirHandle.getDirectoryHandle(entry.id, { create: true });
			handleCache.set(entry.id, handle);
		} else {
			const fileHandle = await currentDirHandle.getFileHandle(entry.id, { create: true });

			if (contents === undefined) return;

			const fileWriter = await fileHandle.createWritable();
			await fileWriter.write(contents[newEntries.indexOf(newEntry)]);
			await fileWriter.close();
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
	if (!dirHandle) return undefined;
	const fileHandle = await dirHandle?.getFileHandle(id);

	return fileHandle;
}

/**
 * Returns the contents of a file in String or ArrayBuffer format
 * @param fileHandle
 * @param fileType
 */
export async function readEntryContents(
	fileHandle: FileSystemFileHandle,
	fileType?: EntryType
): Promise<string | ArrayBuffer> {
	const file = await fileHandle.getFile();

	if (fileType === 'note') return await file.text();
	else return await file.arrayBuffer();
}

export async function writeEntryContents(
	fileHandle: FileSystemFileHandle,
	content: string | ArrayBuffer
): Promise<void> {
	const writable = await fileHandle.createWritable();

	// Remove all content from file
	writable.truncate(0);
	// Write new content to file
	await writable.write(content);
	await writable.close();

	// Update modified date
	updateEntry({
		id: fileHandle.name,
		modified: Date.now()
	});

	console.debug('Saved file: ' + fileHandle.name);
}

/**
 * Updates an entry in the database
 * @param entry EntryData object with required ID and other optional properties to update
 */
export async function updateEntry(entry: Partial<EntryData> & { id: string }): Promise<void> {
	const fullEntry = (await getEntriesByID([entry.id as string]))[0];
	if (!fullEntry) return;

	// Combine old entry with new entry, overwriting old properties
	Object.assign(fullEntry, entry);

	// Update entry
	db.put('entries', fullEntry);
	entryCache.set(fullEntry.id, fullEntry);
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

/**
 * Recursively exports an entry with its contents into a JSON object
 */
export async function exportEntry(parentHandle: FileSystemDirectoryHandle) {
	// Retrive info about parent, if root set id and name to root
	let parent: EntryData;

	if (parentHandle.name === '' || parentHandle.name === 'root') {
		parent = {
			id: 'root',
			name: 'root',
			icon: '',
			type: 'directory',
			modified: 0,
			description: ''
		};
	} else {
		const parentData = (await getEntriesByID([parentHandle.name]))[0];
		if (parentData === null) throw new Error('Parent entry not found');

		parent = parentData;
	}

	const exportData: Export = {
		...parent,
		children: []
	};
	if (exportData.children === undefined) return exportData;

	// Retrive info about children entries of parent
	const entriesIDs = await iterToArray(parentHandle.keys());
	const entries = (await getEntriesByID(entriesIDs)).filter((e) => e !== null) as EntryData[];

	for await (const entry of entries) {
		if (entry.type !== 'directory') {
			const childHandle = await parentHandle.getFileHandle(entry.id);
			let childData = await readEntryContents(childHandle, entry.type);
			if (entry.type != 'note') childData = await createBase64FromBuffer(childData as ArrayBuffer);

			exportData.children.push({
				...entry,
				content: childData as string
			});
		} else if (entry.type === 'directory') {
			const childData = await exportEntry(await parentHandle.getDirectoryHandle(entry.id));
			exportData.children.push(childData);
		}
	}

	return exportData;
}
/**
 * Recursively imports an entry with its contents into storage
 */
export async function importEntry(entries: Export, parentHandle?: FileSystemDirectoryHandle) {
	if (entries.id === 'root') {
		// Set new parentHandle to the parent directory of this entry
		parentHandle = await navigator.storage.getDirectory();
	} else {
		// Create the parent directory in the given parentHandle
		await createEntries([entries], parentHandle);
		// Set new parentHandle to the parent directory of newly created entry
		parentHandle = await getDirEntryHandle(entries.id, parentHandle);
	}

	if (entries.children === undefined) return;

	for await (const entry of entries.children) {
		console.log('Importing entry', entry, 'into', parentHandle);
		if (entry.type === 'directory') {
			// Will create the parent directory and then the children of that element
			importEntry(entry, parentHandle);
		} else {
			await createEntries([entry], parentHandle);
			const entryHandle = await getFileEntryHandle(entry.id, parentHandle);

			if (entryHandle === undefined) throw new Error('Failed to get file handle of entry');

			// Write to file if content is defined
			if (entry.content === undefined) return;

			let content: string | ArrayBuffer = entry.content;
			if (entry.type !== 'note') content = createBufferFromBase64(content);

			await writeEntryContents(entryHandle, content);
		}
	}
}
