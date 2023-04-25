<script lang="ts">
	import { viewTypeEditor } from '$lib/store/viewType';
	import { Edit, FileText, Trash } from 'lucide-svelte';

	let modalConfirm = false;
</script>

<main class="flex-1 p-4 flex flex-col gap-5">
	<h1 class="text-lg line-clamp-1 font-bold">
		{'Lorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem Ipsum'}
	</h1>
	<div class="flex justify-between">
		<div class="gap-1 rounded-lg border border-accents2 p-1 flex" role="radiogroup">
			<button
				class="group w-28 justify-between flex items-center rounded gap-1 p-1 aria-checked:bg-accents2 aria-[checked='true']:hidden sm:aria-[checked='true']:flex"
				aria-checked={!$viewTypeEditor}
				aria-label="Switch to edit mode"
				role="radio"
				on:click={() => viewTypeEditor.set(false)}
			>
				<Edit
					class="w-6 stroke-accents2 transition group-hover:stroke-primary group-aria-checked:stroke-primary"
				/>
				<span
					class="text-secondary transition group-hover:text-primary group-aria-checked:text-primary"
				>
					Edit
				</span>
			</button>
			<button
				class="group w-28 flex items-center justify-between rounded p-1 gap-2 aria-checked:bg-accents2 aria-[checked='true']:hidden sm:aria-[checked='true']:flex"
				aria-checked={$viewTypeEditor}
				aria-label="Switch to preview mode"
				role="radio"
				on:click={() => viewTypeEditor.set(true)}
			>
				<FileText
					class="w-6 stroke-accents2 transition group-hover:stroke-primary group-aria-checked:stroke-primary"
				/>
				<span
					class="text-secondary transition group-hover:text-primary group-aria-checked:text-primary"
				>
					Preview
				</span>
			</button>
		</div>

		<button class="button alert trans">
			<Trash />
		</button>
	</div>
	<textarea name="" class="bg-background p-2 h-1/2 border rounded border-accents3" />
</main>
