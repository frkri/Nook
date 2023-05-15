<script lang="ts">
	import type { EntryData } from '$lib/types';

	import { getEntriesByID } from '$lib/client/explorer';
	import Item from '$lib/components/entries/Item.svelte';
	import { recentNotes } from '$lib/store/recentNotes';
	import { ArrowRight, Download, Upload } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let recent = [] as EntryData[];

	onMount(async () => {
		recent = (await getEntriesByID($recentNotes)) as EntryData[];
	});
</script>

<div class="m-4">
	<div class="flex min-h-screen flex-col items-center justify-center gap-10">
		<div class="flex flex-col items-center gap-4">
			<h1 class="text-4xl font-bold">Welcome to Nook.</h1>
			<p class="text-lg">
				Nook is a simple note-taking app that allows you to create, edit, and delete notes.
			</p>
		</div>

		<a href="/explorer" class="button normal flex items-center justify-center p-6">
			Open Explorer <ArrowRight />
		</a>

		<div class="flex flex-col items-center justify-center">
			{#if recent.length > 0}
				<label for="recent-notes" class="mb-2 text-lg font-bold">Recent Notes</label>
				<div id="recent-notes" class="flex max-w-2xl flex-wrap gap-2">
					{#each recent as entry}
						<Item {entry} />
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="mx-auto mt-14 grid h-48 w-full max-w-md grid-cols-2">
		<button
			class="normal flex flex-col items-center justify-center rounded-l-lg border p-4 transition"
		>
			<Upload size={40} />
			<span class="font-bold">Import</span>
		</button>

		<button
			class="normal flex flex-col items-center justify-center rounded-r-lg border p-4 transition"
		>
			<Download size={40} />
			<span class="font-bold">Export</span>
		</button>
	</div>
</div>
