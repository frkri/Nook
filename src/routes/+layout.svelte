<script lang="ts">
	import { page } from '$app/stores';
	import Nav from '$lib/components/nav/Nav.svelte';
	import { currentPath } from '$lib/store/currentPath';
	import { onMount } from 'svelte';

	import '../app.css';

	// Sets the current path from page params
	$: currentPath.setPathFromID($page.params.path?.split('/') ?? ['root']);

	// Ask for permanent storage permission if not granted
	onMount(() => {
		navigator.storage.persisted().then((persisted) => {
			if (!persisted) {
				navigator.storage.persist().then((granted) => {
					if (granted) {
						console.debug('Storage granted');
					} else {
						console.debug('Storage denied');
					}
				});
			}
		});
	});
</script>

<svelte:head>
	<title>{$currentPath.currentEntryName === '' ? 'Nook.' : $currentPath.currentEntryName}</title>
</svelte:head>

<Nav />
<main class="mt-[65px]">
	<slot />
</main>
