<script lang="ts">
	import { broadcastMessage, type EntryData } from '$lib/types';

	import { readEntryContents, writeEntryContents } from '$lib/client/explorer';
	import { downloadFile } from '$lib/client/utils';
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
		Code2,
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
	import { onDestroy, onMount } from 'svelte';
	import DeleteEntryModal from '../popup/deleteEntryModal.svelte';

	export let entry: EntryData;
	export let entryHandle: FileSystemFileHandle;

	let isMaximized = document.fullscreenElement !== null;

	let modalDeleteConfirm = false;
	let modalSaveOptions = false;
	let modalExportFile = false;

	let entryContent = '';
	let entryContentHTML = '';

	let bc: BroadcastChannel;
	onMount(async () => {
		entryContent = (await readEntryContents(entryHandle)) || '';
		entryContentHTML = snarkdown(entryContent);
		bc = new BroadcastChannel(`editor:${entry.id}`);

		bc.onmessage = (e) => {
			switch (e.data.type) {
				case broadcastMessage.SaveFile:
					entryContent = e.data.content;
					entryContentHTML = snarkdown(entryContent);
					break;
			}
		};
	});
	onDestroy(() => {
		bc.close();
	});

	let recentlySaved = false;
	// Tries to save after a delay if no other saves are triggered in the meantime
	let saveTimeout: number | null = null;
	async function handleSave() {
		// Reset timeout
		if (saveTimeout) clearTimeout(saveTimeout);

		saveTimeout = setTimeout(async () => {
			writeEntryContents(entryHandle, entryContent);

			if ($autoBroadcastState)
				bc.postMessage({ type: broadcastMessage.SaveFile, content: entryContent });

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
				class="border-main w-20 p-2 font-bold dark:bg-background"
				bind:value={$autoSaveDelay}
			/>
		</div>
	</div>
</ActionModal>

<!-- Export Modal -->
<ActionModal bind:open={modalExportFile}>
	<button
		role="menuitem"
		aria-label="Export as Markdown file"
		id="folder"
		class="button secondary flex w-full gap-1 border-none hover:bg-accents7 dark:hover:bg-accents2"
		on:click={() => {
			downloadFile(entry.name, 'md', 'text/plain', entryContent);
			modalExportFile = false;
		}}><FileText class="w-4" />Markdown</button
	>
	<button
		role="menuitem"
		aria-label="Export as HTML file"
		id="note"
		class="button secondary flex w-full gap-1 border-none hover:bg-accents7 dark:hover:bg-accents2"
		on:click={() => {
			entryContentHTML = snarkdown(entryContent);
			downloadFile(entry.name, 'html', 'text/html', entryContentHTML);
			modalExportFile = false;
		}}><Code2 class="w-4" />HTML</button
	>
</ActionModal>

<menu class="z-10 flex w-full justify-between p-2 lg:fixed lg:top-[60px]">
	<div class="flex flex-col">
		<button
			class="button secondary mb-2 flex justify-between"
			on:click={() => {
				modalExportFile = true;
			}}
		>
			Export <Download />
		</button>
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
				<span class="switch flex-1">Edit</span>
			</button>
			<button
				class="group flex w-24 items-center justify-between gap-1 rounded p-1 aria-checked:bg-accents1 aria-[checked='true']:hidden dark:aria-checked:bg-accents2 sm:aria-[checked='true']:flex"
				aria-checked={$viewTypeEditor}
				aria-label="Switch to preview mode"
				role="radio"
				on:click={() => {
					viewTypeEditor.set(true);
					entryContentHTML = snarkdown(entryContent);
				}}
			>
				<FileText class="switch w-6" />
				<span class="switch flex-1">Preview</span>
			</button>
		</div>
	</div>
	<div class="flex flex-col">
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
	</div>
</menu>

<div class="flex items-center justify-center px-2 dark:bg-background xl:mt-[180px]">
	{#if $viewTypeEditor}
		<div class="prose px-2 dark:prose-invert xl:prose-xl">
			{@html entryContentHTML}
		</div>
	{/if}
	<textarea
		on:input={$autoSaveEditor ? handleSave : undefined}
		bind:value={entryContent}
		class:hidden={$viewTypeEditor}
		class="h-[calc(100vh-200px)] w-full resize-none rounded border border-accents6 bg-inherit px-2 leading-7 outline-none focus:border-accents1 dark:focus:border-accents7"
	/>
</div>
