<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description: string;
		badge?: Snippet;
	}

	let { title, description, badge }: Props = $props();
</script>

<div class="mb-0 flex flex-col gap-1 lg:mb-2">
	{#if badge}
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold text-white lg:text-3xl">{title}</h1>
				<p class="mt-1 text-sm text-text-muted">{description}</p>
			</div>
			{@render badge()}
		</div>
	{:else}
		<h1 class="text-2xl font-bold text-white lg:text-3xl">{title}</h1>
		<p class="mt-1 text-sm text-text-muted">{description}</p>
	{/if}
</div>
