<script lang="ts">
	import type { EntryData } from '$lib/types';

	import { page } from '$app/stores';
	import { exportEntry, getEntriesByID } from '$lib/client/explorer';
	import { downloadFile } from '$lib/client/utils';
	import Item from '$lib/components/Item.svelte';
	import ImportModal from '$lib/components/popup/importModal.svelte';
	import { recentNotes } from '$lib/store/recentNotes';
	import { ArrowRight, Download, Upload } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let recent = [] as EntryData[];
	let dirHandle: FileSystemDirectoryHandle;

	let importModalOpen = false;
	let importModalUrlOpen = false;
	let importUrl = '';

	onMount(async () => {
		recent = (await getEntriesByID($recentNotes)) as EntryData[];
		dirHandle = await navigator.storage.getDirectory();

		importUrl = $page.url.searchParams.get('import') || '';
		if (importUrl.length > 0) {
			importModalUrlOpen = true;
		}
	});

	async function exportRoot() {
		let root = await navigator.storage.getDirectory();
		let obj = await exportEntry(root);
		downloadFile(`Nook-export-${Date.now()}`, 'json', 'application/json', JSON.stringify(obj));
	}
</script>

<ImportModal open={importModalOpen} openUrl={importModalUrlOpen} {importUrl} {dirHandle} />

<div class="m-4">
	<div class="grid min-h-screen flex-col items-center justify-center gap-10">
		<div class="flex flex-col items-center gap-4">
			<h1 class="text-4xl font-black tracking-wider">
				Welcome to <span
					class="bg-gradient-to-r from-[#1e8b6e] to-[#0c8699] bg-clip-text text-transparent"
				>
					Nook.
				</span>
			</h1>
			<p class="text-center text-lg">
				Nook is a lightweight and simple note-taking app that supports offline usage and Markdown
			</p>
			<a href="/explorer" class="button main flex items-center justify-center p-6">
				Open Explorer <ArrowRight />
			</a>
		</div>

		<div class="flex flex-col items-center justify-center">
			{#if recent.length > 0}
				<label for="recent-notes" class="mb-2 text-lg font-bold">Recent Notes</label>
				<div id="recent-notes" class="flex w-full max-w-md flex-col gap-2">
					{#each recent as entry (entry.id)}
						<Item {entry} />
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="mx-auto mt-14 grid h-48 w-full max-w-md grid-cols-2">
		<button
			class="main flex cursor-pointer flex-col items-center justify-center rounded-l-lg border p-4 transition"
			on:click={() => (importModalOpen = true)}
		>
			<Download size={40} />
			<span class="font-bold">Import</span>
		</button>

		<button
			class="main flex flex-col items-center justify-center rounded-r-lg border p-4 transition"
			on:click={exportRoot}
		>
			<Upload size={40} />
			<span class="font-bold">Export</span>
		</button>
	</div>
</div>
