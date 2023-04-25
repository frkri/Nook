import { writable } from 'svelte/store';

/**
 * Creates a Store for display of Items that also writes to localStorage
 * NOTE: LocalStorage only stores strings, meaning we need to convert the bool to string!
 */
export const viewTypeList = writable<boolean>(
	localStorage.getItem('prefers-viewTypeList-grid') === 'true'
);

/**
 * Creates a Store for display of Editor view that also writes to localStorage
 * NOTE: LocalStorage only stores strings, meaning we need to convert the bool to string!
 */
export const viewTypeEditor = writable<boolean>(
	localStorage.getItem('prefers-viewTypeEditor-Edit') === 'true'
);

// On update, write to localStorage
viewTypeList.subscribe((value) => {
	localStorage.setItem('prefers-viewTypeList-grid', value.toString());
});

viewTypeEditor.subscribe((value) => {
	localStorage.setItem('prefers-viewTypeEditor-Edit', value.toString());
});
