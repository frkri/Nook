<script lang="ts">
	import { tick } from 'svelte';
	import Portal from 'svelte-portal';
	import { fade, scale } from 'svelte/transition';

	export let open = false;
	export let title = '';

	$: if (!open) {
		document.removeEventListener('keydown', handleKeyDown, true);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}

	function useNode(node: HTMLElement) {
		document.addEventListener('keydown', handleKeyDown, true);

		// Wait for the DOM to update
		tick().then(() => {
			var firstInputElement = node.querySelector<HTMLElement>(
				'input:first-child, button:first-child'
			);

			// Focus the first input or button
			if (firstInputElement) firstInputElement?.focus();
		});
	}
</script>

{#if open}
	<Portal target="#portal">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="fixed left-0 top-0 z-10 flex h-screen w-screen items-end justify-center bg-background bg-opacity-40"
			transition:fade={{ duration: 60 }}
			on:click={(e) => {
				if (e.target === e.currentTarget) {
					open = false;
				}
			}}
		>
			<div
				class="border-main mx-2 mb-12 flex h-72 w-full max-w-5xl flex-col justify-around bg-foreground p-3 dark:bg-background"
				use:useNode
				in:scale={{ duration: 60, start: 0.95 }}
			>
				{#if title}
					<h2 class="border-b pb-2 text-xl font-bold">{title}</h2>
				{/if}
				<slot />
			</div>
		</div>
	</Portal>
{/if}
