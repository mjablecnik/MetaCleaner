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

<div class="rounded-2xl border border-gray-800 bg-navy-card p-5">
	<div class="mb-3 flex items-center justify-between">
		<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">
			{tx('subscription.usageStats.title')}
		</p>
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
				<div class="h-16 rounded-xl bg-gray-700/40"></div>
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-3">
			<div class="rounded-xl bg-navy-lighter p-3 text-center">
				<div class="text-2xl font-black text-white">{creditsConsumed}</div>
				<div class="mt-0.5 text-xs text-text-muted">
					{tx('subscription.usageStats.consumed')}
				</div>
			</div>
			<div class="rounded-xl bg-navy-lighter p-3 text-center">
				<div class="text-2xl font-black text-brand-green">{creditsRemaining}</div>
				<div class="mt-0.5 text-xs text-text-muted">
					{tx('subscription.usageStats.remaining')}
				</div>
			</div>
			<div class="rounded-xl bg-navy-lighter p-3 text-center">
				<div class="text-2xl font-black text-brand-blue">{monthlyAllowance}</div>
				<div class="mt-0.5 text-xs text-text-muted">
					{tx('subscription.usageStats.allowance')}
				</div>
			</div>
			{#if renewalDate}
				<div class="rounded-xl bg-navy-lighter p-3 text-center">
					<div class="text-lg font-black text-text-muted">{formattedRenewalDate()}</div>
					<div class="mt-0.5 text-xs text-text-muted">
						{tx('subscription.usageStats.renewal')}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
