<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { removeEntryByID } from '$lib/client/explorer';
	import { viewType } from '$lib/store/viewType.js';
	import { Edit, Trash } from 'lucide-svelte';
	import ConfirmAction from '../popup/actionModal.svelte';

	export let id: string | undefined;
	export let title: string;
	export let emoji: string;
	export let description: string | null = null;

	let editMode = false;
	let modalConfirm = false;
</script>

<ConfirmAction bind:open={modalConfirm} title="Delete {description ? 'Note' : 'Folder'}">
	<p>
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
			on:click={() => {
				if (!id) return;
				removeEntryByID(id);
				invalidate('entries:loader');
				modalConfirm = false;
			}}
		>
			Confirm
		</button>
	</div>
</ConfirmAction>

<div
	class="group flex w-full cursor-pointer flex-col gap-2 rounded-lg border border-accents2 p-3 hover:border-accents5"
>
	<header class="flex items-center gap-3">
		<div
			class="inline-flex w-9 items-center justify-center rounded-lg bg-accents2 p-1 text-xl sm:text-2xl"
		>
			{emoji}
		</div>
		<span class="line-clamp-2 flex-1 bg-background font-bold text-primary">
			{title}
		</span>
		<Edit
			on:click={() => {
				!editMode;
			}}
			tabindex={0}
			class="hidden stroke-accents2 transition hover:stroke-primary group-hover:inline-block"
		/>
		<button
			on:click={() => {
				modalConfirm = true;
			}}
			tabindex={0}
		>
			<Trash
				class="hidden stroke-accents2 transition hover:stroke-primary group-focus-within:inline-block group-hover:inline-block"
			/>
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
