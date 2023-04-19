import { writable } from 'svelte/store';
// Creates a Store that also writes to localStorage
// NOTE: LocalStorage only stores strings, meaning we need to convert the bool to string!
export const viewType = writable<boolean>(localStorage.getItem('prefers-viewType-grid') === 'true');

// On update, write to localStorage
viewType.subscribe((value) => {
	localStorage.setItem('prefers-viewType-grid', value.toString());
});
