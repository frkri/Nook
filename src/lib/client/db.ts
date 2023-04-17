import { browser } from '$app/environment';
import { openDB, type DBSchema } from 'idb';

interface NookDB extends DBSchema {
	entries: {
		key: string; // ID
		value: {
			name: string;
			icon: string;
			kind: 'directory' | 'file';
			id?: string;
			created?: number;
			modified?: number;
			parent?: string;
		};
		indexes: { 'by-name': string };
	};
}

async function initDB(dbName: string, dbVersion: number) {
	if (!browser) return;

	const db = await openDB<NookDB>(dbName, dbVersion, {
		upgrade(db) {
			const store = db.createObjectStore('entries', {
				keyPath: 'id',
				autoIncrement: false // Using UUIDs
			});
			store.createIndex('by-name', 'name');
		}
	});

	console.log(`IndexedDB open: ${db.name} v${db.version}`);
	return db;
}

export const db = (await initDB('Nook', 1)) || (null as never);
