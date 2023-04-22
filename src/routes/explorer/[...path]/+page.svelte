<script lang="ts">
	import Item from '$lib/components/entries/Item.svelte';
	import { viewType } from '$lib/store/viewType';

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
		class:grid={$viewType}
		class:flex={!$viewType}
		id="directories-list"
		aria-label="List of directories"
		class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] flex-col gap-2 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(450px,1fr))]"
	>
		{#each dirEntries as item (item.id)}
			<Item id={item.id} title={item.name} icon={item.icon} />
		{/each}
	</div>
	<div
		class:grid={$viewType}
		class:flex={!$viewType}
		aria-label="List of notes"
		class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] flex-col gap-2 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(450px,1fr))]"
	>
		{#each fileEntries as item (item.id)}
			<Item
				id={item.id}
				title={item.name}
				icon={item.icon}
				description="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nisi vero eligendi dignissimos nostrum laboriosam neque."
			/>
		{/each}
	</div>
</div>
