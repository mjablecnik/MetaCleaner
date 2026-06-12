<script lang="ts">
	interface Props {
		icon: string;
		label: string;
		variant: 'before' | 'after';
		valueText: string;
		compact?: boolean;
	}

	const { icon, label, variant, valueText, compact = false }: Props = $props();

	const accentClass = $derived(variant === 'before' ? 'text-brand-red' : 'text-brand-green');
	const bgClass = $derived(compact ? 'bg-navy-main px-3 py-2.5' : 'bg-navy-card px-4 py-2.5');
</script>

<div class="flex items-center justify-between rounded-lg border border-gray-800 {bgClass}">
	<span class="flex items-center gap-2 text-xs text-text-muted">
		<i class="fa-solid {icon} {accentClass}"></i>
		{label}
	</span>
	{#if variant === 'after'}
		<span class="flex items-center gap-1 font-mono text-xs {accentClass}">
			<i class="fa-solid fa-check"></i>
			{valueText}
		</span>
	{:else}
		<span class="font-mono text-xs text-white">{valueText}</span>
	{/if}
</div>
