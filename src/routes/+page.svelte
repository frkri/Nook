<script lang="ts">
	import type { EntryData } from '$lib/types';

	import { page } from '$app/stores';
	import { exportEntry, getEntriesByID } from '$lib/client/explorer';
	import { downloadFile } from '$lib/client/utils';
	import Item from '$lib/components/Item.svelte';
	import ImportModal from '$lib/components/popup/importModal.svelte';
	import { homepageSeen } from '$lib/store/homepageSeen';
	import { recentFiles } from '$lib/store/recentFiles';
	import { ArrowRight, Download, Upload } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let recent = [] as EntryData[];
	let dirHandle: FileSystemDirectoryHandle;

	let importModalOpen = false;
	let importModalUrlOpen = false;
	let importUrl = '';

	onMount(async () => {
		recent = (await getEntriesByID($recentFiles)) as EntryData[];
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

<ImportModal
	bind:importModalOpen
	bind:importModalURLOpen={importModalUrlOpen}
	{importUrl}
	{dirHandle}
/>

<div class="m-4">
	<div class="grid min-h-screen flex-col items-center justify-center gap-10">
		<div class="flex flex-col items-center gap-4">
			{#if $homepageSeen}
				<h1 class="text-7xl font-black tracking-wider">
					<span
						class="bg-animate bg-gradient-to-r from-[#000000] via-[#b4b4b4] to-[#000000] bg-clip-text text-transparent dark:from-[#ffffff] dark:via-[#474747] dark:to-[#ffffff]"
					>
						Nook.
					</span>
				</h1>
			{:else}
				<h1 class="text-5xl font-black tracking-wider">
					Welcome to <span
						class="bg-animate bg-gradient-to-r from-[#000000] via-[#b4b4b4] to-[#000000] bg-clip-text text-transparent dark:from-[#ffffff] dark:via-[#474747] dark:to-[#ffffff]"
					>
						Nook.
					</span>
				</h1>
				<p class="text-center text-lg">
					Nook is a lightweight and simple note-taking app that supports offline usage and Markdown
				</p>
			{/if}

			<a href="/explorer/" class="button main flex items-center justify-center p-6">
				Open Explorer <ArrowRight />
			</a>
		</div>

		<div class="flex flex-col items-center justify-center">
			{#if recent.length > 0}
				<label for="recent-notes" class="mb-2 text-lg font-bold">Recent Files</label>
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

<style>
	.bg-animate {
		animation: bg-transition 4s infinite alternate;
		background-size: 800%;
	}

	@keyframes bg-transition {
		from {
			background-position: 0% 50%;
		}
		to {
			background-position: 100% 0%;
		}
	}
</style>
