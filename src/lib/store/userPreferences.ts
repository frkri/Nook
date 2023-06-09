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
 */
export const editorViewPreview = writable<boolean>(
	localStorage.getItem('prefers-editorViewPreview') === 'true'
);
editorViewPreview.subscribe((value) => {
	localStorage.setItem('prefers-editorViewPreview', value.toString());
});

/*
 * Creates a Store for auto saving of Editor Files that also writes to localStorage
 */
export const autoSaveEditor = writable<boolean>(
	localStorage.getItem('prefers-autoSaveEditor') === 'true'
);
autoSaveEditor.subscribe((value) => {
	localStorage.setItem('prefers-autoSaveEditor', value.toString());
});

/*
 * Creates a Store for delay of auto saving Editor Files that also writes to localStorage
 */
export const autoSaveDelay = writable<number>(Number(localStorage.getItem('autoSaveDelay')) || 800);
autoSaveDelay.subscribe((value) => {
	localStorage.setItem('autoSaveDelay', value.toString());
});

/*
 * Creates a Store for delay of auto saving Editor Files that also writes to localStorage
 */
export const autoBroadcastState = writable<boolean>(
	localStorage.getItem('autoBroadcastState') === 'true'
);
autoBroadcastState.subscribe((value) => {
	localStorage.setItem('autoBroadcastState', value.toString());
});

/*
 * Creates a Store for enabling/disabling hotkeys
 */
export const hotkeysEnabled = writable<boolean>(localStorage.getItem('hotkeysEnabled') === 'true');
hotkeysEnabled.subscribe((value) => {
	localStorage.setItem('hotkeysEnabled', value.toString());
});
