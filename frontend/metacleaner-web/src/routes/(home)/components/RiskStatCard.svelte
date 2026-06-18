<script lang="ts">
	import { t } from '$lib/i18n';
	import IconBadge from '$lib/components/elements/IconBadge.svelte';
	import type { RiskStat } from '$lib/repositories';

	interface Props {
		stat: RiskStat;
	}

	const { stat }: Props = $props();
</script>

<div
	class="bg-navy-card rounded-xl md:rounded-2xl border border-border p-3 md:p-6 flex flex-col items-center text-center gap-1.5 md:gap-3"
>
	<IconBadge icon={stat.icon} color={stat.color} size="lg" shape="circle" />
	<span class="text-xl md:text-3xl font-black text-white">{stat.value}</span>
	<p class="text-[10px] md:text-sm text-text-muted leading-tight md:leading-normal">
		{t(stat.labelKey)}
	</p>
</div>
