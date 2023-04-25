<script lang="ts">
	import Editor from '$lib/components/editor/editor.svelte';
	import Sidebar from '$lib/components/editor/sidebar.svelte';
	import Nav from '$lib/components/nav/Nav.svelte';
</script>

<svelte:head>
	<title>- Editor</title>
</svelte:head>

<Nav />

<div class="flex h-screen">
	<Sidebar />
	<div class="border-r border-accents2" />
	<Editor />
</div>
