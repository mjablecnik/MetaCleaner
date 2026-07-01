<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<!-- Desktop: JS vs Backend + Error type donut — no real data source available -->
<section class="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5">
		<h3 class="text-lg font-semibold text-textMain mb-4">{t('errors_charts_jsVsBackend')}</h3>
		<p class="text-sm text-textSec text-center py-8">{t('common_labels_noData')}</p>
	</div>
	<div class="bg-card border border-surface rounded-xl p-5">
		<h3 class="text-lg font-semibold text-textMain mb-4">{t('errors_charts_errorTypes')}</h3>
		<p class="text-sm text-textSec text-center py-8">{t('common_labels_noData')}</p>
	</div>
</section>

<!-- Mobile: comparison — no real data source available -->
<div class="lg:hidden space-y-3">
	<div class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-3">{t('errors_mobile_jsVsBackend')}</h3>
		<p class="text-sm text-textSec text-center py-6">{t('common_labels_noData')}</p>
	</div>
	<div class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-3">{t('errors_charts_errorTypes')}</h3>
		<p class="text-sm text-textSec text-center py-6">{t('common_labels_noData')}</p>
	</div>
</div>
