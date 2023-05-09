<script lang="ts">
	import type { EntryData } from '$lib/types';

	import { readEntryContents, writeEntryContents } from '$lib/client/explorer';
	import ActionModal from '$lib/components/popup/actionModal.svelte';
	import { currentPath } from '$lib/store/currentPath';
	import {
		autoBroadcastState,
		autoSaveDelay,
		autoSaveEditor,
		viewTypeEditor
	} from '$lib/store/userPreferences';
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
	import DeleteEntryModal from '../popup/deleteEntryModal.svelte';

	export let entry: EntryData;
	export let entryHandle: FileSystemFileHandle;
	export let bc: BroadcastChannel;

	let isMaximized = document.fullscreenElement !== null;

	let modalDeleteConfirm = false;
	let modalSaveOptions = false;

	let entryContent = '';
	onMount(async () => {
		entryContent = (await readEntryContents(entryHandle)) || '';
		bc.onmessage = (e) => {
			if (e.data.type === 'save-file') {
				entryContent = e.data.content;
			}
		};
	});

	let recentlySaved = false;

	// Tries to save after a delay if no other saves are triggered in the meantime
	let saveTimeout: number | null = null;
	async function handleSave() {
		// Reset timeout
		if (saveTimeout) clearTimeout(saveTimeout);

		saveTimeout = setTimeout(async () => {
			writeEntryContents(entryHandle, entryContent);
			if ($autoBroadcastState) bc.postMessage({ type: 'save-file', content: entryContent });

			recentlySaved = true;
			setTimeout(() => {
				recentlySaved = false;
			}, 1000);
		}, $autoSaveDelay);
	}
</script>

<DeleteEntryModal {entry} {modalDeleteConfirm} />

<ActionModal bind:open={modalSaveOptions} title="Save options">
	<div class="flex flex-col justify-between gap-2">
		<div class="flex items-center justify-between">
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
		<div class="flex items-center justify-between">
			<label for="autoBroadcastState">Broadcast file updates</label>
			<button
				class="button normal flex w-20 items-center justify-center"
				id="autoBroadcastState"
				on:click={() => {
					$autoBroadcastState = !$autoBroadcastState;
				}}
			>
				{$autoBroadcastState ? 'On' : 'Off'}
			</button>
		</div>
		<div class="flex items-center justify-between">
			<label for="autoSaveDelay">Autosave delay (ms)</label>
			<input
				id="autoSaveDelay"
				type="number"
				class="border-main w-20 p-2 font-bold text-primary dark:bg-background"
				bind:value={$autoSaveDelay}
			/>
		</div>
	</div>
</ActionModal>

<main class="flex h-[90%] flex-col gap-2 p-2">
	<div class="flex justify-between">
		<div class="flex flex-col">
			<button class="button secondary mb-2 flex justify-between">Export <Download /></button>
			<div
				class="flex h-10 justify-between rounded-lg border border-accents4 p-1 dark:aria-checked:bg-accents2"
				role="radiogroup"
			>
				<button
					class="group flex w-24 items-center justify-between gap-1 rounded p-1 aria-checked:bg-accents1 aria-[checked='true']:hidden dark:aria-checked:bg-accents2 sm:aria-[checked='true']:flex"
					aria-checked={!$viewTypeEditor}
					aria-label="Switch to edit mode"
					role="radio"
					on:click={() => viewTypeEditor.set(false)}
				>
					<Edit class="switch w-6" />
					<span class="switch flex-1"> Edit </span>
				</button>
				<button
					class="group flex w-24 items-center justify-between gap-1 rounded p-1 aria-checked:bg-accents1 aria-[checked='true']:hidden dark:aria-checked:bg-accents2 sm:aria-[checked='true']:flex"
					aria-checked={$viewTypeEditor}
					aria-label="Switch to preview mode"
					role="radio"
					on:click={() => viewTypeEditor.set(true)}
				>
					<FileText class="switch w-6" />
					<span class="switch flex-1"> Preview </span>
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
				<div class="button normal flex flex-1 justify-between">
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
	<div class="h-full dark:bg-background">
		{#if $viewTypeEditor}
			<div class="prose h-full w-full overflow-scroll pl-2 pr-2 dark:prose-invert md:prose-xl">
				{@html snarkdown(entryContent)}
			</div>
		{:else}
			<textarea
				on:input={$autoSaveEditor ? handleSave : undefined}
				bind:value={entryContent}
				class="h-full w-full rounded border border-accents3 bg-inherit pl-2 pr-2"
			/>
		{/if}
	</div>
</main>
