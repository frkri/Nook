<script lang="ts">
	import type { EntryData } from '$lib/types';

	import { invalidate } from '$app/navigation';
	import { exportEntry, getEntriesByID, importEntry } from '$lib/client/explorer';
	import { downloadFile, fetchRemoteFile } from '$lib/client/utils';
	import Item from '$lib/components/entries/Item.svelte';
	import ActionModal from '$lib/components/popup/actionModal.svelte';
	import { recentNotes } from '$lib/store/recentNotes';
	import { ArrowRight, Download, File, Link, Upload } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let recent = [] as EntryData[];
	onMount(async () => {
		recent = (await getEntriesByID($recentNotes)) as EntryData[];
	});

	let importModalOpen = false;
	let importModalUrlOpen = false;

	let importUrl = '';

	let files: FileList | null = null;

	async function exportRoot() {
		let root = await navigator.storage.getDirectory();
		let obj = await exportEntry(root);
		downloadFile(`Nook-export-${Date.now()}`, 'json', 'application/json', JSON.stringify(obj));
	}

	async function importRoot(content: string) {
		let obj = JSON.parse(content);
		let root = await navigator.storage.getDirectory();
		await importEntry(obj, root);

		invalidate('/');
	}
</script>

<ActionModal open={importModalOpen} title="Import Bucket from">
	<div class="flex flex-col gap-2">
		<button
			class="button secondary"
			on:click={() => {
				importModalOpen = false;
				importModalUrlOpen = true;
			}}
		>
			<Link />Remote
		</button>

		<label for="file-upload" class="button secondary cursor-pointer">
			<File />Local
		</label>
		<input
			id="file-upload"
			type="file"
			class="hidden"
			multiple={false}
			accept="application/json"
			bind:files
			on:change={async () => {
				importModalOpen = false;
				if (!files) return;
				importRoot(await files[0].text());
			}}
		/>
	</div>
</ActionModal>

<ActionModal open={importModalUrlOpen}>
	<div class="flex justify-around gap-2 sm:m-3">
		<input
			bind:value={importUrl}
			placeholder={'https://example.com/bucket.json'}
			class="border-main min-w-0 flex-1 bg-foreground p-2 font-bold placeholder:text-accents4 dark:bg-background dark:text-primary"
		/>
	</div>
	<div class="flex justify-around">
		<button
			class="button secondary"
			on:click={() => {
				importModalUrlOpen = false;
			}}
		>
			Cancel
		</button>
		<button
			class="button normal"
			on:click={async () => {
				if (importUrl.length === 0) return;

				const result = await fetchRemoteFile(new URL(importUrl));
				if (!result) return;

				importModalUrlOpen = false;
				importRoot(result);
			}}
		>
			Import
		</button>
	</div>
</ActionModal>

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
				<div id="recent-notes" class="flex w-full max-w-md flex-col gap-2">
					{#each recent as entry}
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
			<Upload size={40} />
			<span class="font-bold">Import</span>
		</button>

		<button
			class="normal flex flex-col items-center justify-center rounded-r-lg border p-4 transition"
			on:click={exportRoot}
		>
			<Download size={40} />
			<span class="font-bold">Export</span>
		</button>
	</div>
</div>
