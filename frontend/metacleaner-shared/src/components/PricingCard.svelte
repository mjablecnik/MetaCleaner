<script lang="ts">
	import type { Plan } from '../types/pricing.js';
	import { getPlanPrice } from '../data/pricing.js';

	interface Props {
		plan: Plan;
		isYearly: boolean;
		size?: 'desktop' | 'mobile';
		translate: (key: string) => string;
		translateParam?: (key: string, params: Record<string, string>) => string;
		onSelect?: (planId: string, billing: 'monthly' | 'yearly') => void;
		isCurrent?: boolean;
	}

	const {
		plan,
		isYearly,
		size = 'desktop',
		translate,
		translateParam,
		onSelect,
		isCurrent = false
	}: Props = $props();

	const isMobile = $derived(size === 'mobile');
	const price = $derived(getPlanPrice(plan, isYearly));
	const billing = $derived<'monthly' | 'yearly'>(isYearly ? 'yearly' : 'monthly');

	function handleSelect() {
		if (onSelect && !plan.disabled) {
			onSelect(plan.id, billing);
		}
	}

	function savingText(amount: string): string {
		if (translateParam) {
			return translateParam('pricing_save', { amount });
		}
		return translate('pricing_save');
	}
</script>

{#if isMobile}
	<!-- Mobile Card Layout -->
	<div
		class="flex flex-col rounded-2xl bg-navy-card p-5 {plan.featured
			? 'relative border-2 border-brand-blue shadow-glow-blue'
			: 'border border-gray-800'}"
	>
		{#if plan.featured}
			<div
				class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-blue px-4 py-1 text-xs font-bold whitespace-nowrap text-white"
			>
				{translate('pricing_badge_popular')}
			</div>
		{/if}

		<div
			class="flex items-center justify-between {plan.featured ? 'mt-2 mb-1' : plan.perKey ? 'mb-1' : 'mb-3'}"
		>
			<h3 class="text-lg font-bold">{plan.nameText ?? translate(plan.nameKey!)}</h3>
			{#if plan.originalYearly}
				<div class="flex flex-col items-end">
					<div class="flex items-end gap-1">
						<span class="text-3xl font-black">{price}</span>
						{#if plan.perKey}
							<span class="mb-1 text-xs text-text-muted">{translate(plan.perKey)}</span>
						{/if}
					</div>
					{#if isYearly}
						<div class="text-right">
							<span class="text-xs text-text-muted line-through">{plan.originalYearly}</span>
							<span class="ml-1 text-xs font-bold text-brand-green"
								>{savingText(plan.saveAmountYearly!)}</span
							>
						</div>
					{/if}
				</div>
			{:else}
				<div class="flex items-end gap-1">
					<span class="text-3xl font-black">{price}</span>
					{#if plan.perKey}
						<span class="mb-1 text-xs text-text-muted">{translate(plan.perKey)}</span>
					{/if}
				</div>
			{/if}
		</div>

		<p class="mb-4 text-xs text-text-muted">{translate(plan.subtitleKey)}</p>

		<ul class="mb-4 flex flex-col gap-2.5">
			{#each plan.featureKeys as key, i (key)}
				<li class="flex items-start gap-2.5">
					<i class="fa-solid fa-check mt-0.5 text-xs text-brand-blue"></i>
					<span class="text-sm {i === 0 ? 'font-medium' : 'text-text-muted'}"
						>{translate(key)}</span
					>
				</li>
			{/each}
		</ul>

		{#if isCurrent}
			<button
				disabled
				class="w-full cursor-default rounded-xl border border-brand-blue bg-brand-blue/20 py-3 text-sm font-semibold text-brand-blue"
			>
				{translate('pricing_current_plan')}
			</button>
		{:else if plan.featured}
			<button
				onclick={handleSelect}
				class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
			>
				<i class="fa-solid fa-bolt text-brand-orange"></i>
				{translate(plan.ctaKey)}
			</button>
		{:else if plan.disabled}
			<button
				disabled
				class="w-full cursor-not-allowed rounded-xl border border-gray-700 py-3 text-sm font-semibold text-text-muted"
			>
				{translate(plan.ctaKey)}
			</button>
		{:else if plan.id === 'pack' || plan.id === 'proplus'}
			<button
				onclick={handleSelect}
				class="w-full rounded-xl bg-brand-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
			>
				{translate(plan.ctaKey)}
			</button>
		{:else}
			<button
				onclick={handleSelect}
				class="w-full rounded-xl border border-gray-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-lighter"
			>
				{translate(plan.ctaKey)}
			</button>
		{/if}
	</div>
{:else}
	<!-- Desktop Card Layout -->
	<div
		class="relative flex h-full flex-col rounded-2xl bg-navy-card p-8 {plan.featured
			? 'z-10 scale-105 transform border-2 border-brand-blue shadow-glow-blue'
			: 'border border-gray-800'}"
	>
		{#if plan.featured}
			<div
				class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-blue px-4 py-1 text-xs font-bold whitespace-nowrap text-white"
			>
				{translate('pricing_badge_popular')}
			</div>
		{/if}

		<h3 class="mb-6 text-center text-xl font-bold">{plan.nameText ?? translate(plan.nameKey!)}</h3>

		<div
			class="flex items-end justify-center gap-1 text-center {plan.originalYearly ? 'mb-1' : 'mb-2'}"
		>
			<span class="text-5xl font-black">{price}</span>
			{#if plan.perKey && plan.id === 'pack'}
				<span class="mb-1 text-sm text-text-muted">{translate(plan.perKey)}</span>
			{/if}
		</div>

		{#if plan.originalYearly && isYearly}
			<div class="mb-1 text-center">
				<span class="text-xs text-text-muted line-through">{plan.originalYearly}</span>
				<span class="ml-1 text-xs font-bold text-brand-green"
					>{savingText(plan.saveAmountYearly!)}</span
				>
			</div>
		{/if}

		<p class="mb-8 text-center text-sm text-text-muted">{translate(plan.subtitleKey)}</p>

		<ul class="mb-8 flex flex-1 flex-col gap-4">
			{#each plan.featureKeys as key, i (key)}
				<li class="flex items-start gap-3">
					<i class="fa-solid fa-check mt-1 text-sm text-brand-blue"></i>
					<span class="text-sm font-medium {i === 0 ? '' : 'text-text-muted'}"
						>{translate(key)}</span
					>
				</li>
			{/each}
		</ul>

		{#if isCurrent}
			<button
				disabled
				class="mt-auto w-full cursor-default rounded-lg border border-brand-blue bg-brand-blue/20 py-3 font-semibold text-brand-blue"
			>
				{translate('pricing_current_plan')}
			</button>
		{:else if plan.featured}
			<button
				onclick={handleSelect}
				class="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue py-3 font-semibold text-white transition-colors hover:bg-blue-600"
			>
				<i class="fa-solid fa-bolt text-brand-orange"></i>
				{translate(plan.ctaKey)}
			</button>
		{:else if plan.disabled}
			<button
				disabled
				class="mt-auto w-full cursor-not-allowed rounded-lg border border-gray-700 py-3 font-semibold text-text-muted"
			>
				{translate(plan.ctaKey)}
			</button>
		{:else if plan.id === 'pack' || plan.id === 'proplus'}
			<button
				onclick={handleSelect}
				class="mt-auto w-full rounded-lg bg-brand-blue py-3 font-semibold text-white transition-colors hover:bg-blue-600"
			>
				{translate(plan.ctaKey)}
			</button>
		{:else}
			<button
				onclick={handleSelect}
				class="mt-auto w-full rounded-lg border border-gray-700 py-3 font-semibold text-white transition-colors hover:bg-navy-lighter"
			>
				{translate(plan.ctaKey)}
			</button>
		{/if}
	</div>
{/if}
