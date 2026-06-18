<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { t } from '$lib/i18n';

	interface Field {
		icon: string;
		labelKey: string;
		value?: string;
	}

	interface Props {
		field: Field;
		variant: 'before' | 'after';
		size?: 'desktop' | 'mobile';
	}

	const { field, variant, size = 'desktop' }: Props = $props();

	const isMobile = $derived(size === 'mobile');
	const isAfter = $derived(variant === 'after');

	const rowPadding = $derived(isMobile ? 'px-3 py-2' : 'px-4 py-2.5');
	const labelGap = $derived(isMobile ? 'gap-1.5' : 'gap-2');
	const iconSize = $derived(isMobile ? 'text-[10px]' : '');
	const iconColor = $derived(isAfter ? 'text-brand-green' : 'text-brand-red');
</script>

<div class="flex items-center justify-between {rowPadding} rounded-lg bg-navy-main/60 border border-border">
	<span class="text-xs text-text-muted flex items-center {labelGap}">
		<i class="fa-solid {field.icon} {iconColor} {iconSize}"></i>
		{t(field.labelKey)}
	</span>
	{#if isAfter}
		<span class="text-xs font-mono text-brand-green flex items-center gap-1">
			<i class="fa-solid fa-check {iconSize}"></i>
			{m.home_why_removed()}
		</span>
	{:else}
		<span class="text-xs font-mono text-white">{field.value ?? ''}</span>
	{/if}
</div>
