<script lang="ts">
	import type { EntryData } from '$lib/types';

	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { getDirEntryHandle, removeEntries } from '$lib/client/explorer';
	import ActionModal from '$lib/components/popup/actionModal.svelte';
	import { currentPath } from '$lib/store/currentPath';
	import { recentFiles } from '$lib/store/recentFiles';

	export let entry: EntryData;

	export let modalDeleteConfirm = false;
</script>

<ActionModal bind:open={modalDeleteConfirm} title="Delete {entry.type}?">
	<p class="line-clamp-3">
		Are you sure you want to delete <span class="font-bold">{entry.name}</span> and all of its contents?
	</p>
	<div class="flex justify-around">
		<button
			class="button secondary"
			on:click={() => {
				modalDeleteConfirm = false;
			}}
		>
			Cancel
		</button>
		<button
			class="button alert"
			on:click={async () => {
				modalDeleteConfirm = false;

				$recentFiles = $recentFiles.filter((note) => note !== entry.id);
				await removeEntries([entry.id], await getDirEntryHandle(entry.id));
				if ($page.url.pathname.startsWith('/editor'))
					await goto('/explorer/' + $currentPath.pathID.slice(0, -1).join('/'));
				invalidate('entries:explorer-loader');
			}}
		>
			Confirm
		</button>
	</div>
</ActionModal>
