<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		getDirEntryHandle,
		readEntryContents,
		removeEntries,
		writeEntryContents
	} from '$lib/client/explorer';
	import ActionModal from '$lib/components/popup/actionModal.svelte';
	import { currentPath } from '$lib/store/currentPath';
	import { autoSaveDelay, autoSaveEditor, viewTypeEditor } from '$lib/store/userPreferences';
	import {
		Check,
		ChevronDown,
		Copy,
		Download,
		Edit,
		ExternalLink,
		FileText,
		Maximize,
		Minimize,
		Save,
		Trash
	} from 'lucide-svelte';
	import snarkdown from 'snarkdown';
	import { onMount } from 'svelte';

	export let entry: EntryData;
	export let entryHandle: FileSystemFileHandle;

	let isMaximized = document.fullscreenElement !== null;

	let modalDeleteConfirm = false;
	let modalSaveOptions = false;

	let entryContent = '';
	onMount(async () => {
		entryContent = (await readEntryContents(entryHandle)) || '';
	});

	let recentlySaved = false;

	// Tries to save after a delay if no other saves are triggered in the meantime
	let saveTimeout: number | null = null;
	async function handleSave() {
		// Reset timeout
		if (saveTimeout) clearTimeout(saveTimeout);

		saveTimeout = setTimeout(() => {
			writeEntryContents(entryHandle, entryContent);

			recentlySaved = true;
			setTimeout(() => {
				recentlySaved = false;
			}, 1000);
		}, $autoSaveDelay);
	}
</script>

<ActionModal bind:open={modalDeleteConfirm} title="Delete {entry.type}?">
	<p class="line-clamp-3">
		Are you sure you want to delete <span class="font-bold">{entry.name}</span> and all of its contents?
	</p>
	<div class="flex justify-around">
		<button
			class="button secondary"
			on:click={() => {
				modalDeleteConfirm = false;
			}}
		>
			Cancel
		</button>
		<button
			class="button alert"
			on:click={async () => {
				modalDeleteConfirm = false;
				await removeEntries([entry.id], await getDirEntryHandle(entry.id));
				await goto('/explorer/' + $currentPath.pathID.slice(0, -1).join('/'));
			}}
		>
			Confirm
		</button>
	</div>
</ActionModal>
<ActionModal bind:open={modalSaveOptions} title="Save options">
	<div class="flex flex-col justify-between gap-2">
		<div class="flex items-center justify-between gap-2">
			<label for="autoSaveToggle">Autosave</label>
			<button
				class="button normal flex w-20 items-center justify-center"
				id="autoSaveToggle"
				on:click={() => {
					$autoSaveEditor = !$autoSaveEditor;
				}}
			>
				{$autoSaveEditor ? 'On' : 'Off'}
			</button>
		</div>
		<div class="flex items-center justify-between gap-2">
			<label for="autoSaveDelay">Autosave delay (ms)</label>
			<input
				id="autoSaveDelay"
				type="number"
				class="border-main w-20 bg-background p-2 font-bold text-primary"
				bind:value={$autoSaveDelay}
			/>
		</div>
	</div>
</ActionModal>

<main class="flex flex-1 flex-col gap-5 p-2">
	<div class="flex justify-between">
		<div class="flex flex-col">
			<button class="button secondary mb-2 flex justify-between">Export <Download /></button>
			<div
				class="flex h-10 justify-between rounded-lg border border-accents2 p-1"
				role="radiogroup"
			>
				<button
					class="group flex w-24 items-center justify-between gap-1 rounded p-1 aria-checked:bg-accents2 aria-[checked='true']:hidden sm:aria-[checked='true']:flex"
					aria-checked={!$viewTypeEditor}
					aria-label="Switch to edit mode"
					role="radio"
					on:click={() => viewTypeEditor.set(false)}
				>
					<Edit
						class="w-6 stroke-accents2 transition group-hover:stroke-primary group-focus:stroke-primary group-aria-checked:stroke-primary"
					/>
					<span
						class="flex-1 text-secondary transition group-hover:text-primary group-focus:stroke-primary group-aria-checked:text-primary"
					>
						Edit
					</span>
				</button>
				<button
					class="group flex w-24 items-center justify-between gap-1 rounded p-1 aria-checked:bg-accents2 aria-[checked='true']:hidden sm:aria-[checked='true']:flex"
					aria-checked={$viewTypeEditor}
					aria-label="Switch to preview mode"
					role="radio"
					on:click={() => viewTypeEditor.set(true)}
				>
					<FileText
						class="w-6 stroke-accents2 transition group-hover:stroke-primary group-focus:stroke-primary group-aria-checked:stroke-primary"
					/>
					<span
						class="flex-1 text-secondary transition group-hover:text-primary group-focus:stroke-primary group-aria-checked:text-primary"
					>
						Preview
					</span>
				</button>
			</div>
		</div>
		<menu class="flex flex-col">
			<div class="flex gap-2">
				<button
					class="button secondary"
					aria-label="Copy current file to clipboard"
					on:click={() => {
						navigator.clipboard.writeText(entryContent);
					}}
				>
					<Copy />
				</button>
				<a
					href="/editor/{$currentPath.pathID.join('/')}"
					target="_blank"
					class="button secondary"
					aria-label="Open current file in new tab"
				>
					<ExternalLink />
				</a>
				<button
					class="button secondary"
					aria-label="Maximize current file"
					on:click={() => {
						if (isMaximized) {
							document.exitFullscreen();
							isMaximized = false;
						} else {
							document.documentElement.requestFullscreen();
							isMaximized = true;
						}
					}}
				>
					{#if isMaximized}
						<Minimize />
					{:else}
						<Maximize />
					{/if}
				</button>
			</div>
			<div class="mt-2 flex gap-2">
				<div class="button flex flex-1 justify-between text-background">
					<button
						class="text-inherit"
						aria-label="Save current file"
						on:click={() => {
							handleSave();
							recentlySaved = true;
						}}
					>
						{#if recentlySaved}
							<Check color="#29bc9b" />
						{:else}
							<Save />
						{/if}
					</button>
					<button
						class="text-inherit"
						aria-label="Toggle save options menu"
						on:click={() => {
							modalSaveOptions = true;
						}}
					>
						<ChevronDown />
					</button>
				</div>
				<button
					class="button alert"
					aria-label="Delete current file"
					on:click={() => {
						modalDeleteConfirm = true;
					}}
				>
					<Trash />
				</button>
			</div>
		</menu>
	</div>
	<div class="min-h-screen bg-background">
		{#if $viewTypeEditor}
			<div class="prose w-full pl-2 pr-2 dark:prose-invert md:prose-xl">
				{@html snarkdown(entryContent)}
			</div>
		{:else}
			<div
				on:input={$autoSaveEditor ? handleSave : undefined}
				bind:innerText={entryContent}
				contenteditable
				role="textbox"
				class="min-h-screen w-full rounded border border-accents3 bg-inherit pl-2 pr-2"
			/>
		{/if}
	</div>
</main>
