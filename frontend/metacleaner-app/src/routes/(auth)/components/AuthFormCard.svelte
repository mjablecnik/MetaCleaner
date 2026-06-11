<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		subtitle?: string;
		children: Snippet;
	}

	let { title, subtitle, children }: Props = $props();
</script>

<div class="flex flex-col gap-5 rounded-2xl border border-gray-800 bg-navy-card p-5 shadow-card lg:gap-6 lg:p-8">
	<div class="flex flex-col gap-0.5 lg:gap-1">
		<h2 class="text-xl font-bold text-white lg:text-2xl">{title}</h2>
		{#if subtitle}
			<p class="text-xs text-text-muted lg:text-sm">{subtitle}</p>
		{/if}
	</div>
	{@render children()}
</div>
