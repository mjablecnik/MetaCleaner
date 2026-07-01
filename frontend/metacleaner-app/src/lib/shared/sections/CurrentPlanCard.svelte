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
		features?: string[];
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
		creditsUsed: _creditsUsed,
		creditsRemaining,
		renewalDate,
		features = [],
		paymentMethod = null,
		nextPaymentDate = null,
		isLoading = false,
		hasError = false
	}: Props = $props();

	const style = $derived(getPlanStyle(planId, planStatus));
	const isFree = $derived(planId === 'free');

	const barWidth = $derived(() => {
		if (monthlyAllowance === 0) return 0;
		return Math.min(creditsRemaining / monthlyAllowance, 1) * 100;
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
	class="relative rounded-2xl border-2 border-brand-blue/40 bg-navy-card p-5 shadow-glow-blue lg:p-6"
>
	{#if hasError}
		<div
			class="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs text-yellow-400"
		>
			<i class="fa-solid fa-triangle-exclamation text-[10px]"></i>
			{tx('subscription.currentPlan.staleWarning')}
		</div>
	{/if}

	{#if isLoading}
		<!-- Skeleton state -->
		<div class="animate-pulse space-y-4">
			<div class="h-6 w-1/3 rounded-lg bg-gray-700/60"></div>
			<div class="h-4 w-1/2 rounded-lg bg-gray-700/40"></div>
			<div class="h-3 w-full rounded-full bg-gray-700/40"></div>
			<div class="h-4 w-2/3 rounded-lg bg-gray-700/40"></div>
			<div class="space-y-2">
				{#each [1, 2, 3] as _ (_)}
					<div class="h-3 w-3/4 rounded-lg bg-gray-700/30"></div>
				{/each}
			</div>
		</div>
	{:else}
		<!-- Active plan badge -->
		<div
			class="absolute -top-3 left-5 rounded-full bg-brand-blue px-3 py-1 text-xs font-bold text-white"
		>
			{tx('subscription.currentPlan.title')}
		</div>

		<!-- Plan name and price -->
		<div class="mt-2 mb-5 flex items-start justify-between">
			<div>
				<h2 class="text-xl font-black lg:text-3xl">{style.label}</h2>
				<p class="mt-1 text-xs text-text-muted lg:text-sm">
					{monthlyAllowance}
					{tx('subscription.currentPlan.photosPerMonth')}
				</p>
			</div>
			{#if !isFree && price}
				<div class="text-right">
					<div class="text-2xl font-black lg:text-3xl">{price}</div>
					<div class="text-xs text-text-muted lg:text-sm">{periodLabel()}</div>
				</div>
			{/if}
		</div>

		<!-- Credits Usage -->
		<div class="mb-5">
			<div class="mb-1.5 flex items-center justify-between lg:mb-2">
				<span class="text-xs font-medium text-text-muted lg:text-sm">
					{tx('subscription.currentPlan.creditsThisMonth')}
				</span>
				<span class="text-xs font-bold text-white lg:text-sm">
					{creditsRemaining} / {monthlyAllowance}
				</span>
			</div>
			<div class="h-2 w-full overflow-hidden rounded-full bg-navy-lighter lg:h-2.5">
				<div class="progress-bar h-full" style="width: {barWidth()}%"></div>
			</div>
			{#if renewalDate}
				<p class="mt-1.5 text-xs text-text-muted lg:mt-2">
					{creditsRemaining}
					{tx('subscription.currentPlan.photosRemaining')} ·
					{tx('subscription.currentPlan.renewal')}
					{formattedRenewalDate()}
				</p>
			{/if}
		</div>

		<!-- Plan Features -->
		{#if features.length > 0}
			<div class="mb-4 rounded-xl bg-navy-lighter p-3 lg:mb-5 lg:p-4">
				<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase lg:mb-3">
					{tx('subscription.currentPlan.features')}
				</p>
				<div class="grid grid-cols-2 gap-x-3 gap-y-2 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-2.5">
					{#each features as feature (feature)}
						<div class="flex items-center gap-2">
							<i class="fa-solid fa-check text-xs text-brand-green"></i>
							<span class="text-xs text-text-muted">{feature}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Billing info -->
		{#if !isFree && paymentMethod}
			<div
				class="flex items-center gap-2 rounded-xl bg-navy-lighter px-3 py-2.5 lg:gap-3 lg:px-4 lg:py-3"
			>
				<i class="fa-regular fa-credit-card text-sm text-text-muted"></i>
				<span class="text-xs text-text-muted lg:text-sm">
					{tx('subscription.currentPlan.paymentLabel')}:
					<span class="font-medium text-white">{paymentMethod}</span>
				</span>
				{#if nextPaymentDate}
					<span class="ml-auto text-xs text-text-muted lg:text-sm">
						{tx('subscription.currentPlan.nextPayment')}:
						<span class="font-medium text-white">{formattedNextPaymentDate()}</span>
					</span>
				{/if}
				<button class="ml-2 text-xs text-brand-blue hover:underline">
					{tx('subscription.currentPlan.change')}
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.progress-bar {
		background: linear-gradient(90deg, #3b82f6, #60a5fa);
		border-radius: 999px;
	}
</style>
