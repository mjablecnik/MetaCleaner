<script lang="ts">
	import { onMount } from 'svelte';
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';
	import { authStore } from '$lib/auth/auth.svelte';
	import { billingClient } from '$lib/clients/billingClient';
	import { billingStore } from '$lib/stores/billingStore.svelte';
	import {
		PricingHeaderSection,
		PricingPlansSection,
		pricingRepository,
		getEnterprise
	} from 'metacleaner-shared';
	import CurrentPlanCard from '$lib/shared/sections/CurrentPlanCard.svelte';
	import UpgradeCard from '$lib/shared/sections/UpgradeCard.svelte';
	import DowngradeCard from '$lib/shared/sections/DowngradeCard.svelte';
	import CancelSection from '$lib/shared/sections/CancelSection.svelte';
	import UsageStatsCard from '$lib/shared/sections/UsageStatsCard.svelte';
	import ConfirmationModal from '$lib/shared/sections/ConfirmationModal.svelte';
	import CancellingView from '$lib/shared/sections/CancellingView.svelte';
	import { formatDate } from '$lib/shared/utils/planHierarchy';

	let { data } = $props();

	// eslint-disable-next-line svelte/prefer-writable-derived
	let currentBilling = $state<'monthly' | 'yearly'>('monthly');
	$effect(() => {
		currentBilling = data.billing === 'yearly' ? 'yearly' : 'monthly';
	});
	const isYearly = $derived(currentBilling === 'yearly');

	const plans = pricingRepository();
	const enterprise = getEnterprise();

	let checkoutError = $state<string | null>(null);
	let isCheckingOut = $state(false);

	type ModalType = 'upgrade' | 'downgrade' | 'cancel' | null;
	let activeModal = $state<ModalType>(null);
	let modalLoading = $state(false);
	let modalError = $state<string | null>(null);

	const currentPlanId = $derived(
		billingStore.isPaidPlan || billingStore.isCancellingPlan ? billingStore.planId : null
	);

	const showManagementUI = $derived(billingStore.isPaidPlan);
	const showSkeleton = $derived(billingStore.isLoading && billingStore.credits === null);

	const currentPlanData = $derived(plans.find((p) => p.id === billingStore.planId));
	const targetUpgradePlanData = $derived(
		billingStore.planId === 'pro' ? plans.find((p) => p.id === 'proplus') : null
	);
	const targetDowngradePlanData = $derived(
		billingStore.planId === 'proplus' ? plans.find((p) => p.id === 'pro') : null
	);

	const currentPlanPrice = $derived(() => {
		void locale.current;
		if (!currentPlanData) return '';
		return billingStore.billingPeriod === 'yearly'
			? currentPlanData.priceYearly
			: currentPlanData.priceMonthly;
	});

	const creditsRemaining = $derived(
		billingStore.subscriptionCredits + billingStore.purchasedCredits
	);
	const creditsUsed = $derived(Math.max(0, billingStore.monthlyAllowance - creditsRemaining));

	const currentFeatures = $derived(() => {
		void locale.current;
		return currentPlanData?.featureKeys.map((k) => tx(k)) ?? [];
	});

	const upgradeFeatures = $derived(() => {
		void locale.current;
		if (!targetUpgradePlanData || !currentPlanData) return [];
		return targetUpgradePlanData.featureKeys
			.filter((k) => !currentPlanData.featureKeys.includes(k))
			.map((k) => tx(k));
	});

	const downgradeFeatures = $derived(() => {
		void locale.current;
		if (!currentPlanData || !targetDowngradePlanData) return [];
		return currentPlanData.featureKeys
			.filter((k) => !targetDowngradePlanData.featureKeys.includes(k))
			.map((k) => tx(k));
	});

	const targetUpgradePrice = $derived(() => {
		void locale.current;
		if (!targetUpgradePlanData) return '';
		return billingStore.billingPeriod === 'yearly'
			? targetUpgradePlanData.priceYearly
			: targetUpgradePlanData.priceMonthly;
	});

	const targetDowngradePrice = $derived(() => {
		void locale.current;
		if (!targetDowngradePlanData) return '';
		return billingStore.billingPeriod === 'yearly'
			? targetDowngradePlanData.priceYearly
			: targetDowngradePlanData.priceMonthly;
	});

	const formattedPeriodEnd = $derived(() => {
		void locale.current;
		if (!billingStore.currentPeriodEnd) return '';
		return formatDate(billingStore.currentPeriodEnd, locale.current as 'en' | 'cs');
	});

	function translate(key: string): string {
		void locale.current;
		return tx(key);
	}

	function translateParam(key: string, params: Record<string, string>): string {
		void locale.current;
		return tx(key, params);
	}

	function onBillingChange(value: 'monthly' | 'yearly') {
		currentBilling = value;
	}

	async function handlePlanSelect(planId: string, billing: 'monthly' | 'yearly') {
		if (isCheckingOut) return;
		checkoutError = null;
		isCheckingOut = true;
		try {
			const { url } = await billingClient.createCheckoutSession(planId, billing);
			window.location.href = url;
		} catch (err: unknown) {
			checkoutError = (err as Error).message || tx('pricing.checkout.error');
			isCheckingOut = false;
		}
	}

	function openModal(type: ModalType) {
		activeModal = type;
		modalError = null;
	}

	function closeModal() {
		if (!modalLoading) {
			activeModal = null;
			modalError = null;
		}
	}

	async function handleUpgradeConfirm() {
		if (!targetUpgradePlanData) return;
		modalLoading = true;
		modalError = null;
		try {
			await billingClient.changePlan(
				targetUpgradePlanData.id,
				billingStore.billingPeriod ?? 'monthly'
			);
			await billingStore.refresh();
			activeModal = null;
		} catch (err: unknown) {
			modalError = (err as Error).message || tx('subscription.modal.error.timeout');
		} finally {
			modalLoading = false;
		}
	}

	async function handleDowngradeConfirm() {
		if (!targetDowngradePlanData) return;
		modalLoading = true;
		modalError = null;
		try {
			await billingClient.changePlan(
				targetDowngradePlanData.id,
				billingStore.billingPeriod ?? 'monthly'
			);
			await billingStore.refresh();
			activeModal = null;
		} catch (err: unknown) {
			modalError = (err as Error).message || tx('subscription.modal.error.timeout');
		} finally {
			modalLoading = false;
		}
	}

	async function handleCancelConfirm() {
		modalLoading = true;
		modalError = null;
		try {
			await billingClient.cancelSubscription();
			await billingStore.refresh();
			activeModal = null;
		} catch (err: unknown) {
			modalError = (err as Error).message || tx('subscription.modal.error.timeout');
		} finally {
			modalLoading = false;
		}
	}

	onMount(() => {
		if (billingStore.credits === null && !billingStore.isLoading) {
			billingStore.refresh();
		}
		const planParam = data.plan;
		const billingParam = data.billing;
		if (planParam && authStore.isAuthenticated) {
			handlePlanSelect(planParam, billingParam === 'yearly' ? 'yearly' : 'monthly');
		}
	});
</script>

<svelte:head>
	<title>{tx('pricing.meta.title')}</title>
</svelte:head>

{#snippet upgradeModalContent()}
	<div class="space-y-3">
		<div class="flex items-center gap-3 text-sm">
			<span class="text-text-muted">{tx('subscription.upgrade.modal.from')}:</span>
			<span class="font-medium text-white"
				>{currentPlanData?.nameText ?? billingStore.planId} — {currentPlanPrice()}</span
			>
		</div>
		<div class="flex items-center gap-3 text-sm">
			<span class="text-text-muted">{tx('subscription.upgrade.modal.to')}:</span>
			<span class="font-medium text-white"
				>{targetUpgradePlanData?.nameText ?? ''} — {targetUpgradePrice()}</span
			>
		</div>
		<p class="text-sm text-text-muted">{tx('subscription.upgrade.modal.immediate')}</p>
	</div>
{/snippet}

{#snippet downgradeModalContent()}
	<div class="space-y-3">
		<p class="text-sm text-text-muted">{tx('subscription.downgrade.modal.effectiveDate')}</p>
		{#if downgradeFeatures().length > 0}
			<div>
				<p class="mb-2 text-xs font-medium tracking-wider text-text-muted uppercase">
					{tx('subscription.downgrade.featuresLost')}
				</p>
				<ul class="space-y-1.5">
					{#each downgradeFeatures() as feature (feature)}
						<li class="flex items-center gap-2 text-sm text-text-muted">
							<i class="fa-solid fa-xmark text-[11px] text-red-400"></i>
							{feature}
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet cancelModalContent()}
	<div class="space-y-3">
		<p class="text-sm text-text-muted">
			{tx('subscription.cancel.modal.body', { date: formattedPeriodEnd() })}
		</p>
		<p class="text-sm text-yellow-400">
			{tx('subscription.cancel.modal.creditsWarning')}
		</p>
	</div>
{/snippet}

<div class="flex min-h-screen w-full flex-col items-center">
	<main class="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-4 py-8 lg:px-6 lg:py-10">
		{#if showSkeleton}
			<!-- Skeleton: matches subscription management layout dimensions -->
			<div class="animate-pulse">
				<div class="mb-8">
					<div class="mb-2 h-7 w-56 rounded-lg bg-gray-700/60"></div>
					<div class="h-4 w-80 rounded-lg bg-gray-700/40"></div>
				</div>
				<div class="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
					<div class="flex flex-col gap-4 lg:col-span-3 lg:gap-5">
						<div class="h-72 rounded-2xl bg-gray-700/30"></div>
						<div class="h-28 rounded-2xl bg-gray-700/20"></div>
					</div>
					<div class="flex flex-col gap-4 lg:col-span-2 lg:gap-5">
						<div class="h-48 rounded-2xl bg-gray-700/30"></div>
						<div class="h-40 rounded-2xl bg-gray-700/20"></div>
					</div>
				</div>
			</div>
		{:else if billingStore.hasError && billingStore.credits === null}
			<!-- Error state: failed to load billing data with no cached values -->
			<div class="flex flex-col items-center justify-center py-16 text-center">
				<i class="fa-solid fa-circle-exclamation mb-4 text-3xl text-red-400"></i>
				<p class="mb-4 text-base text-text-muted">{tx('subscription.management.loadError')}</p>
				<button
					onclick={() => billingStore.refresh()}
					class="rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-blue/90"
				>
					{tx('subscription.management.retry')}
				</button>
			</div>
		{:else if billingStore.isCancellingPlan}
			<!-- Ending Subscription (Cancelling State) -->
			<CancellingView
				planId={billingStore.planId}
				price={currentPlanPrice()}
				billingPeriod={billingStore.billingPeriod ?? 'monthly'}
				periodEndDate={billingStore.currentPeriodEnd ?? ''}
				monthlyAllowance={billingStore.monthlyAllowance}
				{creditsUsed}
				{creditsRemaining}
				features={currentFeatures()}
			/>
		{:else if showManagementUI}
			<!-- Subscription Management UI -->

			<!-- Page Header: mobile (centered) -->
			<div class="mb-6 w-full text-center lg:hidden">
				<div
					class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/20"
				>
					<i class="fa-solid fa-crown text-xl text-brand-green"></i>
				</div>
				<h1 class="mb-1 text-2xl font-bold text-white">
					{tx('subscription.management.header')}
				</h1>
				<p class="text-sm text-text-muted">{tx('subscription.management.subheader')}</p>
			</div>

			<!-- Page Header: desktop (horizontal with badge) -->
			<div class="mb-8 hidden items-center gap-4 lg:flex">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/20">
					<i class="fa-solid fa-crown text-xl text-brand-green"></i>
				</div>
				<div>
					<h1 class="text-2xl font-bold text-white">
						{tx('subscription.management.header')}
					</h1>
					<p class="mt-0.5 text-sm text-text-muted">
						{tx('subscription.management.subheader')}
					</p>
				</div>
				<div
					class="ml-auto flex items-center gap-2 rounded-xl border border-brand-blue/30 bg-brand-blue/10 px-4 py-2"
				>
					<i class="fa-solid fa-circle text-xs text-brand-green"></i>
					<span class="text-sm font-semibold text-brand-blue">
						{tx('subscription.management.activePlan')}: {currentPlanData?.nameText ??
							billingStore.planId}
					</span>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
				<!-- Left column: current plan + cancel -->
				<div class="flex flex-col gap-4 lg:col-span-3 lg:gap-5">
					<CurrentPlanCard
						planId={billingStore.planId}
						planStatus={billingStore.planStatus}
						billingPeriod={billingStore.billingPeriod}
						price={currentPlanPrice()}
						monthlyAllowance={billingStore.monthlyAllowance}
						{creditsUsed}
						{creditsRemaining}
						renewalDate={billingStore.currentPeriodEnd}
						features={currentFeatures()}
						paymentMethod={authStore.subscription?.payment_method ?? null}
						nextPaymentDate={billingStore.currentPeriodEnd}
						isLoading={false}
						hasError={billingStore.hasError}
					/>
					{#if billingStore.isPaidPlan}
						<CancelSection
							periodEndDate={billingStore.currentPeriodEnd ?? ''}
							onCancel={() => openModal('cancel')}
						/>
					{/if}
				</div>

				<!-- Right column: upgrade/downgrade + usage stats -->
				<div class="flex flex-col gap-4 lg:col-span-2 lg:gap-5">
					{#if targetUpgradePlanData && billingStore.isPaidPlan}
						<UpgradeCard
							targetPlanId={targetUpgradePlanData.id}
							targetPlanName={targetUpgradePlanData.nameText ?? targetUpgradePlanData.id}
							targetPrice={targetUpgradePrice()}
							differentialFeatures={upgradeFeatures()}
							onUpgrade={() => openModal('upgrade')}
						/>
					{/if}
					{#if targetDowngradePlanData && billingStore.isPaidPlan}
						{#if billingStore.isDowngradeScheduled}
							<div class="rounded-2xl border border-brand-orange/30 bg-brand-orange/5 p-5">
								<div class="mb-2 flex items-center gap-3">
									<div
										class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/20"
									>
										<i class="fa-solid fa-clock text-brand-orange"></i>
									</div>
									<div>
										<h3 class="text-sm font-bold text-white">
											{tx('subscription.downgrade.scheduled.title')}
										</h3>
										<p class="text-xs text-text-muted">
											{tx('subscription.downgrade.scheduled.subtitle', {
												plan:
													plans.find((p) => p.id === billingStore.scheduledPlanId)?.nameText ??
													billingStore.scheduledPlanId ??
													'',
												date: billingStore.scheduledChangeDate
													? formatDate(
															billingStore.scheduledChangeDate,
															locale.current as 'en' | 'cs'
														)
													: ''
											})}
										</p>
									</div>
								</div>
							</div>
						{:else}
							<DowngradeCard
								targetPlanId={targetDowngradePlanData.id}
								targetPlanName={targetDowngradePlanData.nameText ?? targetDowngradePlanData.id}
								targetPrice={targetDowngradePrice()}
								featuresLost={downgradeFeatures()}
								onDowngrade={() => openModal('downgrade')}
							/>
						{/if}
					{/if}
					<UsageStatsCard
						creditsConsumed={creditsUsed}
						{creditsRemaining}
						monthlyAllowance={billingStore.monthlyAllowance}
						renewalDate={billingStore.currentPeriodEnd ?? ''}
						isLoading={false}
						hasError={billingStore.hasError}
					/>
				</div>
			</div>
		{:else}
			<!-- Non-subscriber: existing pricing grid -->
			<div class="flex w-full flex-col items-center">
				<PricingHeaderSection value={currentBilling} onChange={onBillingChange} {translate} />

				{#if checkoutError}
					<div
						class="mb-6 w-full max-w-lg rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm text-red-400"
					>
						<i class="fa-solid fa-circle-exclamation mr-1.5"></i>{checkoutError}
					</div>
				{/if}

				{#if isCheckingOut}
					<div class="mb-6 flex items-center gap-2 text-sm text-text-muted">
						<i class="fa-solid fa-spinner fa-spin text-brand-blue"></i>
						<span>Redirecting to checkout...</span>
					</div>
				{/if}

				<PricingPlansSection
					{plans}
					{isYearly}
					{enterprise}
					{translate}
					{translateParam}
					onPlanSelect={handlePlanSelect}
					{currentPlanId}
				/>
			</div>
		{/if}
	</main>
</div>

<!-- Confirmation modals -->
{#if activeModal === 'upgrade' && targetUpgradePlanData}
	<ConfirmationModal
		title={tx('subscription.upgrade.modal.title')}
		content={upgradeModalContent}
		confirmLabel={tx('subscription.upgrade.button')}
		cancelLabel={tx('subscription.modal.cancel')}
		isLoading={modalLoading}
		error={modalError}
		onConfirm={handleUpgradeConfirm}
		onCancel={closeModal}
	/>
{:else if activeModal === 'downgrade' && targetDowngradePlanData}
	<ConfirmationModal
		title={tx('subscription.downgrade.modal.title')}
		content={downgradeModalContent}
		confirmLabel={tx('subscription.downgrade.button')}
		cancelLabel={tx('subscription.modal.cancel')}
		confirmStyle="secondary"
		isLoading={modalLoading}
		error={modalError}
		onConfirm={handleDowngradeConfirm}
		onCancel={closeModal}
	/>
{:else if activeModal === 'cancel'}
	<ConfirmationModal
		title={tx('subscription.cancel.modal.title')}
		content={cancelModalContent}
		confirmLabel={tx('subscription.cancel.modal.confirmButton')}
		cancelLabel={tx('subscription.cancel.modal.keepButton')}
		confirmStyle="danger"
		isLoading={modalLoading}
		error={modalError}
		onConfirm={handleCancelConfirm}
		onCancel={closeModal}
	/>
{/if}
