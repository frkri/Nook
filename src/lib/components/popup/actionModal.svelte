<script lang="ts">
	import Portal from 'svelte-portal';

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
			class="fixed bottom-0 left-0 flex w-screen h-screen justify-center items-end p-5 z-10 bg-background bg-opacity-40"
			on:click={(e) => {
				if (e.target === e.currentTarget) {
					open = false;
				}
			}}
		>
			<div class="border-main flex h-56 flex-col justify-around p-3 md:w-1/2 bg-background">
				{#if title}
					<h2 class="border-b text-xl font-bold">{title}</h2>
				{/if}
				<slot />
			</div>
		</div>
	</Portal>
{/if}
