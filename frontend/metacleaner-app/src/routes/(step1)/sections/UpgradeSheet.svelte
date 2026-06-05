<script lang="ts">
	import BottomSheet from '$lib/shared/components/BottomSheet.svelte';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		open: boolean;
		onClose: () => void;
		onUpgrade?: () => void;
	}

	let { open, onClose, onUpgrade }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	const proFeatures = $derived([
		tx('upgrade.features.unlimitedFiles'),
		tx('upgrade.features.largeFiles'),
		tx('upgrade.features.batchProcessing'),
		tx('upgrade.features.prioritySupport')
	]);

	const freeLimits = $derived([tx('upgrade.limit.maxFilesDay'), tx('upgrade.limit.maxFileSize')]);
</script>

<BottomSheet {open} title={tx('upgrade.title')} {onClose}>
	<div class="flex flex-col gap-0 px-5 pt-4 pb-2">
		<!-- Current Plan -->
		<div
			class="mb-4 flex items-center gap-3 rounded-xl border border-gray-700 bg-navy-main/60 p-3.5"
		>
			<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-lighter">
				<i class="fa-solid fa-bolt text-sm text-text-muted"></i>
			</div>
			<div class="flex-1">
				<p class="text-xs font-bold tracking-wider text-text-muted uppercase">
					{tx('upgrade.currentPlan')}
				</p>
				<p class="mt-0.5 text-sm font-semibold text-white">{tx('upgrade.free')}</p>
			</div>
			<span class="rounded-full bg-navy-lighter px-2 py-1 text-xs text-text-muted"
				>{tx('upgrade.active')}</span
			>
		</div>

		<!-- Pro Plan Card -->
		<div
			class="mb-4 flex flex-col gap-3 rounded-xl border border-brand-orange/40 bg-gradient-to-br from-brand-orange/10 to-brand-orange/5 p-4"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-orange/20">
						<i class="fa-solid fa-crown text-sm text-brand-orange"></i>
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
				{#each proFeatures as feature (feature)}
					<div class="flex items-center gap-2">
						<i class="fa-solid fa-check w-4 text-xs text-brand-green"></i>
						<span class="text-xs text-text-muted">{feature}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Free Plan Limits -->
		<div class="mb-4 flex flex-col gap-1.5">
			<p class="text-[10px] font-bold tracking-wider text-text-muted uppercase">
				{tx('upgrade.freeLimits')}
			</p>
			{#each freeLimits as limit (limit)}
				<div class="flex items-center gap-2">
					<i class="fa-solid fa-xmark w-4 text-xs text-brand-red"></i>
					<span class="text-xs text-text-muted">{limit}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="flex flex-col gap-2 px-5 pt-2 pb-6">
		<button
			onclick={onUpgrade ?? onClose}
			class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange py-4 text-sm font-bold text-white shadow-lg"
		>
			<i class="fa-solid fa-crown"></i>
			{tx('upgrade.cta')}
		</button>
		<button
			onclick={onClose}
			class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3.5 text-sm font-semibold text-text-muted"
		>
			{tx('upgrade.stayFree')}
		</button>
	</div>
</BottomSheet>
