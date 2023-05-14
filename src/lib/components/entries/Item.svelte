<script lang="ts">
	import type { EntryData } from '$lib/types';

	import { getFileEntryHandle } from '$lib/client/explorer';
	import DeleteEntryModal from '$lib/components/popup/deleteEntryModal.svelte';
	import { currentPath } from '$lib/store/currentPath';
	import { Trash } from 'lucide-svelte';
	import { onMount } from 'svelte';

	export let entry: EntryData;

	let modalDeleteConfirm = false;

	// Get basic description content of entry if it's a note
	onMount(async () => {
		if (entry.type !== 'file') return;
		let entryHandle = await getFileEntryHandle(entry.id);
		if (entryHandle) {
			let file = await entryHandle.getFile();
			entry.description = (await file.text()).slice(0, 500); // Gets first 100 chars
		}
	});

	// Builds path to next entry
	$: prefix = entry.type === 'directory' ? '/explorer/' : '/editor/';
	$: entryPath =
		prefix +
		$currentPath.pathID.join('/') +
		($currentPath.pathID.length === 0 ? '' : '/') +
		entry.id;
</script>

<DeleteEntryModal {entry} {modalDeleteConfirm} />

<div
	class="group flex w-full flex-col rounded-lg border border-accents6 p-2 transition hover:border-accents1 dark:border-accents2 dark:hover:border-accents6"
>
	<header class="flex items-center gap-2 py-2">
		<button
			class="group-focus-within:inline-block group-hover:inline-block"
			on:click={() => {
				modalDeleteConfirm = true;
			}}
		>
			<Trash class="stroke-accents7 transition hover:stroke-alert dark:stroke-accents1" />
		</button>
		<a href={entryPath} class="flex flex-1 items-center gap-3">
			<span
				class="inline-flex w-9 items-center justify-center rounded-lg bg-accents7 p-1 text-xl dark:bg-accents2"
			>
				{entry.icon}
			</span>
			<h2 class="line-clamp-1 w-5 flex-1 dark:bg-background dark:text-primary">
				{entry.name}
			</h2>
		</a>
	</header>
	{#if entry.description}
		<p
			class="relative mx-8 line-clamp-2 overflow-hidden text-sm text-secondary
				after:absolute after:bottom-0 after:right-0 after:h-[1.25rem] after:w-[40ch] after:bg-gradient-to-r after:from-transparent after:to-foreground dark:after:to-background"
		>
			{entry.description}
		</p>
	{/if}
</div>
