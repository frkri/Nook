<script lang="ts">
	import { page } from '$app/stores';
	import Nav from '$lib/components/nav/Nav.svelte';
	import { currentPath } from '$lib/store/currentPath';

	// Sets the current path from page params
	$: currentPath.setPathFromID($page.params.path.split('/') || ['']);

	//$: console.log($currentPath.pathData, $page.params.path.split('/'));
</script>

<svelte:head>
	<title>{$currentPath.currentDirID} - Explorer</title>
</svelte:head>

<Nav />
<slot />
