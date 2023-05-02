<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import {
		getDirEntryHandle,
		readEntryContents,
		removeEntries,
		writeEntryContents
	} from '$lib/client/explorer';
	import ActionModal from '$lib/components/popup/actionModal.svelte';
	import { currentPath } from '$lib/store/currentPath';
	import { autoSaveEditor, viewTypeEditor } from '$lib/store/userPreferences';
	import { Edit, FileText, Save, Trash } from 'lucide-svelte';
	import snarkdown from 'snarkdown';
	import { onMount } from 'svelte';

	export let entry: EntryData;
	export let entryHandle: FileSystemFileHandle;

	let modalConfirm = false;

	let entryContent = '';

	// On mount, read the entry contents
	onMount(async () => {
		entryContent = (await readEntryContents(entryHandle)) || '';
	});

	// Tries to save after a delay
	let timeout: number | null = null;
	async function handleAutoSave() {
		if (!$autoSaveEditor) return;

		if (timeout) clearTimeout(timeout);

		timeout = setTimeout(() => {
			writeEntryContents(entryHandle, entryContent);
		}, 800);
	}
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
				await goto('/explorer/' + $currentPath.pathID.slice(0, -1).join('/'));
			}}
		>
			Confirm
		</button>
	</div>
</ActionModal>

<main class="flex-1 p-4 flex flex-col gap-5">
	<h1 class="text-lg line-clamp-1 font-bold">
		{entry.name}
	</h1>
	<div class="flex justify-between">
		<div class="gap-1 rounded-lg border border-accents2 p-1 flex" role="radiogroup">
			<button
				class="group w-28 justify-between flex items-center rounded gap-1 p-1 aria-checked:bg-accents2 aria-[checked='true']:hidden sm:aria-[checked='true']:flex"
				aria-checked={!$viewTypeEditor}
				aria-label="Switch to edit mode"
				role="radio"
				on:click={() => viewTypeEditor.set(false)}
			>
				<Edit
					class="w-6 stroke-accents2 transition group-hover:stroke-primary group-aria-checked:stroke-primary"
				/>
				<span
					class="text-secondary transition group-hover:text-primary group-aria-checked:text-primary"
				>
					Edit
				</span>
			</button>
			<button
				class="group w-28 flex items-center justify-between rounded p-1 gap-2 aria-checked:bg-accents2 aria-[checked='true']:hidden sm:aria-[checked='true']:flex"
				aria-checked={$viewTypeEditor}
				aria-label="Switch to preview mode"
				role="radio"
				on:click={() => viewTypeEditor.set(true)}
			>
				<FileText
					class="w-6 stroke-accents2 transition group-hover:stroke-primary group-aria-checked:stroke-primary"
				/>
				<span
					class="text-secondary transition group-hover:text-primary group-aria-checked:text-primary"
				>
					Preview
				</span>
			</button>
		</div>
		<div class="flex gap-2">
			<button
				class="button normal"
				aria-label="Save current file"
				on:click={() => writeEntryContents(entryHandle, entryContent)}
			>
				<Save />
			</button>

			<button
				class="button alert"
				aria-label="Delete current file"
				on:click={() => {
					modalConfirm = true;
				}}
			>
				<Trash />
			</button>
		</div>
	</div>
	{#if $viewTypeEditor}
		<div class="bg-background p-2 border rounded border-accents3 h-screen">
			{@html snarkdown(entryContent)}
		</div>
	{:else}
		<textarea
			bind:value={entryContent}
			on:input={handleAutoSave}
			class="bg-background p-2 border rounded border-accents3 resize-none h-screen"
			wrap="off"
		/>
	{/if}
</main>
