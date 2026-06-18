<script lang="ts">
	import { t } from '$lib/i18n';
	import IconBadge from '$lib/components/elements/IconBadge.svelte';
	import type { RiskStat } from '$lib/repositories';

	interface Props {
		stat: RiskStat;
		size?: 'desktop' | 'mobile';
	}

	const { stat, size = 'desktop' }: Props = $props();

	const isMobile = $derived(size === 'mobile');

	const cardClass = $derived(
		isMobile
			? 'bg-navy-card rounded-xl border border-border p-3 flex flex-col items-center text-center gap-1.5'
			: 'bg-navy-card rounded-2xl border border-border p-6 flex flex-col items-center text-center gap-3'
	);
	const badgeSize = $derived(isMobile ? 'sm' : 'lg') as 'sm' | 'lg';
	const valueClass = $derived(
		isMobile ? 'text-xl font-black text-white' : 'text-3xl font-black text-white'
	);
	const labelClass = $derived(
		isMobile ? 'text-[10px] text-text-muted leading-tight' : 'text-sm text-text-muted'
	);

	const displayValue = $derived(isMobile ? (stat.valueMobile ?? stat.value) : stat.value);
	const displayLabel = $derived(
		t(isMobile ? (stat.labelMobileKey ?? stat.labelKey) : stat.labelKey)
	);
</script>

<div class={cardClass}>
	<IconBadge icon={stat.icon} color={stat.color} size={badgeSize} shape="circle" />
	<span class={valueClass}>{displayValue}</span>
	<p class={labelClass}>{displayLabel}</p>
</div>
