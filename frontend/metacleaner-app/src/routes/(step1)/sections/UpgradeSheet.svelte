<script lang="ts">
	import BottomSheet from '$lib/shared/components/BottomSheet.svelte';
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		open: boolean;
		onClose: () => void;
		onUpgrade?: () => void;
	}

	let { open, onClose, onUpgrade }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	const proFeatures = $derived([
		tx('upgrade.features.unlimitedFiles'),
		tx('upgrade.features.largeFiles'),
		tx('upgrade.features.batchProcessing'),
		tx('upgrade.features.prioritySupport'),
	]);

	const freeLimits = $derived([
		tx('upgrade.limit.maxFilesDay'),
		tx('upgrade.limit.maxFileSize'),
	]);
</script>

<BottomSheet {open} title={tx('upgrade.title')} {onClose}>
	<div class="px-5 pt-4 pb-2 flex flex-col gap-0">
		<!-- Current Plan -->
		<div class="bg-navy-main/60 rounded-xl p-3.5 border border-gray-700 flex items-center gap-3 mb-4">
			<div class="w-9 h-9 rounded-lg bg-navy-lighter flex items-center justify-center">
				<i class="fa-solid fa-bolt text-text-muted text-sm"></i>
			</div>
			<div class="flex-1">
				<p class="text-xs font-bold text-text-muted uppercase tracking-wider">{tx('upgrade.currentPlan')}</p>
				<p class="text-sm font-semibold text-white mt-0.5">{tx('upgrade.free')}</p>
			</div>
			<span class="text-xs text-text-muted bg-navy-lighter px-2 py-1 rounded-full">{tx('upgrade.active')}</span>
		</div>

		<!-- Pro Plan Card -->
		<div class="bg-gradient-to-br from-brand-orange/10 to-brand-orange/5 rounded-xl p-4 border border-brand-orange/40 flex flex-col gap-3 mb-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="w-9 h-9 rounded-lg bg-brand-orange/20 flex items-center justify-center">
						<i class="fa-solid fa-crown text-brand-orange text-sm"></i>
					</div>
					<div>
						<p class="text-sm font-bold text-white">{tx('upgrade.pro')}</p>
						<p class="text-[10px] text-text-muted">{tx('upgrade.fullAccess')}</p>
					</div>
				</div>
				<div class="text-right">
					<p class="text-lg font-black text-white">{tx('upgrade.price')}</p>
					<p class="text-[10px] text-text-muted">{tx('upgrade.perMonth')}</p>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				{#each proFeatures as feature}
					<div class="flex items-center gap-2">
						<i class="fa-solid fa-check text-brand-green text-xs w-4"></i>
						<span class="text-xs text-text-muted">{feature}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Free Plan Limits -->
		<div class="flex flex-col gap-1.5 mb-4">
			<p class="text-[10px] text-text-muted uppercase tracking-wider font-bold">
				{tx('upgrade.freeLimits')}
			</p>
			{#each freeLimits as limit}
				<div class="flex items-center gap-2">
					<i class="fa-solid fa-xmark text-brand-red text-xs w-4"></i>
					<span class="text-xs text-text-muted">{limit}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="px-5 pb-6 pt-2 flex flex-col gap-2">
		<button
			onclick={onUpgrade ?? onClose}
			class="w-full py-4 rounded-xl bg-brand-orange text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
		>
			<i class="fa-solid fa-crown"></i>
			{tx('upgrade.cta')}
		</button>
		<button
			onclick={onClose}
			class="w-full py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm flex items-center justify-center gap-2"
		>
			{tx('upgrade.stayFree')}
		</button>
	</div>
</BottomSheet>
