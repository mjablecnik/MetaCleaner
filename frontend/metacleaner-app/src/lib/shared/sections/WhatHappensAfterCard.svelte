<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';
	import { formatDate } from '$lib/shared/utils/planHierarchy';

	interface Props {
		periodEndDate: string;
		creditsRemaining: number;
	}

	const { periodEndDate, creditsRemaining }: Props = $props();

	const formattedDate = $derived(() => {
		void locale.current;
		return formatDate(periodEndDate, locale.current as 'en' | 'cs');
	});

	let isOpen = $state(false);
</script>

{#snippet items()}
	<div class="flex items-start gap-2.5 rounded-xl bg-navy-lighter p-3">
		<i class="fa-solid fa-xmark mt-0.5 text-xs text-brand-red"></i>
		<span class="text-xs leading-relaxed text-text-muted">
			{tx('subscription.cancelling.after.creditsLost', { count: creditsRemaining })}
		</span>
	</div>
	<div class="flex items-start gap-2.5 rounded-xl bg-navy-lighter p-3">
		<i class="fa-solid fa-xmark mt-0.5 text-xs text-brand-red"></i>
		<span class="text-xs leading-relaxed text-text-muted">
			{tx('subscription.cancelling.after.riskScannerLost')}
		</span>
	</div>
	<div class="flex items-start gap-2.5 rounded-xl bg-navy-lighter p-3">
		<i class="fa-solid fa-xmark mt-0.5 text-xs text-brand-red"></i>
		<span class="text-xs leading-relaxed text-text-muted">
			{tx('subscription.cancelling.after.pdfLost')}
		</span>
	</div>
	<div class="flex items-start gap-2.5 rounded-xl bg-navy-lighter p-3">
		<i class="fa-solid fa-check mt-0.5 text-xs text-brand-green"></i>
		<span class="text-xs leading-relaxed text-text-muted">
			{tx('subscription.cancelling.after.freeKept')}
		</span>
	</div>
{/snippet}

<div class="overflow-hidden rounded-2xl border border-gray-800 bg-navy-card">
	<!-- Mobile: collapsible accordion header (hidden on desktop) -->
	<button onclick={() => (isOpen = !isOpen)} class="flex w-full items-center gap-3 p-4 lg:hidden">
		<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-navy-lighter">
			<i class="fa-solid fa-circle-info text-sm text-text-muted"></i>
		</div>
		<h3 class="flex-1 text-left text-sm font-bold">
			{tx('subscription.cancelling.after.title', { date: formattedDate() })}
		</h3>
		<i
			class="fa-solid fa-chevron-down text-xs text-text-muted transition-transform"
			class:rotate-180={isOpen}
		></i>
	</button>

	<!-- Mobile: accordion body (shown when open) -->
	{#if isOpen}
		<div class="flex flex-col gap-2 px-4 pb-4 lg:hidden">
			{@render items()}
		</div>
	{/if}

	<!-- Desktop: static header (hidden on mobile) -->
	<div class="hidden items-center gap-3 p-5 pb-0 lg:flex">
		<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-lighter">
			<i class="fa-solid fa-circle-info text-sm text-text-muted"></i>
		</div>
		<h3 class="text-sm font-bold">
			{tx('subscription.cancelling.after.title', { date: formattedDate() })}
		</h3>
	</div>

	<!-- Desktop: grid body (hidden on mobile) -->
	<div class="hidden grid-cols-2 gap-3 p-5 pt-4 lg:grid">
		{@render items()}
	</div>
</div>
