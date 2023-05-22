<script lang="ts">
	import { File } from 'lucide-svelte';
	import { onMount } from 'svelte';

	import { invalidate } from '$app/navigation';
	import { createEntries, getDirEntryHandle } from '$lib/client/explorer';
	import { currentPath } from '$lib/store/currentPath';
	import type { EntryDataBasic } from '$lib/types';
	import { fade } from 'svelte/transition';

	let shouldShowDropZone = false;

	onMount(() => {
		// Add event listener for drag and drop
		window.addEventListener('dragenter', handleDragEnter, true);
		return () => {
			window.removeEventListener('dragenter', handleDragEnter, true);
		};
	});

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		shouldShowDropZone = false;

		const files = e.dataTransfer?.files;
		if (!files) return;

		let dirHandle = getDirEntryHandle($currentPath.currentEntryID);

		let entriesData: string[] = [];
		let entries: EntryDataBasic[] = [];
		for await (const file of files) {
			if (!file.name) continue;

			try {
				// Get the file name without the extension else use the full name
				const dotIndex = file.name.lastIndexOf('.');
				const newFilename = file.name.substring(0, dotIndex === -1 ? file.name.length : dotIndex);

				entries.push({
					name: newFilename,
					icon: '📝',
					type: 'file'
				});

				entriesData.push(await file.text());
			} catch (error) {
				continue;
			}
		}
		await createEntries(entries, await dirHandle, entriesData);

		invalidate('entries:explorer-loader');
	}

	function handleDragEnter(e: DragEvent) {
		if (!e.dataTransfer) return;

		// Check if any of the dragged items are kind of file
		for (const item of e.dataTransfer.items) {
			if (item.kind === 'file') {
				shouldShowDropZone = true;
				return;
			}
		}
	}
</script>

{#if shouldShowDropZone}
	<div
		id="drop-zone"
		class="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center gap-10 bg-background bg-opacity-70"
		transition:fade={{ duration: 80 }}
		on:dragover={(e) => {
			e.preventDefault();
			shouldShowDropZone = true;
		}}
		on:dragleave={() => {
			shouldShowDropZone = false;
		}}
		on:drop={handleDrop}
	>
		<File size={40} class="text-foreground" />
		<span class="text-xl font-bold text-foreground">Drop Files Here!</span>
	</div>

	<div class="bg-background" />
{/if}
