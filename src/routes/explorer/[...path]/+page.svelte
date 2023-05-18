<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import tips from '$lib/assets/tips.json';
	import Item from '$lib/components/Item.svelte';
	import { viewTypeList } from '$lib/store/userPreferences.js';
	import { Lightbulb, Plus } from 'lucide-svelte';

	export let data;

	$: ({ dirEntries, fileEntries } = data);

	let randomTip = '';
	afterNavigate(() => {
		// Get a random tip from the tips.json file
		randomTip = tips[Math.floor(Math.random() * tips.length)];
	});
</script>

<div class="m-3 flex min-h-[80vh] flex-col gap-8 pt-6">
	{#if dirEntries.length === 0 && fileEntries.length === 0}
		<div class="mx-auto flex flex-col items-center gap-4 font-bold">
			<p>No entries found! Create new items using the</p>
			<Plus size={35} class="button" />
		</div>
	{/if}

	{#if dirEntries.length > 0}
		<span class="mx-auto text-2xl font-bold dark:text-primary"
			>{dirEntries.length}
			{dirEntries.length === 1 ? 'Directory' : 'Directories'}
		</span>

		<div
			class:grid={$viewTypeList}
			class:flex={!$viewTypeList}
			id="directories-list"
			role="list"
			aria-label="List of directories"
			class="grid-cols-[repeat(auto-fit,minmax(250px,1fr))] flex-col gap-1 xl:grid-cols-[repeat(auto-fit,minmax(450px,1fr))]"
		>
			{#each dirEntries as entry (entry.id)}
				<Item {entry} />
			{/each}
		</div>
	{/if}

	{#if fileEntries.length > 0}
		<span class="mx-auto text-2xl font-bold dark:text-primary">
			{fileEntries.length}
			{fileEntries.length === 1 ? 'Note' : 'Notes'}
		</span>

		<div
			class:grid={$viewTypeList}
			class:flex={!$viewTypeList}
			role="list"
			aria-label="List of notes"
			class="grid-cols-[repeat(auto-fit,minmax(250px,1fr))] flex-col gap-1 xl:grid-cols-[repeat(auto-fit,minmax(450px,1fr))]"
		>
			{#each fileEntries as entry (entry.id)}
				<Item {entry} />
			{/each}
		</div>
	{/if}
</div>

<footer class="flex w-full items-center justify-center gap-2 p-8">
	<span class="flex gap-2 font-bold tracking-wider">
		<Lightbulb />
		Tip:
	</span>
	{randomTip}
</footer>
