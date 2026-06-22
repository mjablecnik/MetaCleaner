<script lang="ts">
	import type { EnterprisePlan } from '../types/pricing.js';

	interface Props {
		enterprise: EnterprisePlan;
		size?: 'desktop' | 'mobile';
		translate: (key: string) => string;
	}

	const { enterprise, size = 'desktop', translate }: Props = $props();

	const isMobile = $derived(size === 'mobile');
</script>

{#if isMobile}
	<div class="w-full bg-navy-card border border-border rounded-2xl p-5 flex flex-col gap-4 mb-6">
		<div>
			<h4 class="text-base font-bold mb-1">{translate(enterprise.titleKey)}</h4>
			<p class="text-xs text-text-muted leading-relaxed">{translate(enterprise.descKey)}</p>
		</div>
		<button
			class="w-full py-3 rounded-xl border border-border-strong text-white font-semibold text-sm hover:bg-navy-lighter transition-colors"
		>
			{translate(enterprise.ctaKey)}
		</button>
	</div>
{:else}
	<div
		class="w-full bg-navy-card border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
	>
		<div>
			<h4 class="text-lg font-bold mb-2">{translate(enterprise.titleKey)}</h4>
			<p class="text-sm text-text-muted">{translate(enterprise.descKey)}</p>
		</div>
		<button
			class="px-6 py-3 rounded-lg border border-border-strong text-white font-semibold hover:bg-navy-lighter transition-colors whitespace-nowrap"
		>
			{translate(enterprise.ctaKey)}
		</button>
	</div>
{/if}
