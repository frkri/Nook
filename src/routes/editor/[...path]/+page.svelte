<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { writeEntryContents } from '$lib/client/explorer';
	import { parseMarkdown } from '$lib/client/parser';
	import { downloadFile } from '$lib/client/utils';
	import ActionModal from '$lib/components/popup/actionModal.svelte';
	import DeleteEntryModal from '$lib/components/popup/deleteEntryModal.svelte';
	import { currentPath } from '$lib/store/currentPath';
	import { recentFiles } from '$lib/store/recentFiles.js';
	import {
		autoBroadcastState,
		autoSaveDelay,
		autoSaveEditor,
		editorViewPreview,
		hotkeysEnabled
	} from '$lib/store/userPreferences';
	import { broadcastMessage } from '$lib/types';
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
	import { onDestroy } from 'svelte';

	// Load entry data from page.ts
	export let data;
	$: ({ entry, entryHandle } = data);
	let userEntryContent = '';

	// Modal states
	let modalDeleteConfirm = false;
	let modalSaveOptions = false;
	let modalExportFile = false;

	let entryContentHTML = '';
	let bc: BroadcastChannel | null = null;
	let isMaximized = document.fullscreenElement !== null;

	afterNavigate(async () => {
		// Switch to preview view if not editing a note
		if (entry.type !== 'note') $editorViewPreview = true;

		userEntryContent = data.entryContent;
		renderMarkdown(userEntryContent);

		// Append entry to recent files
		if ($recentFiles.includes(entry.id)) return;
		$recentFiles = [entry.id, ...$recentFiles.slice(0, 5)];

		// Close previous broadcast channel
		if (bc?.name === `editor:${entry.id}`) return;

		bc?.close();
		bc = new BroadcastChannel(`editor:${entry.id}`);
		bc.onmessage = (e) => {
			switch (e.data.type) {
				case broadcastMessage.SaveFile:
					userEntryContent = e.data.content;
					renderMarkdown(userEntryContent);
					break;
			}
		};
	});

	// Register & Unregister Hotkeys
	$: if ($hotkeysEnabled) document.addEventListener('keydown', handleKeyDown, true);
	else document.removeEventListener('keydown', handleKeyDown, true);
	onDestroy(() => {
		bc?.close();
		document.removeEventListener('keydown', handleKeyDown, true);
	});

	// Hotkeys state checks
	function handleKeyDown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey)
			switch (e.key.toLocaleLowerCase()) {
				case 's':
					e.preventDefault();
					// Inform the user that the file has been saved
					recentlySaved = true;
					handleSave();
					break;
				case 'e':
					e.preventDefault();
					handleExportFile();
					break;
				case 'q':
					e.preventDefault();
					$editorViewPreview = !$editorViewPreview;
					renderMarkdown(userEntryContent);
					break;
			}
	}

	// Save state checks
	// Tries to save after a delay if no other saves are triggered in the meantime
	let recentlySaved = false;
	let saveTimeout: number | null = null;
	async function handleSave() {
		if (entry.type !== 'note') return;

		// Reset timeout
		if (saveTimeout) clearTimeout(saveTimeout);

		saveTimeout = setTimeout(async () => {
			writeEntryContents(entryHandle, userEntryContent);

			if ($autoBroadcastState)
				bc?.postMessage({ type: broadcastMessage.SaveFile, content: userEntryContent });

			// Inform the user that the file has been saved
			recentlySaved = true;
			setTimeout(() => {
				recentlySaved = false;
			}, 1000);
		}, $autoSaveDelay);
	}

	async function renderMarkdown(content: string) {
		if (entry.type !== 'note') return;
		console.log('rendering markdown');
		entryContentHTML = await parseMarkdown(content);
		//entryContentHTML = snarkdown(content);
	}

	function handleExportFile() {
		if (entry.type === 'note') {
			modalExportFile = !modalExportFile;
			return;
		}

		// Download all other file types
		entryHandle.getFile().then(async (file) => {
			downloadFile(entry.name, '', '', await file.arrayBuffer());
		});
	}
</script>

<DeleteEntryModal {entry} bind:modalDeleteConfirm />

<ActionModal bind:open={modalSaveOptions} title="Save options">
	<div class="flex flex-col justify-between gap-2">
		<div class="flex items-center justify-between">
			<label for="autoSaveToggle">Autosave</label>
			<button
				class="button main flex w-20 items-center justify-center"
				id="autoSaveToggle"
				on:click={() => {
					$autoSaveEditor = !$autoSaveEditor;
				}}
			>
				{$autoSaveEditor ? 'On' : 'Off'}
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
		<div class="flex items-center justify-between">
			<label for="autoBroadcastState">Broadcast file updates</label>
			<button
				class="button main flex w-20 items-center justify-center"
				id="autoBroadcastState"
				on:click={() => {
					$autoBroadcastState = !$autoBroadcastState;
				}}
			>
				{$autoBroadcastState ? 'On' : 'Off'}
			</button>
		</div>
		<div class="flex items-center justify-between">
			<label for="hotkeysEnabled">Enable hotkeys</label>
			<button
				class="button main flex w-20 items-center justify-center"
				id="hotkeysEnabled"
				on:click={() => {
					$hotkeysEnabled = !$hotkeysEnabled;
				}}
			>
				{$hotkeysEnabled ? 'On' : 'Off'}
			</button>
		</div>
	</div>
</ActionModal>

<!-- Export Modal -->
<ActionModal bind:open={modalExportFile}>
	<button
		role="menuitem"
		aria-label="Export as Markdown file"
		class="button secondary flex w-full gap-1 border-none hover:bg-accents7 dark:hover:bg-accents2"
		on:click={() => {
			downloadFile(entry.name, 'md', 'text/markdown', userEntryContent);
			modalExportFile = false;
		}}><FileText class="w-4" />Markdown</button
	>
	<button
		role="menuitem"
		aria-label="Export as HTML file"
		class="button secondary flex w-full gap-1 border-none hover:bg-accents7 dark:hover:bg-accents2"
		on:click={() => {
			renderMarkdown(userEntryContent);
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
				handleExportFile();
			}}
		>
			Export <Download />
		</button>
		<div
			class="flex h-10 justify-between rounded-lg border border-accents4 p-1 dark:aria-checked:bg-accents2"
			role="radiogroup"
		>
			{#if entry.type === 'note'}
				<button
					class="group flex w-24 items-center justify-between gap-1 rounded p-1 aria-checked:bg-accents1 aria-[checked='true']:hidden dark:aria-checked:bg-accents2 sm:aria-[checked='true']:flex"
					aria-checked={!$editorViewPreview}
					aria-label="Switch to edit mode"
					role="radio"
					on:click={() => editorViewPreview.set(false)}
				>
					<Edit class="switch w-6" />
					<span class="switch flex-1">Edit</span>
				</button>
			{/if}
			<button
				class="group flex w-24 items-center justify-between gap-1 rounded p-1 aria-checked:bg-accents1 aria-[checked='true']:hidden dark:aria-checked:bg-accents2 sm:aria-[checked='true']:flex"
				aria-checked={$editorViewPreview}
				aria-label="Switch to preview mode"
				role="radio"
				on:click={() => {
					editorViewPreview.set(true);
					renderMarkdown(userEntryContent);
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
					navigator.clipboard.writeText(userEntryContent);
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
			<div class="button flex flex-1 justify-between" class:main={entry.type === 'note'}>
				<button
					disabled={entry.type !== 'note'}
					class="text-inherit"
					aria-label="Save current file"
					on:click={() => {
						handleSave();
						recentlySaved = true;
					}}
				>
					{#if recentlySaved}
						<Check />
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

<div class="flex items-center justify-center px-2 dark:bg-background lg:mt-[180px]">
	{#if $editorViewPreview}
		<div class="prose my-12 px-2 dark:prose-invert xl:prose-xl">
			{#if entry.type === 'note'}
				{@html entryContentHTML}
			{:else if entry.type === 'video'}
				<!-- svelte-ignore a11y-media-has-caption -->
				<video src={data.entryContent} controls />
			{:else if entry.type === 'audio'}
				<audio src={data.entryContent} controls />
			{:else if entry.type === 'image'}
				<!-- svelte-ignore a11y-missing-attribute -->
				<img src={data.entryContent} />
			{/if}
		</div>
	{/if}

	<textarea
		on:input={$autoSaveEditor ? handleSave : undefined}
		bind:value={userEntryContent}
		class:hidden={$editorViewPreview}
		class="h-[calc(100vh-200px)] w-full resize-none rounded border border-accents6 bg-inherit px-2 leading-7 outline-none focus:border-accents1 dark:focus:border-accents7"
	/>
</div>
