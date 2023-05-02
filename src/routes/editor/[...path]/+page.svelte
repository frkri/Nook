<script lang="ts">
	import Editor from '$lib/components/editor/editor.svelte';

	export let data;
</script>

<div>
	<Editor {...data} />
</div>
