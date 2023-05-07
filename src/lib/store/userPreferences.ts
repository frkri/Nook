import { writable } from 'svelte/store';

/**
 * Creates a Store for display of Items that also writes to localStorage
 * NOTE: LocalStorage only stores strings, meaning we need to convert the bool to string!
 */
export const viewTypeList = writable<boolean>(
	localStorage.getItem('prefers-viewTypeList-grid') === 'true'
);

// On update, write to localStorage
viewTypeList.subscribe((value) => {
	localStorage.setItem('prefers-viewTypeList-grid', value.toString());
});

/**
 * Creates a Store for display of Editor view that also writes to localStorage
 * NOTE: LocalStorage only stores strings, meaning we need to convert the bool to string!
 */
export const viewTypeEditor = writable<boolean>(
	localStorage.getItem('prefers-viewTypeEditor-Edit') === 'true'
);

viewTypeEditor.subscribe((value) => {
	localStorage.setItem('prefers-viewTypeEditor-Edit', value.toString());
});

/*
 * Creates a Store for auto saving of Editor Files that also writes to localStorage
 * NOTE: LocalStorage only stores strings, meaning we need to convert the bool to string!
 */
export const autoSaveEditor = writable<boolean>(
	localStorage.getItem('prefers-autoSaveEditor') === 'true'
);

autoSaveEditor.subscribe((value) => {
	localStorage.setItem('prefers-autoSaveEditor', value.toString());
});

/*
 * Creates a Store for delay of auto saving Editor Files that also writes to localStorage
 * NOTE: LocalStorage only stores strings, meaning we need to convert the bool to string!
 */
export const autoSaveDelay = writable<number>(Number(localStorage.getItem('autoSaveDelay')) || 400);

autoSaveDelay.subscribe((value) => {
	localStorage.setItem('autoSaveDelay', value.toString());
});
