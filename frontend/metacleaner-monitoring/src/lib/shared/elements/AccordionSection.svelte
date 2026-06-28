<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		icon?: string;
		open: boolean;
		ontoggle: () => void;
		titleSuffix?: Snippet;
		headerRight?: Snippet;
		contentClass?: string;
		children: Snippet;
	}

	let {
		title,
		icon,
		open,
		ontoggle,
		titleSuffix,
		headerRight,
		contentClass = 'px-4 pb-4',
		children
	}: Props = $props();
</script>

<section class="bg-card border border-surface rounded-xl overflow-hidden">
	<button
		class="w-full flex items-center justify-between p-4"
		style="min-height:52px"
		onclick={ontoggle}
	>
		<div class="flex items-center gap-2">
			{#if icon}
				<i class="fa-solid {icon} text-textSec text-sm"></i>
			{/if}
			<h3 class="text-sm font-semibold text-textMain">{title}</h3>
			{#if titleSuffix}
				{@render titleSuffix()}
			{/if}
		</div>
		<div class="flex items-center gap-2">
			{#if headerRight}
				{@render headerRight()}
			{/if}
			<i
				class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {open
					? 'rotate-180'
					: ''}"
			></i>
		</div>
	</button>
	{#if open}
		<div class={contentClass}>
			{@render children()}
		</div>
	{/if}
</section>
