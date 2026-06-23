<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { isInsufficientCredits } from '$lib/shared/utils/creditCost';

	interface Props {
		totalCost: number;
		fileCount: number;
		creditBalance: number | null;
	}

	const { totalCost, fileCount, creditBalance }: Props = $props();

	const insufficient = $derived(
		creditBalance !== null && isInsufficientCredits(totalCost, creditBalance)
	);
	const isNeutral = $derived(creditBalance === null);

	const containerClass = $derived(
		insufficient
			? 'border-orange-500/40 bg-orange-950/20'
			: isNeutral
				? 'border-gray-700 bg-navy-main/40'
				: 'border-gray-700 bg-navy-main/40'
	);
	const iconClass = $derived(insufficient ? 'text-orange-400' : 'text-text-muted');
	const labelClass = $derived(insufficient ? 'text-orange-300' : 'text-text-muted');
	const badgeBorderClass = $derived(
		insufficient
			? 'border-orange-500/40 bg-orange-950/20 text-orange-400'
			: 'border-brand-green/30 bg-brand-green/10 text-brand-green'
	);
</script>

<div class="flex items-center gap-3 rounded-xl border px-4 py-2.5 {containerClass}">
	<i class="fa-solid fa-circle-info text-sm {iconClass}"></i>

	<span class="flex-1 text-sm {labelClass}">
		{tx('credits.summary.costFor', { count: fileCount })}
	</span>

	<span
		class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold {badgeBorderClass}"
	>
		<i class="fa-solid fa-bolt text-[9px]"></i>
		{totalCost}
	</span>
</div>

{#if insufficient}
	<div class="mt-2 flex items-center gap-2 px-1 text-xs text-orange-400">
		<i class="fa-solid fa-triangle-exclamation text-[10px]"></i>
		<span>{tx('credits.summary.insufficientCredits')}</span>
		<a
			href={resolve('/pricing' as Pathname)}
			class="font-semibold text-orange-300 underline underline-offset-2 hover:text-orange-200"
		>
			{tx('credits.summary.upgradePlan')}
		</a>
	</div>
{/if}
