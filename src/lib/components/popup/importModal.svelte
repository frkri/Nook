<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { importEntry } from '$lib/client/explorer';
	import { fetchRemoteFile } from '$lib/client/utils';
	import ActionModal from '$lib/components/popup/actionModal.svelte';
	import { File, Link } from 'lucide-svelte';

	export let open = false;
	export let dirHandle: FileSystemDirectoryHandle;

	export let openUrl = false;

	export let importUrl = '';
	let files: FileList | null = null;

	async function importRoot(content: string) {
		let obj = JSON.parse(content);
		await importEntry(obj, dirHandle);

		invalidateAll();
	}
</script>

<ActionModal {open} title="Import Bucket from">
	<div class="flex flex-col gap-2">
		<button
			class="button secondary"
			on:click={() => {
				open = false;
				openUrl = true;
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
				open = false;
				if (!files) return;
				importRoot(await files[0].text());
			}}
		/>
	</div>
</ActionModal>

<ActionModal open={openUrl} title="URL to import">
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
				openUrl = false;
			}}
		>
			Cancel
		</button>
		<button
			class="button main"
			on:click={async () => {
				if (importUrl.length === 0) return;

				const result = await fetchRemoteFile(new URL(importUrl));
				if (!result) return;

				openUrl = false;
				importRoot(result);
				importUrl = '';

				// Reset to home
				goto('/');
			}}
		>
			Import
		</button>
	</div>
</ActionModal>
