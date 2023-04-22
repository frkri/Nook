<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { getDirEntryHandle, removeEntries } from '$lib/client/explorer';
	import { viewType } from '$lib/store/viewType.js';
	import { Edit, Trash } from 'lucide-svelte';
	import ActionModal from '../popup/actionModal.svelte';

	export let id: string;
	export let title: string;
	export let icon: string;
	export let description: string | null = null;

	let editMode = false;
	let modalConfirm = false;
</script>

<ActionModal bind:open={modalConfirm} title="Delete {description ? 'Note' : 'Folder'}">
	<p class="line-clamp-3">
		Are you sure you want to delete <span class="font-bold">{title}</span> and all of its contents?
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
				await removeEntries([id], await getDirEntryHandle(id));
				invalidate('entries:loader');
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
		<a href={$page.url.pathname + '/' + id} class="flex flex-1 items-center gap-3">
			<span class="inline-flex w-9 items-center justify-center rounded-lg bg-accents2 p-1 text-xl">
				{icon}
			</span>
			<h3 class="line-clamp-1 w-5 flex-1 bg-background font-bold text-primary">
				{title}
			</h3>
		</a>
		<button
			class="hidden group-focus-within:inline-block group-hover:inline-block"
			on:click={() => {
				editMode = !editMode;
			}}
			tabindex={0}
		>
			<Edit class="stroke-accents2 transition hover:stroke-primary" />
		</button>
		<button
			class="hidden group-focus-within:inline-block group-hover:inline-block"
			on:click={() => {
				modalConfirm = true;
			}}
			tabindex={0}
		>
			<Trash class="stroke-accents2 transition hover:stroke-primary" />
		</button>
	</header>
	{#if description && $viewType}
		<div>
			<p class="line-clamp-3 text-sm text-secondary sm:line-clamp-4">
				{description}
			</p>
		</div>
	{/if}
</div>
