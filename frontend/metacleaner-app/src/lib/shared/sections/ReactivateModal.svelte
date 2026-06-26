<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';
	import { formatDate } from '$lib/shared/utils/planHierarchy';

	interface Props {
		planId: string;
		price: string;
		billingPeriod: string;
		periodEndDate: string;
		onConfirm: () => void;
		onCancel: () => void;
		isLoading?: boolean;
		error?: string | null;
	}

	const {
		planId,
		price,
		billingPeriod,
		periodEndDate,
		onConfirm,
		onCancel,
		isLoading = false,
		error = null
	}: Props = $props();

	const PLAN_LABELS: Record<string, string> = { pro: 'Pro', proplus: 'Pro+', free: 'Free' };
	const planLabel = $derived(PLAN_LABELS[planId] ?? planId);

	const formattedDate = $derived(() => {
		void locale.current;
		return formatDate(periodEndDate, locale.current as 'en' | 'cs');
	});

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget && !isLoading) {
			onCancel();
		}
	}
</script>

<!-- Desktop: centered dialog -->
<div
	class="fixed inset-0 z-50 hidden items-center justify-center lg:flex"
	role="dialog"
	aria-modal="true"
	aria-labelledby="reactivate-modal-title"
>
	<!-- Backdrop -->
	<div
		class="absolute inset-0 bg-black/70"
		onclick={handleBackdropClick}
		role="presentation"
	></div>

	<!-- Dialog -->
	<div class="relative mx-4 w-full max-w-md rounded-2xl border border-gray-700 bg-navy-card p-6">
		<!-- Header -->
		<div class="mb-5 flex items-center justify-between">
			<h2 id="reactivate-modal-title" class="text-lg font-bold">
				{tx('subscription.cancelling.modal.title', { plan: planLabel })}
			</h2>
			<button
				onclick={onCancel}
				disabled={isLoading}
				aria-label={tx('subscription.modal.cancel')}
				class="flex h-8 w-8 items-center justify-center rounded-full bg-navy-lighter disabled:opacity-50"
			>
				<i class="fa-solid fa-xmark text-sm"></i>
			</button>
		</div>

		<!-- Green info box -->
		<div
			class="mb-4 rounded-xl border border-brand-green/30 bg-brand-green/10 p-4"
		>
			<div class="flex items-start gap-3">
				<i class="fa-solid fa-circle-check mt-0.5 text-brand-green"></i>
				<div>
					<p class="mb-1 text-sm font-semibold text-white">
						{tx('subscription.cancelling.modal.infoTitle')}
					</p>
					<p class="text-xs leading-relaxed text-text-muted">
						{tx('subscription.cancelling.modal.infoBody')}
					</p>
				</div>
			</div>
		</div>

		<!-- Plan summary -->
		<div class="mb-4 rounded-xl bg-navy-lighter p-4">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm text-text-muted">{tx('subscription.cancelling.modal.planLabel')}</span>
				<span class="text-sm font-bold text-brand-green"
					>{planLabel} — {price}/{billingPeriod}</span
				>
			</div>
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm text-text-muted"
					>{tx('subscription.cancelling.modal.todayPaymentLabel')}</span
				>
				<span class="text-sm font-bold text-white"
					>{tx('subscription.cancelling.modal.todayPaymentValue')}</span
				>
			</div>
			<div class="mt-2 border-t border-gray-700 pt-2">
				<div class="flex items-center justify-between">
					<span class="text-xs text-text-muted"
						>{tx('subscription.cancelling.modal.nextPaymentLabel')}</span
					>
					<span class="text-xs font-bold text-white">{formattedDate()}</span>
				</div>
			</div>
		</div>

		{#if error}
			<div class="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
				<i class="fa-solid fa-circle-exclamation mr-1.5"></i>{error}
			</div>
		{/if}

		<!-- Confirm button -->
		<button
			onclick={onConfirm}
			disabled={isLoading}
			class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-70"
		>
			{#if isLoading}
				<i class="fa-solid fa-spinner fa-spin"></i>
				{tx('subscription.modal.loading')}
			{:else}
				<i class="fa-solid fa-rotate-right text-xs"></i>
				{tx('subscription.cancelling.modal.confirmButton')} →
			{/if}
		</button>
	</div>
</div>

<!-- Mobile: bottom sheet -->
<div
	class="fixed inset-0 z-50 flex items-end justify-center lg:hidden"
	role="dialog"
	aria-modal="true"
	aria-labelledby="reactivate-modal-title-mobile"
>
	<!-- Backdrop -->
	<div
		class="absolute inset-0 bg-black/75"
		onclick={handleBackdropClick}
		role="presentation"
	></div>

	<!-- Bottom sheet -->
	<div class="relative w-full max-w-lg rounded-t-3xl border-t border-gray-700 bg-navy-card p-6 pb-10">
		<!-- Drag handle -->
		<div class="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-600"></div>

		<!-- Header -->
		<div class="mb-4 flex items-center justify-between">
			<h2 id="reactivate-modal-title-mobile" class="text-lg font-bold">
				{tx('subscription.cancelling.modal.title', { plan: planLabel })}
			</h2>
			<button
				onclick={onCancel}
				disabled={isLoading}
				aria-label={tx('subscription.modal.cancel')}
				class="flex h-9 w-9 items-center justify-center rounded-full bg-navy-lighter disabled:opacity-50"
			>
				<i class="fa-solid fa-xmark text-sm"></i>
			</button>
		</div>

		<!-- Green info box -->
		<div
			class="mb-4 rounded-xl border border-brand-green/30 bg-brand-green/10 p-4"
		>
			<div class="flex items-start gap-3">
				<i class="fa-solid fa-circle-check mt-0.5 text-brand-green"></i>
				<div>
					<p class="mb-1 text-sm font-semibold text-white">
						{tx('subscription.cancelling.modal.infoTitle')}
					</p>
					<p class="text-xs leading-relaxed text-text-muted">
						{tx('subscription.cancelling.modal.infoBody')}
					</p>
				</div>
			</div>
		</div>

		<!-- Plan summary -->
		<div class="mb-5 rounded-xl bg-navy-lighter p-4">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm text-text-muted">{tx('subscription.cancelling.modal.planLabel')}</span>
				<span class="text-sm font-bold text-brand-green"
					>{planLabel} — {price}/{billingPeriod}</span
				>
			</div>
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm text-text-muted"
					>{tx('subscription.cancelling.modal.todayPaymentLabel')}</span
				>
				<span class="text-sm font-bold text-white"
					>{tx('subscription.cancelling.modal.todayPaymentValue')}</span
				>
			</div>
			<div class="mt-2 border-t border-gray-700 pt-2">
				<div class="flex items-center justify-between">
					<span class="text-xs text-text-muted"
						>{tx('subscription.cancelling.modal.nextPaymentLabel')}</span
					>
					<span class="text-xs font-bold text-white">{formattedDate()}</span>
				</div>
			</div>
		</div>

		{#if error}
			<div class="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
				<i class="fa-solid fa-circle-exclamation mr-1.5"></i>{error}
			</div>
		{/if}

		<!-- Confirm button -->
		<button
			onclick={onConfirm}
			disabled={isLoading}
			class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-70"
		>
			{#if isLoading}
				<i class="fa-solid fa-spinner fa-spin"></i>
				{tx('subscription.modal.loading')}
			{:else}
				<i class="fa-solid fa-rotate-right text-xs"></i>
				{tx('subscription.cancelling.modal.confirmButton')} →
			{/if}
		</button>
	</div>
</div>
