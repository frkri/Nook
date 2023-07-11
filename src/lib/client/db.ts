import type { EntryData } from '$lib/types';

import { browser, building } from '$app/environment';
import { error } from '@sveltejs/kit';
import { openDB, type DBSchema } from 'idb';

interface NookDB extends DBSchema {
	entries: {
		key: string;
		value: EntryData;
		indexes: { 'name-index': string };
	};
}

async function initDB(dbName: string, dbVersion: number) {
	if (building || !browser) return;
	const db = await openDB<NookDB>(dbName, dbVersion, {
		upgrade(db) {
			const store = db.createObjectStore('entries', {
				keyPath: 'id',
				autoIncrement: false
			});
			store.createIndex('name-index', 'name');
		}
	});

	console.log(`IndexedDB open: ${db.name} v${db.version}`);
	return db;
}

// Dirty hack, but it works ¯\_(ツ)_/¯
export const db = (await initDB('Nook', 1)) || (null as never);
