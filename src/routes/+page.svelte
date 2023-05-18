<script lang="ts">
	import type { EntryData } from '$lib/types';

	import { exportEntry, getEntriesByID } from '$lib/client/explorer';
	import { downloadFile } from '$lib/client/utils';
	import Item from '$lib/components/Item.svelte';
	import DeleteEntryModal from '$lib/components/popup/deleteEntryModal.svelte';
	import ImportModal from '$lib/components/popup/importModal.svelte';
	import { recentNotes } from '$lib/store/recentNotes';
	import { ArrowRight, Download, Trash, Upload } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let recent = [] as EntryData[];
	let dirHandle: FileSystemDirectoryHandle;

	onMount(async () => {
		recent = (await getEntriesByID($recentNotes)) as EntryData[];
		dirHandle = await navigator.storage.getDirectory();
	});

	let importModalOpen = false;

	async function exportRoot() {
		let root = await navigator.storage.getDirectory();
		let obj = await exportEntry(root);
		downloadFile(`Nook-export-${Date.now()}`, 'json', 'application/json', JSON.stringify(obj));
	}
</script>

<ImportModal open={importModalOpen} {dirHandle} />

<div class="m-4">
	<div class="flex min-h-screen flex-col items-center justify-center gap-10">
		<div class="flex flex-col items-center gap-4">
			<h1 class="text-4xl font-bold">Welcome to Nook.</h1>
			<p class="text-lg">
				Nook is a simple offline note-taking app that allows you to create, edit, and delete notes.
			</p>
		</div>

		<a href="/explorer" class="button normal flex items-center justify-center p-6">
			Open Explorer <ArrowRight />
		</a>

		<div class="flex flex-col items-center justify-center">
			{#if recent.length > 0}
				<label for="recent-notes" class="mb-2 text-lg font-bold">Recent Notes</label>
				<div id="recent-notes" class="flex w-96 max-w-md flex-col gap-2">
					{#each recent as entry (entry.id)}
						<Item {entry} />
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="mx-auto mt-14 grid h-48 w-full max-w-md grid-cols-2">
		<button
			class="normal flex cursor-pointer flex-col items-center justify-center rounded-l-lg border p-4 transition"
			on:click={() => (importModalOpen = true)}
		>
			<Download size={40} />
			<span class="font-bold">Import</span>
		</button>

		<button
			class="normal flex flex-col items-center justify-center rounded-r-lg border p-4 transition"
			on:click={exportRoot}
		>
			<Upload size={40} />
			<span class="font-bold">Export</span>
		</button>
	</div>
</div>
