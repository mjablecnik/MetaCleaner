<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description: string;
		badge?: Snippet;
	}

	let { title, description, badge }: Props = $props();
</script>

<div class="flex flex-col gap-1 mb-0 lg:mb-2">
	{#if badge}
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
			<div>
				<h1 class="text-2xl lg:text-3xl font-bold text-white">{title}</h1>
				<p class="text-text-muted text-sm mt-1">{description}</p>
			</div>
			{@render badge()}
		</div>
	{:else}
		<h1 class="text-2xl lg:text-3xl font-bold text-white">{title}</h1>
		<p class="text-text-muted text-sm mt-1">{description}</p>
	{/if}
</div>
