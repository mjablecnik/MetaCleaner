<script lang="ts">
	import type { FormatItem } from '$lib/repositories/features';
	import { t } from '$lib/i18n';

	interface Props {
		format: FormatItem;
		size?: 'desktop' | 'mobile';
	}

	const { format, size = 'desktop' }: Props = $props();

	const colorMap: Record<string, string> = {
		'brand-red': 'text-brand-red',
		'brand-orange': 'text-brand-orange',
		'brand-blue': 'text-brand-blue',
		'brand-green': 'text-brand-green',
		'text-muted': 'text-text-muted'
	};

	const label = $derived(format.key ? t(format.key) : (format.label ?? ''));
	const iconColor = $derived(colorMap[format.color] ?? 'text-text-muted');
</script>

{#if size === 'desktop'}
	<div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-card border border-border">
		<i class="fa-solid {format.icon} {iconColor}"></i>
		<span class="text-sm font-medium">{label}</span>
	</div>
{:else}
	<div class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-lighter border border-border">
		<i class="fa-solid {format.icon} {iconColor} text-sm"></i>
		<span class="text-xs font-medium">{label}</span>
	</div>
{/if}
