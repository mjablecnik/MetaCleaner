<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		subtitle?: string;
		titleRight?: Snippet;
		class?: string;
		children: Snippet;
	}

	let { title, subtitle, titleRight, class: className = '', children }: Props = $props();
</script>

<div
	class="bg-card border border-surface rounded-2xl lg:rounded-xl p-4 lg:p-5 shadow-sm {className}"
>
	<div class="flex justify-between items-start lg:items-center mb-4 lg:mb-6">
		<div>
			<h3 class="text-base lg:text-lg font-semibold text-textMain">{title}</h3>
			{#if subtitle}
				<p class="text-xs text-textSec mt-0.5">{subtitle}</p>
			{/if}
		</div>
		{#if titleRight}
			{@render titleRight()}
		{/if}
	</div>
	{@render children()}
</div>
