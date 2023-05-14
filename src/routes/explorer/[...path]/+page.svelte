<script lang="ts">
	import Item from '$lib/components/entries/Item.svelte';
	import { viewTypeList } from '$lib/store/userPreferences.js';

	export let data;

	$: ({ dirEntries, fileEntries } = data);
</script>

<div class="m-3 my-12 flex flex-col gap-8">
	{#if dirEntries.length > 0}
		<span class="mx-auto text-2xl font-bold dark:text-primary"
			>{dirEntries.length}
			{dirEntries.length === 1 ? 'Directory' : 'Directories'}
		</span>
	{/if}
	<div
		class:grid={$viewTypeList}
		class:flex={!$viewTypeList}
		id="directories-list"
		role="list"
		aria-label="List of directories"
		class="grid-cols-[repeat(auto-fit,minmax(250px,1fr))] flex-col gap-1 xl:grid-cols-[repeat(auto-fit,minmax(450px,1fr))]"
	>
		{#each dirEntries as item (item.id)}
			<Item entry={item} />
		{/each}
	</div>
	{#if fileEntries.length > 0}
		<span class="mx-auto text-2xl font-bold dark:text-primary"
			>{fileEntries.length}
			{fileEntries.length === 1 ? 'Note' : 'Notes'}
		</span>
	{/if}
	<div
		class:grid={$viewTypeList}
		class:flex={!$viewTypeList}
		role="list"
		aria-label="List of notes"
		class="grid-cols-[repeat(auto-fit,minmax(250px,1fr))] flex-col gap-1 xl:grid-cols-[repeat(auto-fit,minmax(450px,1fr))]"
	>
		{#each fileEntries as item (item.id)}
			<Item entry={item} />
		{/each}
	</div>
</div>
