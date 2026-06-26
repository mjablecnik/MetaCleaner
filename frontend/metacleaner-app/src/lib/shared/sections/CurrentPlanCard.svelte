<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';
	import { formatDate } from '$lib/shared/utils/planHierarchy';
	import { getPlanStyle } from '$lib/shared/utils/planStyleMap';

	interface Props {
		planId: string;
		planStatus: string;
		billingPeriod: 'monthly' | 'yearly' | null;
		price: string;
		monthlyAllowance: number;
		creditsUsed: number;
		creditsRemaining: number;
		renewalDate: string | null;
		features: string[];
		paymentMethod?: string | null;
		nextPaymentDate?: string | null;
		isLoading?: boolean;
		hasError?: boolean;
	}

	const {
		planId,
		planStatus,
		billingPeriod,
		price,
		monthlyAllowance,
		creditsUsed,
		creditsRemaining,
		renewalDate,
		features,
		paymentMethod = null,
		nextPaymentDate = null,
		isLoading = false,
		hasError = false
	}: Props = $props();

	const style = $derived(getPlanStyle(planId, planStatus));
	const isFree = $derived(planId === 'free');

	const barWidth = $derived(() => {
		if (monthlyAllowance === 0) return 0;
		return Math.min(creditsUsed / monthlyAllowance, 1) * 100;
	});

	const formattedRenewalDate = $derived(() => {
		if (!renewalDate) return '';
		void locale.current;
		return formatDate(renewalDate, locale.current as 'en' | 'cs');
	});

	const formattedNextPaymentDate = $derived(() => {
		if (!nextPaymentDate) return '';
		void locale.current;
		return formatDate(nextPaymentDate, locale.current as 'en' | 'cs');
	});

	const periodLabel = $derived(() => {
		void locale.current;
		return billingPeriod === 'yearly'
			? tx('subscription.currentPlan.perYear')
			: tx('subscription.currentPlan.perMonth');
	});
</script>

<div
	class="rounded-2xl border bg-navy-card shadow-card {style.borderColor} relative overflow-hidden p-5 lg:p-6"
>
	{#if hasError}
		<div
			class="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs text-yellow-400"
		>
			<i class="fa-solid fa-triangle-exclamation text-[10px]"></i>
			{tx('subscription.currentPlan.staleWarning')}
		</div>
	{/if}

	{#if isLoading}
		<!-- Skeleton state -->
		<div class="space-y-4 animate-pulse">
			<div class="h-6 w-1/3 rounded-lg bg-gray-700/60"></div>
			<div class="h-4 w-1/2 rounded-lg bg-gray-700/40"></div>
			<div class="h-3 w-full rounded-full bg-gray-700/40"></div>
			<div class="h-4 w-2/3 rounded-lg bg-gray-700/40"></div>
			<div class="space-y-2">
				{#each [1, 2, 3] as _}
					<div class="h-3 w-3/4 rounded-lg bg-gray-700/30"></div>
				{/each}
			</div>
		</div>
	{:else}
		<!-- Plan name and price -->
		<div class="mb-4 flex items-start justify-between">
			<div>
				<p class="mb-0.5 text-xs font-medium uppercase tracking-wider text-text-muted">
					{tx('subscription.currentPlan.title')}
				</p>
				<h3 class="text-2xl font-black {style.textColor}">{style.label}</h3>
			</div>
			{#if !isFree && price}
				<div class="text-right">
					<span class="text-xl font-bold text-white">{price}</span>
					<span class="text-xs text-text-muted">{periodLabel()}</span>
				</div>
			{/if}
		</div>

		<!-- Credit usage bar -->
		<div class="mb-4">
			<div class="mb-1.5 flex items-center justify-between text-xs text-text-muted">
				<span>{tx('subscription.currentPlan.creditsUsed')}: {creditsUsed}</span>
				<span>{tx('subscription.currentPlan.creditsRemaining')}: {creditsRemaining}</span>
			</div>
			<div class="h-2 w-full overflow-hidden rounded-full bg-gray-700/60">
				<div
					class="h-full rounded-full transition-all duration-500 {style.dotColor}"
					style="width: {barWidth()}%"
				></div>
			</div>
			{#if renewalDate}
				<p class="mt-1.5 text-right text-xs text-text-muted">
					{tx('subscription.currentPlan.renewal')}
					{formattedRenewalDate()}
				</p>
			{/if}
		</div>

		<!-- Features -->
		{#if features.length > 0}
			<div class="mb-4">
				<p class="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
					{tx('subscription.currentPlan.features')}
				</p>
				<ul class="space-y-1.5">
					{#each features as feature}
						<li class="flex items-center gap-2 text-sm text-white">
							<i class="fa-solid fa-check text-[11px] {style.textColor}"></i>
							{feature}
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Billing info (hidden for free plan) -->
		{#if !isFree && paymentMethod}
			<div class="border-t border-gray-700/60 pt-4">
				<div class="flex items-center justify-between text-sm">
					<span class="text-text-muted">{tx('subscription.currentPlan.paymentMethod')}</span>
					<span class="font-medium text-white">{paymentMethod}</span>
				</div>
				{#if nextPaymentDate}
					<div class="mt-1.5 flex items-center justify-between text-sm">
						<span class="text-text-muted">{tx('subscription.currentPlan.nextPayment')}</span>
						<span class="font-medium text-white">{formattedNextPaymentDate()}</span>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>
