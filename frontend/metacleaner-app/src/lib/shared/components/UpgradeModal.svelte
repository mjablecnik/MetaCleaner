<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import type { Pathname } from '$app/types';

	interface Props {
		onDismiss: () => void;
		variant?: 'reports' | 'docs';
	}

	const { onDismiss, variant = 'reports' }: Props = $props();

	const titleKey = $derived(variant === 'docs' ? 'upgradeModal.docs.title' : 'upgradeModal.title');
	const descriptionKey = $derived(
		variant === 'docs' ? 'upgradeModal.docs.description' : 'upgradeModal.description'
	);
	const ctaKey = $derived(variant === 'docs' ? 'upgradeModal.docs.cta' : 'upgradeModal.cta');

	function handleUpgrade() {
		goto(resolve('/subscription' as Pathname));
	}
</script>

<div class="flex flex-col items-center gap-6 px-6 py-8 text-center">
	<!-- Lock icon with Pro badge -->
	<div class="relative inline-flex">
		<div
			class="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-700 bg-navy-lighter"
		>
			<i class="fa-solid fa-lock text-2xl text-text-muted"></i>
		</div>
		<span
			class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-orange-500 text-[10px] font-black text-white shadow-glow-orange"
		>
			<i class="fa-solid fa-star text-[8px]"></i>
		</span>
	</div>

	<!-- Title -->
	<div class="flex flex-col gap-2">
		<h2 class="text-xl font-bold text-white">{tx(titleKey)}</h2>
		<p class="max-w-sm text-sm text-text-muted">
			{tx(descriptionKey)}
		</p>
	</div>

	<!-- Feature highlights -->
	<div class="flex flex-col gap-2 text-left">
		{#if variant === 'docs'}
			<div class="flex items-center gap-2 text-sm text-text-muted">
				<i class="fa-solid fa-check text-xs text-brand-green"></i>
				<span>{tx('upgradeModal.docs.feat1')}</span>
			</div>
			<div class="flex items-center gap-2 text-sm text-text-muted">
				<i class="fa-solid fa-check text-xs text-brand-green"></i>
				<span>{tx('upgradeModal.docs.feat2')}</span>
			</div>
			<div class="flex items-center gap-2 text-sm text-text-muted">
				<i class="fa-solid fa-check text-xs text-brand-green"></i>
				<span>{tx('upgradeModal.docs.feat3')}</span>
			</div>
		{:else}
			<div class="flex items-center gap-2 text-sm text-text-muted">
				<i class="fa-solid fa-check text-xs text-brand-green"></i>
				<span>{tx('upgradeModal.reports.feat1')}</span>
			</div>
			<div class="flex items-center gap-2 text-sm text-text-muted">
				<i class="fa-solid fa-check text-xs text-brand-green"></i>
				<span>{tx('upgradeModal.reports.feat2')}</span>
			</div>
			<div class="flex items-center gap-2 text-sm text-text-muted">
				<i class="fa-solid fa-check text-xs text-brand-green"></i>
				<span>{tx('upgradeModal.reports.feat3')}</span>
			</div>
		{/if}
	</div>

	<!-- CTA button -->
	<div class="flex w-full flex-col gap-3">
		<button
			onclick={handleUpgrade}
			class="w-full rounded-xl bg-gradient-to-r from-brand-orange to-orange-500 py-3.5 text-sm font-bold text-white shadow-glow-orange transition-all hover:from-orange-500 hover:to-orange-400 active:scale-95"
		>
			{tx(ctaKey)}
		</button>
		<button
			onclick={onDismiss}
			class="w-full rounded-xl border border-gray-700 bg-navy-lighter py-3 text-sm font-medium text-text-muted transition-all hover:bg-gray-800 hover:text-white"
		>
			{tx('upgradeModal.dismiss')}
		</button>
	</div>
</div>
