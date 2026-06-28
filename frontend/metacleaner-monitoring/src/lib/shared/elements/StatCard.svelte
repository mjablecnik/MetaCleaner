<script lang="ts">
	import { t } from '$lib/i18n';
	import type { Snippet } from 'svelte';

	interface Props {
		labelKey: string;
		value: string;
		valueClass?: string;
		icon?: string;
		iconClass?: string;
		trend?: string;
		trendPositive?: boolean;
		barWidth?: string;
		barClass?: string;
		subtext?: string;
		subtextKey?: string;
		topRight?: Snippet;
	}

	let {
		labelKey,
		value,
		valueClass = 'text-textMain',
		icon,
		iconClass = '',
		trend,
		trendPositive = true,
		barWidth,
		barClass,
		subtext,
		subtextKey,
		topRight
	}: Props = $props();
</script>

<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-5 shadow-sm">
	<div class="flex justify-between items-start mb-3 lg:mb-4">
		<h3 class="text-textSec text-sm font-medium">{t(labelKey)}</h3>
		{#if topRight}
			{@render topRight()}
		{:else if icon}
			<i class="fa-solid {icon} {iconClass}"></i>
		{/if}
	</div>
	<div class="flex items-end gap-2">
		<span class="text-3xl font-bold tracking-tight {valueClass}">{value}</span>
		{#if trend}
			<span
				class="text-sm font-medium mb-1 flex items-center px-1.5 py-0.5 rounded lg:bg-transparent lg:px-0 lg:py-0 {trendPositive
					? 'text-success bg-success/10'
					: 'text-error bg-error/10'}"
			>
				{trend}
			</span>
		{/if}
	</div>
	{#if barWidth !== undefined}
		<div class="mt-3 lg:mt-2 h-1.5 lg:h-1 w-full bg-surface rounded-full overflow-hidden">
			<div class="h-full {barClass ?? ''} {barWidth} rounded-full"></div>
		</div>
	{/if}
	{#if subtext || subtextKey}
		<p class="text-xs lg:text-sm text-textSec mt-2">
			{subtext ?? (subtextKey ? t(subtextKey) : '')}
		</p>
	{/if}
</div>
