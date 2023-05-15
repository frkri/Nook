import { writable } from 'svelte/store';

/**
 * Creates a Store for storage of recent Notes by its ID
 * NOTE: LocalStorage only stores strings, meaning we need to convert the bool to string!
 */
export const recentNotes = writable<string[]>(
	JSON.parse(localStorage.getItem('recentNotes') || '[]')
);

// On update, write to localStorage
recentNotes.subscribe((value) => {
	localStorage.setItem('recentNotes', JSON.stringify(value));
});
