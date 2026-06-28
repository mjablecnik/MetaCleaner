<script lang="ts">
	import { t } from '$lib/i18n';
	import HealthCheckRow from '../components/HealthCheckRow.svelte';
	import AvailabilityResponseChartSection from './AvailabilityResponseChartSection.svelte';
	import type { HealthCheck } from '$lib/repositories/availabilityRepository';

	let { healthChecks }: { healthChecks: HealthCheck[] } = $props();

	let hcOpen = $state(false);
</script>

<!-- Desktop: 3-col grid with response chart (col-span-2) + health checks (col-span-1) -->
<section class="hidden lg:grid grid-cols-3 gap-6">
	<AvailabilityResponseChartSection />

	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex items-center justify-between mb-5">
			<h3 class="text-lg font-semibold text-textMain">{t('availability_health_title')}</h3>
			<span class="text-xs text-textSec">{t('availability_health_interval')}</span>
		</div>
		<div class="space-y-3">
			{#each healthChecks as hc (hc.endpoint)}
				<HealthCheckRow healthCheck={hc} />
			{/each}
			<div class="mt-4 pt-3 border-t border-surface flex items-center justify-between">
				<span class="text-xs text-textSec">{t('availability_health_lastCheck')}</span>
				<button class="text-xs text-primary hover:underline font-medium">
					<i class="fa-solid fa-rotate-right mr-1"></i>{t('common_actions_refresh')}
				</button>
			</div>
		</div>
	</div>
</section>

<!-- Mobile: response chart + accordion health checks -->
<div class="lg:hidden space-y-3">
	<AvailabilityResponseChartSection />

	<section class="bg-card border border-surface rounded-xl overflow-hidden">
		<button
			class="w-full flex items-center justify-between p-4"
			style="min-height:52px"
			onclick={() => (hcOpen = !hcOpen)}
		>
			<div class="flex items-center gap-2">
				<h3 class="text-sm font-semibold text-textMain">{t('availability_health_title')}</h3>
				<span class="text-xs text-textSec bg-surface px-2 py-0.5 rounded-full"
					>{t('availability_health_endpoints', { count: String(healthChecks.length) })}</span
				>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-xs text-textSec">{t('availability_health_interval')}</span>
				<i
					class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {hcOpen
						? 'rotate-180'
						: ''}"
				></i>
			</div>
		</button>
		{#if hcOpen}
			<div class="px-4 pb-4 space-y-2">
				{#each healthChecks as hc (hc.endpoint)}
					<HealthCheckRow healthCheck={hc} />
				{/each}
				<div class="pt-2 border-t border-surface flex items-center justify-between">
					<span class="text-xs text-textSec">{t('availability_health_lastCheck')}</span>
					<button
						class="text-xs text-primary font-medium flex items-center gap-1 py-2 px-3"
						style="min-height:44px"
					>
						<i class="fa-solid fa-rotate-right"></i>{t('common_actions_refresh')}
					</button>
				</div>
			</div>
		{/if}
	</section>
</div>
