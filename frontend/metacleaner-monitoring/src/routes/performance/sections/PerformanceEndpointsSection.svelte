<script lang="ts">
	import { t } from '$lib/i18n';
	import SlowEndpointRow from '../components/SlowEndpointRow.svelte';
	import type { SlowEndpoint } from '$lib/repositories/performanceRepository';

	let { slowEndpoints }: { slowEndpoints: SlowEndpoint[] } = $props();
</script>

<!-- Desktop: Slowest Endpoints -->
<div class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex justify-between items-center mb-4">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('performance_endpoints_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('performance_endpoints_subtitle')}</p>
		</div>
		<span class="text-xs text-textSec bg-badge px-2 py-1 rounded"
			>{t('performance_endpoints_badge')}</span
		>
	</div>
	<div class="space-y-3">
		{#if slowEndpoints.length === 0}
			<p class="text-sm text-textSec py-4 text-center">{t('performance_endpoints_notAvailable')}</p>
		{:else}
			{#each slowEndpoints as ep (ep.id)}
				<SlowEndpointRow endpoint={ep} variant="desktop" />
			{/each}
		{/if}
	</div>
</div>

<!-- Mobile: Slowest Endpoints -->
<section class="lg:hidden bg-card border border-surface rounded-xl overflow-hidden">
	<div class="p-4 border-b border-surface flex items-center justify-between">
		<div>
			<h3 class="text-sm font-semibold text-textMain">{t('performance_endpoints_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('performance_endpoints_subtitleMobile')}</p>
		</div>
		<span class="text-xs text-textSec bg-badge px-2 py-1 rounded"
			>{t('performance_endpoints_badgeMobile')}</span
		>
	</div>
	<div class="divide-y divide-surface/60">
		{#if slowEndpoints.length === 0}
			<p class="text-sm text-textSec p-4 text-center">{t('performance_endpoints_notAvailable')}</p>
		{:else}
			{#each slowEndpoints as ep (ep.id)}
				<SlowEndpointRow endpoint={ep} variant="mobile" />
			{/each}
		{/if}
	</div>
</section>
