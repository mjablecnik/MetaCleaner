<script lang="ts">
	import type { Snippet } from 'svelte';

	type BorderColor = 'default' | 'red' | 'blue' | 'green' | 'orange';

	interface Props {
		title: string;
		icon?: string;
		open?: boolean;
		borderColor?: BorderColor;
		headerContent?: Snippet;
		children?: Snippet;
		class?: string;
	}

	let {
		title,
		icon,
		open = $bindable(false),
		borderColor = 'default',
		headerContent,
		children,
		class: extraClass = '',
	}: Props = $props();

	const borderMap: Record<BorderColor, string> = {
		default: 'border-gray-800',
		red: 'border-brand-red/30',
		blue: 'border-brand-blue/30',
		green: 'border-brand-green/30',
		orange: 'border-brand-orange/30',
	};
</script>

<div
	class="bg-navy-card rounded-2xl border shadow-card overflow-hidden {borderMap[borderColor]} {extraClass}"
>
	<button
		type="button"
		onclick={() => (open = !open)}
		class="w-full flex items-center justify-between px-4 py-3.5"
	>
		<div class="flex items-center gap-2 min-w-0">
			{#if icon}
				<i class="{icon} text-text-muted text-sm flex-shrink-0"></i>
			{/if}
			<span class="text-sm font-semibold text-white">{title}</span>
			{@render headerContent?.()}
		</div>
		<i
			class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform flex-shrink-0 ml-2 {open
				? 'rotate-180'
				: ''}"
		></i>
	</button>
	{#if open}
		<div class="px-4 pb-4">
			{@render children?.()}
		</div>
	{/if}
</div>
