<script lang="ts">
	interface Props {
		value: number;
		max?: number;
		color?: string;
		label?: string;
		showPercent?: boolean;
		height?: 'sm' | 'md';
	}

	let {
		value,
		max = 100,
		color = 'bg-primary',
		label,
		showPercent = false,
		height = 'md'
	}: Props = $props();

	const percent = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
	const heightClass = $derived(height === 'sm' ? 'h-1' : 'h-1.5');
</script>

{#if label || showPercent}
	<div class="flex justify-between items-center mb-1.5">
		{#if label}
			<span class="text-sm text-textSec">{label}</span>
		{/if}
		{#if showPercent}
			<span class="text-sm font-semibold text-textMain">{percent.toFixed(1)}%</span>
		{/if}
	</div>
{/if}
<div class="w-full {heightClass} bg-surface rounded-full overflow-hidden">
	<div class="h-full {color} rounded-full" style="width:{percent}%"></div>
</div>
