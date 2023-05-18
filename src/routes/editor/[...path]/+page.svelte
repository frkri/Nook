<script lang="ts">
	import { recentNotes } from '$lib/store/recentNotes.js';
	import { onMount } from 'svelte';
	import Editor from './editor.svelte';

	export let data;

	let { entry, entryHandle } = data;

	onMount(async () => {
		// Append entry to recent notes
		if ($recentNotes.includes(entry.id)) return;
		$recentNotes = [entry.id, ...$recentNotes.slice(0, 5)];
	});
</script>

<Editor {entry} {entryHandle} />
