<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { createEntries, getDirEntryHandle } from '$lib/client/explorer';
	import { isAudio, isImage, isText, isVideo } from '$lib/client/utils';
	import { currentPath } from '$lib/store/currentPath';
	import type { EntryDataBasic, EntryType } from '$lib/types';
	import { File } from 'lucide-svelte';
	import { onMount } from 'svelte';
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
		let entriesData: (string | ArrayBuffer)[] = [];
		let entries: EntryDataBasic[] = [];

		for await (const file of files) {
			if (!file.name) continue;
			// Get the file name without the extension else use the full name
			let newFilename = file.name;

			// Determine the file type, if it's a markdown or text file, it's a note
			let type: EntryType = 'note';
			let icon = '📝';
			if (isText(file.name)) {
				// Remove the extension from the filename
				const dotIndex = file.name.lastIndexOf('.');
				newFilename = file.name.substring(0, dotIndex === -1 ? file.name.length : dotIndex);

				entriesData.push(await file.text());
			} else if (isImage(file.name)) {
				type = 'image';
				icon = '🖼️';
			} else if (isAudio(file.name)) {
				type = 'audio';
				icon = '🎵';
			} else if (isVideo(file.name)) {
				type = 'video';
				icon = '🎥';
			}

			entries.push({
				name: newFilename,
				icon,
				type
			});

			// Fetch the file data
			if (type === 'note') entriesData.push(await file.text());
			else entriesData.push(await file.arrayBuffer());
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
