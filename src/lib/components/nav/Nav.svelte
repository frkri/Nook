<script lang="ts">
	import type { EntryDataBasic } from '$lib/types';

	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { createEntries, getDirEntryHandle } from '$lib/client/explorer';
	import ActionModal from '$lib/components/popup/actionModal.svelte';
	import { currentPath } from '$lib/store/currentPath';
	import { viewTypeList } from '$lib/store/userPreferences';
	import { ChevronLeft, File, Folder, Home, LayoutGrid, List, Plus } from 'lucide-svelte';

	let dropdownOpen = false;
	let inputOpen = false;

	let pathInput = '';
	currentPath.subscribe((path) => {
		pathInput = path.pathData.map((path) => path.name).join('/');
	});

	let newEntry: EntryDataBasic = {
		type: 'file',
		name: '',
		icon: ''
	};
</script>

<!-- Entry edit modal -->
<ActionModal bind:open={inputOpen} title="Create new {newEntry.type}">
	<div class="flex justify-around gap-2 sm:m-3">
		<input
			bind:value={newEntry.icon}
			maxlength="2"
			class="border-main inline-flex w-9 items-center justify-center rounded-lg bg-accents7 p-1 text-xl dark:bg-accents2"
		/>
		<input
			bind:value={newEntry.name}
			maxlength="30"
			placeholder={newEntry.type === 'file' ? 'New Note' : 'New Folder'}
			class="border-main min-w-0 flex-1 bg-foreground p-2 font-bold placeholder:text-accents4 dark:bg-background dark:text-primary"
		/>
	</div>
	<div class="flex justify-around">
		<button
			class="button secondary"
			on:click={() => {
				inputOpen = false;
			}}
		>
			Cancel
		</button>
		<button
			class="button normal"
			on:click={async () => {
				if (newEntry.name.length === 0 || newEntry.icon.length === 0) return;
				inputOpen = false;
				await createEntries([newEntry], await getDirEntryHandle($currentPath.currentEntryID));
				await invalidate('entries:explorer-loader');
				// Reset the newEntry object
				newEntry.name = '';
				newEntry.icon = '';
			}}
		>
			Create
		</button>
	</div>
</ActionModal>

<!-- Entry creation type picker dropdown -->
<ActionModal bind:open={dropdownOpen}>
	<button
		role="menuitem"
		aria-label="Create a new folder"
		id="folder"
		class="button secondary flex w-full gap-1 border-none hover:bg-accents7 dark:hover:bg-accents2"
		on:click={() => {
			newEntry.type = 'directory';
			newEntry.icon = '📁';

			inputOpen = true;
			dropdownOpen = false;
		}}><Folder class="w-4" />Folder</button
	>
	<button
		role="menuitem"
		aria-label="Create a new note"
		id="note"
		class="button secondary flex w-full gap-1 border-none hover:bg-accents7 dark:hover:bg-accents2"
		on:click={() => {
			newEntry.type = 'file';
			newEntry.icon = '📝';

			inputOpen = true;
			dropdownOpen = false;
		}}><File class="w-4" />Note</button
	>
</ActionModal>

<nav
	class="fixed top-0 z-10 flex h-[60px] w-full items-center border-b border-b-accents2 bg-foreground pl-5 pr-5 dark:bg-background"
>
	<div class="group flex h-[40px] w-full gap-2">
		<!-- Navigation path and back button -->
		<span
			class="line-clamp-1 flex flex-1 flex-row items-center gap-4 text-ellipsis text-2xl font-bold"
		>
			<a href="/" class="button normal" aria-label="Navigate to parent directory">
				<Home />
			</a>
			<a
				href={'/explorer/' + $currentPath.pathID.slice(0, -1).join('/')}
				class="button normal"
				aria-label="Navigate to parent directory"
			>
				<ChevronLeft />
			</a>
			<input
				class="flex-1 overflow-scroll bg-foreground outline-none placeholder:text-accents6 dark:bg-background dark:text-primary dark:placeholder:text-accents2"
				placeholder="Path"
				aria-label="Navigation path input field"
				autocorrect="false"
				type="text"
				name="path"
				bind:value={pathInput}
				on:change={async () => {
					// Remove trailing slash
					if (pathInput.endsWith('/')) {
						pathInput = pathInput.slice(0, -1);
					}
					await currentPath.setPathFromName(pathInput.split('/'));
					// Check if last item in path is a file
					if ($currentPath?.pathData[$currentPath.pathData.length - 1]?.type === 'file') {
						await goto('/editor/' + $currentPath.pathID.join('/'));
					} else {
						await goto('/explorer/' + $currentPath.pathID.join('/'));
						await invalidate('entries:explorer-loader');
					}
				}}
			/>
		</span>

		{#if $page.url.pathname.startsWith('/explorer')}
			<div class="hidden gap-1 rounded-lg border border-accents2 p-1 sm:flex" role="radiogroup">
				<button
					class="group flex items-center rounded p-1 aria-checked:bg-accents2 aria-[checked='true']:hidden dark:aria-checked:bg-accents2 sm:aria-[checked='true']:flex"
					aria-checked={!$viewTypeList}
					aria-label="Switch to list view"
					role="radio"
					on:click={() => viewTypeList.set(false)}
				>
					<List class="switch w-6" />
				</button>
				<button
					class="group flex items-center rounded p-1 aria-checked:bg-accents2 aria-[checked='true']:hidden dark:aria-checked:bg-accents2 sm:aria-[checked='true']:flex"
					aria-checked={$viewTypeList}
					aria-label="Switch to grid view"
					role="radio"
					on:click={() => viewTypeList.set(true)}
				>
					<LayoutGrid class="switch w-6" />
				</button>
			</div>

			<button
				role="menu"
				aria-label="Create New Entry"
				aria-owns="folder note"
				class="button normal"
				on:click={() => (dropdownOpen = !dropdownOpen)}
			>
				<span class="hidden sm:inline-block">New</span>
				<Plus />
			</button>
		{/if}
	</div>
</nav>
