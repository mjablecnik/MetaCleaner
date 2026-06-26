<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';
	import { formatDate } from '$lib/shared/utils/planHierarchy';

	interface Props {
		creditsConsumed: number;
		creditsRemaining: number;
		monthlyAllowance: number;
		renewalDate: string;
		isLoading?: boolean;
		hasError?: boolean;
	}

	const {
		creditsConsumed,
		creditsRemaining,
		monthlyAllowance,
		renewalDate,
		isLoading = false,
		hasError = false
	}: Props = $props();

	const formattedRenewalDate = $derived(() => {
		if (!renewalDate) return '';
		void locale.current;
		return formatDate(renewalDate, locale.current as 'en' | 'cs');
	});
</script>

<div class="rounded-2xl border border-gray-700/60 bg-navy-card p-5 shadow-card lg:p-6">
	<div class="mb-4 flex items-center justify-between">
		<h3 class="text-sm font-semibold tracking-wider text-text-muted uppercase">
			{tx('subscription.usageStats.title')}
		</h3>
		{#if hasError}
			<span class="flex items-center gap-1 text-xs text-yellow-400">
				<i class="fa-solid fa-triangle-exclamation text-[10px]"></i>
				{tx('subscription.currentPlan.staleWarning')}
			</span>
		{/if}
	</div>

	{#if isLoading}
		<div class="animate-pulse space-y-3">
			{#each [1, 2, 3, 4] as _ (_)}
				<div class="flex items-center justify-between">
					<div class="h-3 w-1/2 rounded-lg bg-gray-700/40"></div>
					<div class="h-3 w-1/4 rounded-lg bg-gray-700/60"></div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="space-y-3">
			<div class="flex items-center justify-between text-sm">
				<span class="text-text-muted">{tx('subscription.usageStats.consumed')}</span>
				<span class="font-semibold text-white">{creditsConsumed}</span>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-text-muted">{tx('subscription.usageStats.remaining')}</span>
				<span class="font-semibold text-white">{creditsRemaining}</span>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-text-muted">{tx('subscription.usageStats.allowance')}</span>
				<span class="font-semibold text-white">{monthlyAllowance}</span>
			</div>
			{#if renewalDate}
				<div class="border-t border-gray-700/40 pt-3">
					<div class="flex items-center justify-between text-sm">
						<span class="text-text-muted">{tx('subscription.usageStats.renewal')}</span>
						<span class="font-semibold text-white">{formattedRenewalDate()}</span>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
