<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';
	import { formatDate } from '$lib/shared/utils/planHierarchy';

	interface Props {
		periodEndDate: string;
		onReactivate: () => void;
		planId?: string;
	}

	const { periodEndDate, onReactivate, planId = '' }: Props = $props();

	const PLAN_LABELS: Record<string, string> = { pro: 'Pro', proplus: 'Pro+', free: 'Free' };
	const planLabel = $derived(PLAN_LABELS[planId] ?? planId);

	const formattedDate = $derived(() => {
		void locale.current;
		return formatDate(periodEndDate, locale.current as 'en' | 'cs');
	});
</script>

<div
	class="stripe-bg w-full overflow-hidden rounded-2xl border border-brand-orange/40 bg-navy-card"
>
	<div
		class="flex flex-col items-start gap-3 px-4 py-3 md:flex-row md:items-center md:gap-4 md:px-6 md:py-4"
	>
		<!-- Icon + text -->
		<div class="flex shrink-0 items-center gap-3">
			<div
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 md:h-10 md:w-10"
			>
				<i class="fa-solid fa-clock-rotate-left text-sm text-brand-orange md:text-base"></i>
			</div>
			<div>
				<p class="text-sm font-bold text-white">{tx('subscription.cancelling.banner.title')}</p>
				<!-- Desktop subtitle: shows plan name -->
				<p class="hidden text-xs text-text-muted md:block">
					{tx('subscription.cancelling.banner.accessUntil', { plan: planLabel, date: '' })}<span
						class="font-semibold text-brand-orange">{formattedDate()}</span
					>
				</p>
				<!-- Mobile subtitle: shorter text -->
				<p class="text-xs text-text-muted md:hidden">
					{tx('subscription.cancelling.banner.accessUntilMobile', { date: '' })}<span
						class="font-semibold text-brand-orange">{formattedDate()}</span
					>
				</p>
			</div>
		</div>

		<!-- Spacer (desktop only) -->
		<div class="hidden flex-1 md:block"></div>

		<!-- Desktop: downgrade chip + reactivate button -->
		<div class="hidden items-center gap-3 md:flex">
			<div class="flex items-center gap-2 rounded-xl bg-navy-lighter px-3 py-2">
				<i class="fa-regular fa-calendar-xmark text-sm text-brand-orange"></i>
				<span class="text-xs text-text-muted"
					>{tx('subscription.cancelling.banner.downgradeChip', { date: '' })}<span
						class="font-semibold text-white">{formattedDate()}</span
					></span
				>
			</div>
			<button
				onclick={onReactivate}
				class="rounded-xl bg-brand-green px-4 py-2 text-xs font-bold whitespace-nowrap text-white transition-colors hover:bg-green-600"
			>
				<i class="fa-solid fa-rotate-right mr-1.5"></i>
				{tx('subscription.cancelling.banner.reactivateButton')}
			</button>
		</div>

		<!-- Mobile: full-width reactivate button -->
		<button
			onclick={onReactivate}
			class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3 text-sm font-bold text-white transition-colors hover:bg-green-600 md:hidden"
		>
			<i class="fa-solid fa-rotate-right"></i>
			{tx('subscription.cancelling.banner.reactivateButton')}
		</button>
	</div>
</div>
