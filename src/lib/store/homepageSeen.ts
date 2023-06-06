import { writable } from 'svelte/store';

export const homepageSeen = writable<boolean>(localStorage.getItem('homepageSeen') === 'true');

homepageSeen.subscribe((value) => {
	localStorage.setItem('homepageSeen', value.toString());
});
