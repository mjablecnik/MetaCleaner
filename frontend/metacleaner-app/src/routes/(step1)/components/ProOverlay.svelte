<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import type { Pathname } from '$app/types';

	function handleUpgrade() {
		goto(resolve('/pricing' as Pathname));
	}
</script>

<div
	class="pointer-events-auto absolute inset-0 flex flex-col items-center justify-end rounded-2xl bg-gradient-to-b from-transparent via-navy-main/60 to-navy-main/95 pt-8 pb-6"
>
	<div class="flex flex-col items-center gap-4 px-6 text-center">
		<!-- Lock icon with Pro badge -->
		<div class="relative inline-flex">
			<div
				class="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-700 bg-navy-lighter"
			>
				<i class="fa-solid fa-lock text-xl text-text-muted"></i>
			</div>
			<span
				class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-orange-500 text-[9px] font-black text-white"
			>
				<i class="fa-solid fa-star text-[7px]"></i>
			</span>
		</div>

		<!-- Title + PRO badge -->
		<div class="flex items-center gap-2">
			<h3 class="text-base font-bold text-white">{tx('proOverlay.title')}</h3>
			<span
				class="rounded bg-gradient-to-r from-brand-orange to-orange-500 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white uppercase"
			>
				{tx('proOverlay.proBadge')}
			</span>
		</div>

		<!-- Description -->
		<p class="max-w-xs text-xs text-text-muted">
			{tx('proOverlay.description')}
		</p>

		<!-- Feature chips -->
		<div class="flex flex-wrap justify-center gap-2">
			<span
				class="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-navy-lighter px-2.5 py-1 text-[10px] font-medium text-text-muted"
			>
				<i class="fa-solid fa-location-dot text-[9px] text-brand-orange"></i>
				{tx('proOverlay.chipGps')}
			</span>
			<span
				class="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-navy-lighter px-2.5 py-1 text-[10px] font-medium text-text-muted"
			>
				<i class="fa-solid fa-fingerprint text-[9px] text-brand-orange"></i>
				{tx('proOverlay.chipIdentity')}
			</span>
			<span
				class="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-navy-lighter px-2.5 py-1 text-[10px] font-medium text-text-muted"
			>
				<i class="fa-solid fa-chart-bar text-[9px] text-brand-orange"></i>
				{tx('proOverlay.chipRisk')}
			</span>
		</div>

		<!-- CTA button -->
		<button
			onclick={handleUpgrade}
			class="w-full rounded-xl bg-gradient-to-r from-brand-orange to-orange-500 py-3 text-sm font-bold text-white shadow-glow-orange transition-all hover:from-orange-500 hover:to-orange-400 active:scale-95"
		>
			{tx('proOverlay.cta')}
		</button>

		<!-- Price hint -->
		<p class="text-[10px] text-text-muted">
			{tx('proOverlay.priceHint')}
		</p>
	</div>
</div>
