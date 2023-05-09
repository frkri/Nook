<script lang="ts">
	import type { EntryData } from '$lib/types';

	import DeleteEntryModal from '$lib/components/popup/deleteEntryModal.svelte';
	import { currentPath } from '$lib/store/currentPath';
	import { Trash } from 'lucide-svelte';

	export let entry: EntryData;

	let modalDeleteConfirm = false;

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
	class="group flex w-full flex-col gap-2 rounded-lg border border-accents6 transition hover:border-accents1 dark:border-accents2 dark:hover:border-accents6"
>
	<header class="flex items-center gap-2">
		<button
			class="ml-2 group-focus-within:inline-block group-hover:inline-block"
			on:click={() => {
				modalDeleteConfirm = true;
			}}
		>
			<Trash class="stroke-accents7 transition hover:stroke-alert dark:stroke-accents1" />
		</button>
		<a href={entryPath} class="my-2 flex flex-1 items-center gap-3">
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
		<div>
			<p class="line-clamp-2 text-sm text-secondary sm:line-clamp-4">
				{entry.description}
			</p>
		</div>
	{/if}
</div>
