<script lang="ts">
	export let open = false;

	// optional title
	export let title = '';
</script>

{#if open}
	<div class="fixed bottom-0 left-0 flex w-screen justify-center p-5">
		<div class="border-main flex h-56 flex-col justify-around p-3 md:w-1/2">
			{#if title}
				<h2 class="border-b text-xl font-bold">{title}</h2>
			{/if}
			<slot />
		</div>
	</div>
{/if}
