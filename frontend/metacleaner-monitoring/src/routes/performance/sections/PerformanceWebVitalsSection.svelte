<script lang="ts">
	import { t } from '$lib/i18n';
	import { getCoreWebVitals } from '$lib/repositories/performanceRepository';
	import WebVitalCard from '../components/WebVitalCard.svelte';

	const coreWebVitals = getCoreWebVitals();
</script>

<!-- Desktop: Core Web Vitals -->
<div class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<h3 class="text-lg font-semibold text-textMain mb-1">{t('performance_cwv_title')}</h3>
	<p class="text-xs text-textSec mb-5">{t('performance_cwv_subtitle')}</p>
	<div class="space-y-5">
		{#each coreWebVitals as vital (vital.key)}
			<WebVitalCard {vital} />
		{/each}
	</div>
</div>

<!-- Mobile: Core Web Vitals -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<h3 class="text-sm font-semibold text-textMain mb-1">{t('performance_cwv_title')}</h3>
	<p class="text-xs text-textSec mb-4">{t('performance_cwv_subtitle')}</p>
	<div class="space-y-4">
		{#each coreWebVitals as vital (vital.key)}
			<WebVitalCard {vital} />
		{/each}
	</div>
</section>
