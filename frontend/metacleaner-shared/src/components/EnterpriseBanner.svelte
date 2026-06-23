<script lang="ts">
	import type { EnterprisePlan } from '../types/pricing.js';

	interface Props {
		enterprise: EnterprisePlan;
		size?: 'desktop' | 'mobile';
		translate: (key: string) => string;
		onContact?: () => void;
	}

	const { enterprise, size = 'desktop', translate, onContact }: Props = $props();

	const isMobile = $derived(size === 'mobile');
</script>

{#if isMobile}
	<div
		class="mb-6 flex w-full flex-col gap-4 rounded-2xl border border-gray-800 bg-navy-card p-5"
	>
		<div>
			<h4 class="mb-1 text-base font-bold">{translate(enterprise.titleKey)}</h4>
			<p class="text-xs leading-relaxed text-text-muted">{translate(enterprise.descKey)}</p>
		</div>
		<button
			onclick={onContact}
			class="w-full rounded-xl border border-gray-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-lighter"
		>
			{translate(enterprise.ctaKey)}
		</button>
	</div>
{:else}
	<div
		class="flex w-full flex-col items-center justify-between gap-6 rounded-2xl border border-gray-800 bg-navy-card p-6 md:flex-row"
	>
		<div>
			<h4 class="mb-2 text-lg font-bold">{translate(enterprise.titleKey)}</h4>
			<p class="text-sm text-text-muted">{translate(enterprise.descKey)}</p>
		</div>
		<button
			onclick={onContact}
			class="rounded-lg border border-gray-700 px-6 py-3 font-semibold whitespace-nowrap text-white transition-colors hover:bg-navy-lighter"
		>
			{translate(enterprise.ctaKey)}
		</button>
	</div>
{/if}
