<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { createEntries, getDirEntryHandle } from '$lib/client/explorer';
	import { currentPath } from '$lib/store/currentPath';
	import { viewTypeList } from '$lib/store/userPreferences';
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
	<div class="flex justify-around gap-2 sm:m-3">
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
			class="border-main min-w-0 flex-1 bg-background p-2 font-bold text-primary placeholder:text-accents4"
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
				inputOpen = false;
				await createEntries([newEntry], await getDirEntryHandle($currentPath.currentEntryID));
				await invalidate('entries:explorer-loader');
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
		aria-label="Create a new note"
		id="note"
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
	class="sticky z-10 flex h-[60px] w-full items-center border-b border-b-accents2 bg-background pl-5 pr-5"
>
	<div class="group flex h-[40px] w-full gap-2">
		<!-- Navigation path and back button -->
		<span
			class="line-clamp-1 flex flex-1 flex-row items-center gap-4 text-ellipsis text-2xl font-bold"
		>
			<a
				href={'/explorer/' + $currentPath.pathID.slice(0, -1).join('/')}
				class="button normal"
				aria-label="Navigate to parent directory"
			>
				<ChevronLeft />
			</a>
			<input
				class="flex-1 bg-background outline-none"
				aria-label="Navigation path input field"
				bind:value={pathInput}
				on:change={async () => {
					// Remove trailing slash
					if (pathInput.endsWith('/')) {
						pathInput = pathInput.slice(0, -1);
					}
					await currentPath.setPathFromName(pathInput.split('/'));
					await goto('/explorer/' + $currentPath.pathID.join('/'));
					await invalidate('entries:explorer-loader');
				}}
				autocorrect="false"
				type="text"
				name="path"
			/>
		</span>

		<div class="flex gap-1 rounded-lg border border-accents2 p-1" role="radiogroup">
			<button
				class="group flex items-center rounded p-1 aria-checked:bg-accents2 aria-[checked='true']:hidden sm:aria-[checked='true']:flex"
				aria-checked={!$viewTypeList}
				aria-label="Switch to list view"
				role="radio"
				on:click={() => viewTypeList.set(false)}
			>
				<List
					class="w-6 stroke-accents2 transition hover:stroke-primary group-focus:stroke-primary group-aria-checked:stroke-primary"
				/>
			</button>
			<button
				class="group flex items-center rounded p-1 aria-checked:bg-accents2 aria-[checked='true']:hidden sm:aria-[checked='true']:flex"
				aria-checked={$viewTypeList}
				aria-label="Switch to grid view"
				role="radio"
				on:click={() => viewTypeList.set(true)}
			>
				<LayoutGrid
					class="w-6 stroke-accents2 transition hover:stroke-primary group-focus:stroke-primary group-aria-checked:stroke-primary"
				/>
			</button>
		</div>

		<div>
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
		</div>
	</div>
</nav>
