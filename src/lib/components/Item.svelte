<script lang="ts">
	import type { EntryData } from '$lib/types';

	import { invalidate } from '$app/navigation';
	import { getFileEntryHandle, updateEntry } from '$lib/client/explorer';
	import ActionModal from '$lib/components/popup/actionModal.svelte';
	import DeleteEntryModal from '$lib/components/popup/deleteEntryModal.svelte';
	import { currentPath } from '$lib/store/currentPath';
	import { Edit, MoreVertical, Trash } from 'lucide-svelte';
	import { onMount } from 'svelte';

	export let entry: EntryData;
	let modalItemOptionsOpen = false;
	let modalDeleteConfirmOpen = false;
	let modalItemEditOpen = false;

	// Get basic description content of entry if it's a note
	onMount(async () => {
		if (entry.type !== 'note') return;

		let entryHandle = await getFileEntryHandle(entry.id);
		if (entryHandle) {
			let file = await entryHandle.getFile();
			entry.description = (await file.text()).slice(0, 300); // Gets first 300 chars
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

<DeleteEntryModal {entry} bind:modalDeleteConfirm={modalDeleteConfirmOpen} />

<ActionModal bind:open={modalItemOptionsOpen} title="Entry options">
	<button
		class="button secondary"
		on:click={() => {
			modalItemOptionsOpen = false;
			modalItemEditOpen = true;
		}}
	>
		<Edit /> Edit
	</button>
	<button
		class="button secondary"
		on:click={() => {
			modalItemOptionsOpen = false;
			modalDeleteConfirmOpen = true;
		}}
	>
		<Trash /> Delete
	</button>
</ActionModal>

<!-- Entry edit modal -->
<ActionModal bind:open={modalItemEditOpen} title="Edit">
	<div class="flex justify-around gap-2 sm:m-3">
		<input
			bind:value={entry.icon}
			maxlength="2"
			class="border-main inline-flex w-9 items-center justify-center rounded-lg bg-accents7 p-1 text-xl dark:bg-accents2"
		/>
		<input
			bind:value={entry.name}
			maxlength="30"
			class="border-main min-w-0 flex-1 bg-foreground p-2 font-bold placeholder:text-accents4 dark:bg-background dark:text-primary"
		/>
	</div>
	<div class="flex justify-around">
		<button
			class="button secondary"
			on:click={() => {
				modalItemEditOpen = false;
			}}
		>
			Cancel
		</button>
		<button
			class="button main"
			on:click={async () => {
				if (entry.name.length === 0 || entry.icon.length === 0) return;
				modalItemEditOpen = false;

				await updateEntry({
					id: entry.id,
					name: entry.name,
					icon: entry.icon
				});
				await invalidate('entries:explorer-loader');
			}}
		>
			Create
		</button>
	</div>
</ActionModal>

<div
	class="group flex w-full flex-col rounded-lg border border-accents6 p-2 transition hover:border-accents1 dark:border-accents2 dark:hover:border-accents6"
>
	<header class="flex items-center gap-2 py-2">
		<button
			class="group-focus-within:inline-block group-hover:inline-block"
			aria-label="Delete entry"
			on:click={() => {
				modalItemOptionsOpen = true;
			}}
		>
			<MoreVertical
				class="stroke-accents6 transition hover:stroke-background dark:stroke-accents2 dark:hover:stroke-foreground"
			/>
		</button>
		<a href={entryPath} class="flex flex-1 items-center gap-3">
			<span
				class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accents7 p-1 text-xl dark:bg-accents2"
			>
				{entry.icon}
			</span>
			<h2 class="line-clamp-1 w-5 flex-1 dark:bg-background dark:text-primary">
				{entry.name}
			</h2>

			<span class="text-xs text-secondary">
				{new Date(entry.modified).toLocaleDateString()}
			</span>
		</a>
	</header>

	{#if entry.description}
		<p
			class="relative mx-8 line-clamp-2 overflow-hidden text-sm text-secondary
				after:absolute after:bottom-0 after:right-0 after:h-[1.25rem] after:w-[30ch] after:bg-gradient-to-r after:from-transparent after:to-foreground dark:after:to-background"
		>
			{entry.description}
		</p>
	{/if}
</div>
