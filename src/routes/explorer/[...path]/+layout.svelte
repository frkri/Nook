<script lang="ts">
	import { page } from '$app/stores';
	import Nav from '$lib/components/nav/Nav.svelte';
	import { currentPath } from '$lib/store/currentPath';

	// Sets the current path from page params
	$: currentPath.setPath($page.params.path || '');
</script>

<svelte:head>
	<title>{$currentPath.currentDirName} - Explorer</title>
</svelte:head>

<Nav />
<slot />
