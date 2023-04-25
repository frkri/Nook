<script lang="ts">
	import Item from '$lib/components/entries/Item.svelte';
	import { viewTypeList } from '$lib/store/viewType';

	export let data;

	$: ({ dirEntries, fileEntries } = data);
</script>

<div class="m-2 flex flex-col gap-16">
	<div class="flex flex-col gap-4">
		<label for="items-list" class="text-2xl font-bold text-primary"
			>{dirEntries.length} Directories and {fileEntries.length} Notes</label
		>
	</div>

	<div
		class:grid={$viewTypeList}
		class:flex={!$viewTypeList}
		id="directories-list"
		role="list"
		aria-label="List of directories"
		class="grid-cols-[repeat(auto-fit,minmax(250px,1fr))] flex-col gap-1 md:grid-cols-[repeat(auto-fit,minmax(450px,1fr))]"
	>
		{#each dirEntries as item (item.id)}
			<Item entry={item} />
		{/each}
	</div>
	<div
		class:grid={$viewTypeList}
		class:flex={!$viewTypeList}
		role="list"
		aria-label="List of notes"
		class="grid-cols-[repeat(auto-fit,minmax(250px,1fr))] flex-col gap-1 md:grid-cols-[repeat(auto-fit,minmax(450px,1fr))]"
	>
		{#each fileEntries as item (item.id)}
			<Item entry={item} />
		{/each}
	</div>
</div>
