<script lang="ts">
	import { page } from '$app/stores';
	import Nav from '$lib/components/nav/Nav.svelte';
	import { currentPath } from '$lib/store/currentPath';

	// Sets the current path from page params
	$: currentPath.setPathFromID($page.params.path.split('/'));
</script>

<svelte:head>
	<title>{$currentPath.pathData[$currentPath.pathData.length - 1].name} - Explorer</title>
</svelte:head>

<Nav />
<slot />
