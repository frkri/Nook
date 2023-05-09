<script lang="ts">
	import { page } from '$app/stores';
	import Nav from '$lib/components/nav/Nav.svelte';
	import { currentPath } from '$lib/store/currentPath';

	import '../app.css';

	// Sets the current path from page params
	$: dir = $page.params.path.split('/');
	$: currentPath.setPathFromID(dir[0] === '' ? ['root'] : dir);
</script>

<svelte:head>
	<title>{$currentPath.currentEntryName ?? 'Nook.'}</title>
</svelte:head>

<Nav />
<main class="mt-[65px] h-full">
	<slot />
</main>
