<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="mx-auto flex w-80 flex-col items-center justify-center gap-5">
	<p class="text-6xl font-bold">
		{$page.status}
	</p>
	<h1 class="text-xl font-bold">An error has occurred!</h1>
	<p>
		{$page.error?.message}
	</p>
	<a href="/explorer" class="button normal">Return to Explorer</a>
</div>
