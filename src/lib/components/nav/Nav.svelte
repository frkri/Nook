<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { createEntries, getDirEntryHandle } from '$lib/client/explorer';
	import { currentPath } from '$lib/store/currentPath';
	import { viewType } from '$lib/store/viewType';
	import { ChevronLeft, File, Folder, LayoutGrid, List, Plus } from 'lucide-svelte';
	import ActionModal from '../popup/actionModal.svelte';

	let dropdownOpen = false;
	let inputOpen = false;

	let pathInput = '';
	currentPath.subscribe(async (path) => {
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
	<div class="m-3 flex justify-around gap-2">
		<input
			bind:value={newEntry.icon}
			required={true}
			maxlength="2"
			class="inline-flex w-9 items-center justify-center rounded-lg bg-accents2 p-1 text-xl"
		/>
		<input
			bind:value={newEntry.name}
			required={true}
			maxlength="25"
			placeholder={newEntry.type === 'file' ? 'New Note' : 'New Folder'}
			class="border-main inline-inline-block min-w-0 flex-1 bg-background p-2 font-bold text-primary placeholder:text-accents4"
		/>
	</div>
	<div class="flex justify-around">
		<button
			class="button normal"
			on:click={() => {
				inputOpen = false;
			}}
		>
			Cancel
		</button>
		<button
			class="button normal"
			on:click={async () => {
				inputOpen = false;
				await createEntries([newEntry], await getDirEntryHandle($currentPath.currentDirID));
				await invalidate('entries:loader');
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
		class="flex w-full gap-1 rounded p-2 hover:bg-accents2"
		on:click={() => {
			newEntry.type = 'directory';
			newEntry.icon = '📁';

			inputOpen = true;
			dropdownOpen = false;
		}}><Folder class="w-4" />Folder</button
	>
	<button
		role="menuitem"
		class="flex w-full gap-1 rounded p-2 hover:bg-accents2"
		on:click={() => {
			newEntry.type = 'file';
			newEntry.icon = '📝';

			inputOpen = true;
			dropdownOpen = false;
		}}><File class="w-4" />Note</button
	>
</ActionModal>

<nav
	class="fixed top-0 z-10 flex h-[60px] w-full items-center border-b border-b-accents2 bg-background pl-5 pr-5"
>
	<div class="flex h-[40px] w-full gap-2">
		<span
			class="line-clamp-1 flex flex-1 flex-row items-center gap-4 text-ellipsis text-2xl font-bold"
		>
			<button
				class="button normal"
				on:click={() => {
					goto('/explorer/' + $currentPath.pathID.slice(0, -1).join('/'));
				}}
			>
				<ChevronLeft />
			</button>
			<input
				class="flex-1 bg-background outline-none"
				bind:value={pathInput}
				on:change={async () => {
					// remove trailing slash
					if (pathInput.endsWith('/')) {
						pathInput = pathInput.slice(0, -1);
					}
					await currentPath.setPathFromName(pathInput.split('/'));
					await goto('/explorer/' + $currentPath.pathID.join('/'));
					await invalidate('entries:loader');
				}}
				autocorrect="false"
				type="text"
				name="path"
			/>
		</span>

		<div class="hidden gap-1 rounded-lg border border-accents2 p-1 sm:flex" role="radiogroup">
			<button
				class="group flex items-center rounded p-1 aria-checked:bg-accents2"
				aria-checked={!$viewType}
				aria-label="Switch to list view"
				role="radio"
				on:click={() => viewType.set(false)}
			>
				<List
					class="w-6 stroke-accents2 transition hover:stroke-primary group-aria-checked:stroke-primary"
				/>
			</button>
			<button
				class="group flex items-center rounded p-1 aria-checked:bg-accents2"
				aria-checked={$viewType}
				aria-label="Switch to grid view"
				role="radio"
				on:click={() => viewType.set(true)}
			>
				<LayoutGrid
					class="w-6 stroke-accents2 transition hover:stroke-primary group-aria-checked:stroke-primary"
				/>
			</button>
		</div>

		<div>
			<button role="menu" class="button normal" on:click={() => (dropdownOpen = !dropdownOpen)}>
				<span class="hidden sm:inline-block">New</span>
				<Plus />
			</button>
		</div>
	</div>
</nav>
