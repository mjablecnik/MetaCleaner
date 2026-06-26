<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';
	import { formatDate } from '$lib/shared/utils/planHierarchy';
	import { billingClient } from '$lib/clients/billingClient';
	import { billingStore } from '$lib/stores/billingStore.svelte';
	import CancellationBanner from './CancellationBanner.svelte';
	import CancellingPlanCard from './CancellingPlanCard.svelte';
	import CountdownCard from './CountdownCard.svelte';
	import ReactivateCard from './ReactivateCard.svelte';
	import ReactivateModal from './ReactivateModal.svelte';
	import WhatHappensAfterCard from './WhatHappensAfterCard.svelte';

	interface Props {
		planId: string;
		price: string;
		billingPeriod: string;
		periodEndDate: string;
		monthlyAllowance: number;
		creditsUsed: number;
		creditsRemaining: number;
		features: string[];
	}

	const {
		planId,
		price,
		billingPeriod,
		periodEndDate,
		monthlyAllowance,
		creditsUsed,
		creditsRemaining,
		features
	}: Props = $props();

	let showModal = $state(false);
	let isLoading = $state(false);
	let modalError = $state<string | null>(null);

	const formattedDate = $derived(() => {
		void locale.current;
		return formatDate(periodEndDate, locale.current as 'en' | 'cs');
	});

	function openModal() {
		showModal = true;
		modalError = null;
	}

	function closeModal() {
		if (!isLoading) {
			showModal = false;
			modalError = null;
		}
	}

	async function handleReactivate() {
		isLoading = true;
		modalError = null;
		try {
			await billingClient.reactivateSubscription();
			await billingStore.refresh();
			showModal = false;
		} catch (err: unknown) {
			modalError = (err as Error).message || tx('subscription.cancelling.modal.error');
		} finally {
			isLoading = false;
		}
	}
</script>

<!-- Cancellation Banner -->
<div class="mb-4 lg:mb-6">
	<CancellationBanner {planId} {periodEndDate} onReactivate={openModal} />
</div>

<!-- Page Header: mobile (compact) -->
<div class="mb-4 flex items-center gap-3 lg:hidden">
	<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-orange/15">
		<i class="fa-solid fa-crown text-lg text-brand-orange"></i>
	</div>
	<div class="flex-1">
		<h1 class="text-xl font-bold">{tx('subscription.cancelling.header.title')}</h1>
		<p class="mt-0.5 text-xs text-text-muted">{tx('subscription.cancelling.header.subtitle')}</p>
	</div>
	<div
		class="flex items-center gap-1.5 rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-3 py-1.5"
	>
		<i class="fa-solid fa-hourglass-half text-xs text-brand-orange"></i>
		<span class="text-xs font-semibold text-brand-orange">
			{tx('subscription.cancelling.header.badgeMobile')}
		</span>
	</div>
</div>

<!-- Page Header: desktop (with full badge) -->
<div class="mb-8 hidden items-center gap-4 lg:flex">
	<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/15">
		<i class="fa-solid fa-crown text-xl text-brand-orange"></i>
	</div>
	<div>
		<h1 class="text-2xl font-bold">{tx('subscription.cancelling.header.title')}</h1>
		<p class="mt-0.5 text-sm text-text-muted">{tx('subscription.cancelling.header.subtitle')}</p>
	</div>
	<div
		class="ml-auto flex items-center gap-2 rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-4 py-2"
	>
		<i class="fa-solid fa-hourglass-half text-xs text-brand-orange"></i>
		<span class="text-sm font-semibold text-brand-orange">
			{tx('subscription.cancelling.header.badge', { date: formattedDate() })}
		</span>
	</div>
</div>

<!-- CountdownCard: mobile only — shown above grid to match mobile design order -->
<div class="mb-4 lg:hidden">
	<CountdownCard {periodEndDate} />
</div>

<!-- Two-column grid -->
<div class="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
	<!-- Left column (3/5): CancellingPlanCard + WhatHappensAfterCard (desktop) -->
	<div class="flex flex-col gap-4 lg:col-span-3 lg:gap-5">
		<CancellingPlanCard
			{planId}
			{price}
			{monthlyAllowance}
			{creditsUsed}
			{creditsRemaining}
			{periodEndDate}
			{features}
		/>
		<!-- Desktop only — mobile duplicate rendered after grid -->
		<div class="hidden lg:block">
			<WhatHappensAfterCard {periodEndDate} {creditsRemaining} />
		</div>
	</div>

	<!-- Right column (2/5): CountdownCard (desktop) + ReactivateCard + UsageStats -->
	<div class="flex flex-col gap-4 lg:col-span-2 lg:gap-5">
		<!-- Desktop only — mobile duplicate rendered above grid -->
		<div class="hidden lg:block">
			<CountdownCard {periodEndDate} />
		</div>

		<ReactivateCard
			{planId}
			{price}
			{billingPeriod}
			{periodEndDate}
			onReactivate={openModal}
		/>

		<!-- Cancelling-specific usage stats (inline, not UsageStatsCard) -->
		<div class="rounded-2xl border border-gray-800 bg-navy-card p-4 lg:p-5">
			<p class="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
				{tx('subscription.cancelling.usageStats.title')}
			</p>
			<!-- Desktop: 2×2 grid -->
			<div class="hidden grid-cols-2 gap-3 lg:grid">
				<div class="rounded-xl bg-navy-lighter p-3 text-center">
					<div class="text-2xl font-black text-white">{creditsUsed}</div>
					<div class="mt-0.5 text-xs text-text-muted">
						{tx('subscription.cancelling.usageStats.processed')}
					</div>
				</div>
				<div class="rounded-xl bg-navy-lighter p-3 text-center">
					<div class="text-2xl font-black text-brand-orange">{creditsRemaining}</div>
					<div class="mt-0.5 text-xs text-text-muted">
						{tx('subscription.cancelling.usageStats.remaining')}
					</div>
				</div>
				<div class="rounded-xl bg-navy-lighter p-3 text-center">
					<div class="text-2xl font-black text-brand-blue">{monthlyAllowance}</div>
					<div class="mt-0.5 text-xs text-text-muted">
						{tx('subscription.cancelling.usageStats.total')}
					</div>
				</div>
				<div class="rounded-xl bg-navy-lighter p-3 text-center">
					<div class="text-sm font-black text-brand-red">{formattedDate()}</div>
					<div class="mt-0.5 text-xs text-text-muted">
						{tx('subscription.cancelling.usageStats.expiry')}
					</div>
				</div>
			</div>
			<!-- Mobile: 4-column compact grid -->
			<div class="grid grid-cols-4 gap-2 lg:hidden">
				<div class="rounded-xl bg-navy-lighter p-2.5 text-center">
					<div class="text-xl font-black text-white">{creditsUsed}</div>
					<div class="mt-0.5 text-xs text-text-muted">
						{tx('subscription.cancelling.usageStats.processed')}
					</div>
				</div>
				<div class="rounded-xl bg-navy-lighter p-2.5 text-center">
					<div class="text-xl font-black text-brand-orange">{creditsRemaining}</div>
					<div class="mt-0.5 text-xs text-text-muted">
						{tx('subscription.cancelling.usageStats.remaining')}
					</div>
				</div>
				<div class="rounded-xl bg-navy-lighter p-2.5 text-center">
					<div class="text-xl font-black text-brand-blue">{monthlyAllowance}</div>
					<div class="mt-0.5 text-xs text-text-muted">
						{tx('subscription.cancelling.usageStats.totalMobile')}
					</div>
				</div>
				<div class="rounded-xl bg-navy-lighter p-2.5 text-center">
					<div class="text-xs font-black leading-tight text-brand-red">{formattedDate()}</div>
					<div class="mt-0.5 text-xs text-text-muted">
						{tx('subscription.cancelling.usageStats.expiryMobile')}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- WhatHappensAfterCard: mobile only — shown after grid to match mobile design order -->
<div class="mt-4 lg:hidden">
	<WhatHappensAfterCard {periodEndDate} {creditsRemaining} />
</div>

<!-- Reactivation modal -->
{#if showModal}
	<ReactivateModal
		{planId}
		{price}
		{billingPeriod}
		{periodEndDate}
		onConfirm={handleReactivate}
		onCancel={closeModal}
		{isLoading}
		error={modalError}
	/>
{/if}
