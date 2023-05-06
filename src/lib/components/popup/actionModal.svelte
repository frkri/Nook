<script lang="ts">
	import Portal from 'svelte-portal';
	import { fade } from 'svelte/transition';

	export let open = false;
	export let title = '';

	$: if (open) {
		document.addEventListener('keydown', handleKeyDown, true);
	} else {
		document.removeEventListener('keydown', handleKeyDown, true);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}
</script>

{#if open}
	<Portal target="#portal-target">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="fixed bottom-0 left-0 z-10 flex h-screen w-screen items-end justify-center bg-background bg-opacity-40 p-5"
			transition:fade={{ duration: 60 }}
			on:click={(e) => {
				if (e.target === e.currentTarget) {
					open = false;
				}
			}}
		>
			<div class="border-main flex h-60 w-full max-w-5xl flex-col justify-around bg-background p-3">
				{#if title}
					<h2 class="border-b pb-2 text-xl font-bold">{title}</h2>
				{/if}
				<slot />
			</div>
		</div>
	</Portal>
{/if}
