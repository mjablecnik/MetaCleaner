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

	const { plan, isYearly, size = 'desktop', translate, translateParam, onSelect, isCurrent = false }: Props = $props();

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
	<div
		class="bg-navy-card rounded-2xl {plan.featured
			? 'border-2 border-brand-blue shadow-glow-blue relative'
			: 'border border-border'} p-5 flex flex-col"
	>
		{#if plan.featured}
			<div
				class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
			>
				{translate('pricing_badge_popular')}
			</div>
		{/if}

		<div
			class="flex items-center justify-between {plan.perKey ? 'mb-1' : 'mb-3'} {plan.featured
				? 'mt-2'
				: ''}"
		>
			<h3 class="text-lg font-bold">{plan.nameText ?? translate(plan.nameKey!)}</h3>
			{#if plan.originalYearly}
				<div class="flex flex-col items-end">
					<div class="flex items-end gap-1">
						<span class="text-3xl font-black">{price}</span>
						{#if plan.perKey}
							<span class="text-text-muted text-xs mb-1">{translate(plan.perKey)}</span>
						{/if}
					</div>
					{#if isYearly}
						<div class="text-right">
							<span class="text-xs text-text-muted line-through">{plan.originalYearly}</span>
							<span class="text-xs text-brand-green font-bold ml-1"
								>{savingText(plan.saveAmountYearly!)}</span
							>
						</div>
					{/if}
				</div>
			{:else}
				<div class="flex items-end gap-1">
					<span class="text-3xl font-black">{price}</span>
					{#if plan.perKey}
						<span class="text-text-muted text-xs mb-1">{translate(plan.perKey)}</span>
					{/if}
				</div>
			{/if}
		</div>

		<p class="text-xs text-text-muted mb-4">{translate(plan.subtitleKey)}</p>

		<ul class="flex flex-col gap-2.5 mb-4">
			{#each plan.featureKeys as key, i (key)}
				<li class="flex items-start gap-2.5">
					<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
					<span class="text-sm {i === 0 ? 'font-medium' : 'text-text-muted'}">{translate(key)}</span>
				</li>
			{/each}
		</ul>

		{#if isCurrent}
			<button
				disabled
				class="w-full py-3 rounded-xl bg-brand-blue/20 text-brand-blue font-semibold text-sm border border-brand-blue cursor-default"
			>
				{translate('pricing_current_plan')}
			</button>
		{:else if plan.featured}
			<button
				onclick={handleSelect}
				class="w-full py-3 rounded-xl bg-brand-blue text-white font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
			>
				<i class="fa-solid fa-bolt text-brand-orange"></i>
				{translate(plan.ctaKey)}
			</button>
		{:else if plan.disabled}
			<button
				disabled
				class="w-full py-3 rounded-xl border border-border-strong text-text-muted font-semibold text-sm cursor-not-allowed"
			>
				{translate(plan.ctaKey)}
			</button>
		{:else if plan.id === 'pack'}
			<button
				onclick={handleSelect}
				class="w-full py-3 rounded-xl bg-brand-blue text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
			>
				{translate(plan.ctaKey)}
			</button>
		{:else}
			<button
				onclick={handleSelect}
				class="w-full py-3 rounded-xl border border-border-strong text-white font-semibold text-sm hover:bg-navy-lighter transition-colors"
			>
				{translate(plan.ctaKey)}
			</button>
		{/if}
	</div>
{:else}
	<div
		class="bg-navy-card rounded-2xl {plan.featured
			? 'border-2 border-brand-blue transform scale-105 z-10 shadow-glow-blue'
			: 'border border-border'} p-8 flex flex-col relative h-full"
	>
		{#if plan.featured}
			<div
				class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
			>
				{translate('pricing_badge_popular')}
			</div>
		{/if}

		<h3 class="text-xl font-bold text-center mb-6">{plan.nameText ?? translate(plan.nameKey!)}</h3>

		<div
			class="text-center {plan.originalYearly
				? 'mb-1'
				: 'mb-2'} flex justify-center items-end gap-1"
		>
			<span class="text-5xl font-black">{price}</span>
			{#if plan.id === 'pack' && plan.perKey}
				<span class="text-text-muted mb-1 text-sm">{translate(plan.perKey)}</span>
			{/if}
		</div>

		{#if plan.originalYearly && isYearly}
			<div class="text-center mb-1">
				<span class="text-xs text-text-muted line-through">{plan.originalYearly}</span>
				<span class="text-xs text-brand-green font-bold ml-1"
					>{savingText(plan.saveAmountYearly!)}</span
				>
			</div>
		{/if}

		<p class="text-sm text-text-muted text-center mb-8">{translate(plan.subtitleKey)}</p>

		<ul class="flex flex-col gap-4 mb-8 flex-1">
			{#each plan.featureKeys as key, i (key)}
				<li class="flex items-start gap-3">
					<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
					<span class="text-sm {i === 0 ? 'font-medium' : 'font-medium text-text-muted'}"
						>{translate(key)}</span
					>
				</li>
			{/each}
		</ul>

		{#if isCurrent}
			<button
				disabled
				class="w-full py-3 rounded-lg bg-brand-blue/20 text-brand-blue font-semibold border border-brand-blue cursor-default mt-auto"
			>
				{translate('pricing_current_plan')}
			</button>
		{:else if plan.featured}
			<button
				onclick={handleSelect}
				class="w-full py-3 rounded-lg bg-brand-blue text-white font-semibold hover:bg-blue-600 transition-colors mt-auto flex items-center justify-center gap-2"
			>
				<i class="fa-solid fa-bolt text-brand-orange"></i>
				{translate(plan.ctaKey)}
			</button>
		{:else if plan.disabled}
			<button
				disabled
				class="w-full py-3 rounded-lg border border-border-strong text-text-muted font-semibold cursor-not-allowed mt-auto"
			>
				{translate(plan.ctaKey)}
			</button>
		{:else if plan.id === 'pack'}
			<button
				onclick={handleSelect}
				class="w-full py-3 rounded-lg bg-brand-blue text-white font-semibold hover:bg-blue-600 transition-colors mt-auto"
			>
				{translate(plan.ctaKey)}
			</button>
		{:else}
			<button
				onclick={handleSelect}
				class="w-full py-3 rounded-lg border border-border-strong text-white font-semibold hover:bg-navy-lighter transition-colors mt-auto"
			>
				{translate(plan.ctaKey)}
			</button>
		{/if}
	</div>
{/if}
