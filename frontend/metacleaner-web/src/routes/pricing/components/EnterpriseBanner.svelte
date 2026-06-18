<script lang="ts">
	import { t } from '$lib/i18n';
	import type { EnterprisePlan } from '$lib/repositories';

	interface Props {
		enterprise: EnterprisePlan;
		size?: 'desktop' | 'mobile';
	}

	const { enterprise, size = 'desktop' }: Props = $props();

	const isMobile = $derived(size === 'mobile');
</script>

{#if isMobile}
	<div class="w-full bg-navy-card border border-border rounded-2xl p-5 flex flex-col gap-4 mb-6">
		<div>
			<h4 class="text-base font-bold mb-1">{t(enterprise.titleKey)}</h4>
			<p class="text-xs text-text-muted leading-relaxed">{t(enterprise.descKey)}</p>
		</div>
		<button
			class="w-full py-3 rounded-xl border border-border-strong text-white font-semibold text-sm hover:bg-navy-lighter transition-colors"
		>
			{t(enterprise.ctaKey)}
		</button>
	</div>
{:else}
	<div
		class="w-full bg-navy-card border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
	>
		<div>
			<h4 class="text-lg font-bold mb-2">{t(enterprise.titleKey)}</h4>
			<p class="text-sm text-text-muted">{t(enterprise.descKey)}</p>
		</div>
		<button
			class="px-6 py-3 rounded-lg border border-border-strong text-white font-semibold hover:bg-navy-lighter transition-colors whitespace-nowrap"
		>
			{t(enterprise.ctaKey)}
		</button>
	</div>
{/if}
