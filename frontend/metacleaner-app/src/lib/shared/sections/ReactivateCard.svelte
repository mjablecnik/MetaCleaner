<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';
	import { formatDate } from '$lib/shared/utils/planHierarchy';

	interface Props {
		planId: string;
		price: string;
		billingPeriod: string;
		periodEndDate: string;
		onReactivate: () => void;
	}

	const { planId, price, billingPeriod: _billingPeriod, periodEndDate, onReactivate }: Props = $props();

	const PLAN_LABELS: Record<string, string> = { pro: 'Pro', proplus: 'Pro+', free: 'Free' };
	const planLabel = $derived(PLAN_LABELS[planId] ?? planId);

	const formattedDate = $derived(() => {
		void locale.current;
		return formatDate(periodEndDate, locale.current as 'en' | 'cs');
	});
</script>

<div
	class="relative overflow-hidden rounded-2xl border border-brand-green/40 bg-navy-card p-4 lg:p-5"
>
	<!-- Background decoration -->
	<div
		class="absolute top-0 right-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-brand-green opacity-5 lg:h-24 lg:w-24 lg:-translate-y-8 lg:translate-x-8"
	></div>

	<!-- Header: icon, title, price -->
	<div class="mb-3 flex items-center gap-3">
		<div
			class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/15 lg:h-10 lg:w-10"
		>
			<i class="fa-solid fa-rotate-right text-brand-green"></i>
		</div>
		<div class="flex-1">
			<h3 class="text-sm font-bold">
				{tx('subscription.cancelling.reactivateCard.title', { plan: planLabel })}
			</h3>
			<p class="text-xs text-text-muted">
				{tx('subscription.cancelling.reactivateCard.subtitle')}
			</p>
		</div>
		<div class="shrink-0 text-right">
			<div class="text-lg font-black text-brand-green">{price}</div>
			<div class="text-xs text-text-muted">
				{tx('subscription.cancelling.reactivateCard.perMonth')}
			</div>
		</div>
	</div>

	<!-- Benefits list -->
	<div class="mb-3 flex flex-col gap-1.5 rounded-xl bg-navy-lighter p-3">
		<div class="flex items-center gap-2">
			<i class="fa-solid fa-check text-xs text-brand-green"></i>
			<span class="text-xs text-text-muted"
				>{tx('subscription.cancelling.reactivateCard.benefit1')}</span
			>
		</div>
		<div class="flex items-center gap-2">
			<i class="fa-solid fa-check text-xs text-brand-green"></i>
			<span class="text-xs text-text-muted"
				>{tx('subscription.cancelling.reactivateCard.benefit2')}</span
			>
		</div>
		<div class="flex items-center gap-2">
			<i class="fa-solid fa-check text-xs text-brand-green"></i>
			<span class="text-xs text-text-muted"
				>{tx('subscription.cancelling.reactivateCard.benefit3', { date: formattedDate() })}</span
			>
		</div>
	</div>

	<!-- Reactivate button -->
	<button
		onclick={onReactivate}
		class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3 text-sm font-bold text-white transition-colors hover:bg-green-600 lg:py-3.5"
	>
		<i class="fa-solid fa-rotate-right text-xs"></i>
		{tx('subscription.cancelling.reactivateCard.button')} →
	</button>
</div>
