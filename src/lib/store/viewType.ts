import { writable } from 'svelte/store';

// Create a Store that also writes to localStorage
// NOTE: LocalStorage only stores strings!
export const viewType = writable<boolean>(localStorage.getItem('prefers-viewType') === 'true');

// On update, write to localStorage
viewType.subscribe((value) => {
	localStorage.setItem('prefers-viewType', value.toString());
});
