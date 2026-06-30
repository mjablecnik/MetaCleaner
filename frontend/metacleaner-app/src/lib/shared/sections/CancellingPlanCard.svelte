<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';
	import { formatDate } from '$lib/shared/utils/planHierarchy';

	interface Props {
		planId: string;
		price: string;
		monthlyAllowance: number;
		creditsUsed: number;
		creditsRemaining: number;
		periodEndDate: string;
		features: string[];
	}

	const {
		planId,
		price,
		monthlyAllowance,
		creditsUsed: _creditsUsed,
		creditsRemaining,
		periodEndDate,
		features
	}: Props = $props();

	const PLAN_LABELS: Record<string, string> = { pro: 'Pro', proplus: 'Pro+', free: 'Free' };
	const planLabel = $derived(PLAN_LABELS[planId] ?? planId);

	const formattedDate = $derived(() => {
		void locale.current;
		return formatDate(periodEndDate, locale.current as 'en' | 'cs');
	});

	const barWidth = $derived(() => {
		if (monthlyAllowance === 0) return 0;
		return Math.min(creditsRemaining / monthlyAllowance, 1) * 100;
	});

	const daysRemaining = $derived(() => {
		const end = new Date(periodEndDate);
		const now = new Date();
		return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
	});
</script>

<div
	class="relative rounded-2xl border-2 border-brand-orange/50 bg-navy-card p-5 shadow-glow-orange lg:p-6"
>
	<!-- Expiring plan badge -->
	<div
		class="absolute -top-3 left-4 flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold text-white lg:left-5"
	>
		<i class="fa-solid fa-hourglass-half text-xs"></i>
		{tx('subscription.cancelling.planCard.badge')}
	</div>

	<!-- Plan name and price -->
	<div class="mt-2 mb-4 flex items-start justify-between lg:mb-5">
		<div>
			<div class="mb-1 flex items-center gap-2">
				<h2 class="text-3xl font-black">{planLabel}</h2>
				<span
					class="rounded-full border border-brand-orange/30 bg-brand-orange/15 px-2 py-0.5 text-xs font-bold text-brand-orange"
				>
					{tx('subscription.cancelling.planCard.cancelledTag')}
				</span>
			</div>
			<p class="text-sm text-text-muted">
				{monthlyAllowance}
				{tx('subscription.currentPlan.photosPerMonth')}
			</p>
		</div>
		<div class="text-right">
			<div class="text-2xl font-black text-text-muted line-through lg:text-3xl">{price}</div>
			<div class="text-xs text-text-muted lg:text-sm">
				{tx('subscription.cancelling.planCard.perMonth')}
			</div>
		</div>
	</div>

	<!-- Credits usage -->
	<div class="mb-4 lg:mb-5">
		<div class="mb-2 flex items-center justify-between">
			<span class="text-xs font-medium text-text-muted lg:text-sm">
				{tx('subscription.cancelling.planCard.creditsThisMonth')}
			</span>
			<span class="text-xs font-bold text-white lg:text-sm">
				{creditsRemaining} / {monthlyAllowance}
			</span>
		</div>
		<div class="h-2.5 w-full overflow-hidden rounded-full bg-navy-lighter">
			<div class="progress-bar-orange h-full" style="width: {barWidth()}%"></div>
		</div>
		<p class="mt-1.5 text-xs text-text-muted lg:mt-2">
			{tx('subscription.cancelling.planCard.photosRemaining', { count: creditsRemaining })}
			<span class="font-medium text-brand-orange">
				{tx('subscription.cancelling.planCard.creditsExpire', { date: formattedDate() })}
			</span>
		</p>
	</div>

	<!-- Transition timeline -->
	<div class="mb-4 rounded-xl bg-navy-lighter p-3 lg:mb-5 lg:p-4">
		<p class="mb-3 text-xs font-semibold tracking-wider text-text-muted uppercase">
			{tx('subscription.cancelling.planCard.timeline.title')}
		</p>
		<div class="flex items-center">
			<!-- Node 1: Today (green) -->
			<div class="flex flex-col items-center">
				<div
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green lg:h-8 lg:w-8"
				>
					<i class="fa-solid fa-check text-xs text-white"></i>
				</div>
				<span class="mt-1 text-xs font-semibold whitespace-nowrap text-brand-green">
					{tx('subscription.cancelling.planCard.timeline.today')}
				</span>
				<span class="text-xs text-text-muted">
					{tx('subscription.cancelling.planCard.timeline.todaySubtitle', { plan: planLabel })}
				</span>
			</div>

			<!-- Connector: orange line with days count -->
			<div class="relative mx-1.5 h-0.5 flex-1 bg-brand-orange lg:mx-2">
				<div
					class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-navy-lighter px-1 lg:px-2"
				>
					<span class="text-xs font-medium text-brand-orange">
						{daysRemaining()}{tx('subscription.cancelling.countdown.days.abbr')}
					</span>
				</div>
			</div>

			<!-- Node 2: Downgrade date (orange) -->
			<div class="flex flex-col items-center">
				<div
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-orange lg:h-8 lg:w-8"
				>
					<i class="fa-solid fa-arrow-down text-xs text-white"></i>
				</div>
				<span class="mt-1 text-xs font-semibold whitespace-nowrap text-brand-orange">
					{formattedDate()}
				</span>
				<span class="text-xs text-text-muted">
					{tx('subscription.cancelling.planCard.timeline.downgrade')}
				</span>
			</div>

			<!-- Connector: grey line -->
			<div class="mx-1.5 h-0.5 flex-1 bg-gray-700 lg:mx-2"></div>

			<!-- Node 3: Free plan (grey) -->
			<div class="flex flex-col items-center">
				<div
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-600 bg-navy-lighter lg:h-8 lg:w-8"
				>
					<i class="fa-solid fa-lock text-xs text-text-muted"></i>
				</div>
				<span class="mt-1 text-xs font-semibold whitespace-nowrap text-text-muted">
					{formattedDate()}
				</span>
				<span class="text-xs text-text-muted">
					{tx('subscription.cancelling.planCard.timeline.freePlan')}
				</span>
			</div>
		</div>
	</div>

	<!-- Plan features -->
	{#if features.length > 0}
		<div class="rounded-xl bg-navy-lighter p-3 lg:p-4">
			<p class="mb-2.5 text-xs font-semibold tracking-wider text-text-muted uppercase lg:mb-3">
				{tx('subscription.cancelling.planCard.features.title', { date: formattedDate() })}
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
</div>
