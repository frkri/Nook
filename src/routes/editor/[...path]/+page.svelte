<script lang="ts">
	import Editor from '$lib/components/editor/editor.svelte';
	import { onDestroy, onMount } from 'svelte';

	export let data;

	let { entry, entryHandle } = data;

	let bc: BroadcastChannel;
	onMount(() => {
		bc = new BroadcastChannel(`editor:${entry.id}`);
	});

	onDestroy(() => {
		bc.close();
	});
</script>

<Editor {entry} {entryHandle} {bc} />
