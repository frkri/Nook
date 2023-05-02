<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { getDirEntryHandle, removeEntries } from '$lib/client/explorer';
	import ActionModal from '$lib/components/popup/actionModal.svelte';
	import { currentPath } from '$lib/store/currentPath';
	import { Trash } from 'lucide-svelte';

	export let entry: EntryData;

	let modalConfirm = false;

	// Builds path to next entry
	$: prefix = entry.type === 'directory' ? '/explorer/' : '/editor/';
	$: entryPath =
		prefix +
		$currentPath.pathID.join('/') +
		($currentPath.pathID.length === 0 ? '' : '/') +
		entry.id;
</script>

<ActionModal bind:open={modalConfirm} title="Delete {entry.type}?">
	<p class="line-clamp-3">
		Are you sure you want to delete <span class="font-bold">{entry.name}</span> and all of its contents?
	</p>
	<div class="flex justify-around">
		<button
			class="button normal"
			on:click={() => {
				modalConfirm = false;
			}}
		>
			Cancel
		</button>
		<button
			class="button alert"
			on:click={async () => {
				modalConfirm = false;
				await removeEntries([entry.id], await getDirEntryHandle(entry.id));
				invalidate('entries:explorer-loader');
			}}
		>
			Confirm
		</button>
	</div>
</ActionModal>

<div
	class="group flex w-full cursor-pointer flex-col gap-2 rounded-lg border border-accents2 p-3 hover:border-accents5"
>
	<header class="flex items-center gap-3">
		<a href={entryPath} class="flex flex-1 items-center gap-3">
			<span class="inline-flex w-9 items-center justify-center rounded-lg bg-accents2 p-1 text-xl">
				{entry.icon}
			</span>
			<h3 class="line-clamp-1 w-5 flex-1 bg-background font-bold text-primary">
				{entry.name}
			</h3>
		</a>
		<button
			class="sm:hidden group-focus-within:inline-block group-hover:inline-block"
			on:click={() => {
				modalConfirm = true;
			}}
		>
			<Trash class="stroke-accents2 transition hover:stroke-primary" />
		</button>
	</header>
	{#if entry.description}
		<div>
			<p class="line-clamp-2 text-sm text-secondary sm:line-clamp-4">
				{entry.description}
			</p>
		</div>
	{/if}
</div>
