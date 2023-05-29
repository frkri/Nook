import { writable } from 'svelte/store';

/**
 * Creates a Store for storage of recently accessed Files by its ID
 * NOTE: LocalStorage only stores strings, meaning we need to convert the bool to string!
 */
export const recentFiles = writable<string[]>(
	JSON.parse(localStorage.getItem('recentFiles') || '[]')
);

// On update, write to localStorage
recentFiles.subscribe((value) => {
	localStorage.setItem('recentFiles', JSON.stringify(value));
});
