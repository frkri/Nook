<script lang="ts">
	import Editor from '$lib/components/editor/editor.svelte';

	export let data;

	let { entry, entryHandle } = data;
</script>

<Editor {entry} {entryHandle} />
