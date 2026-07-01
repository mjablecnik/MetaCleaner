<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<!-- Desktop: Runtime Charts — no real data source available -->
<div class="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5">
		<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_cpuOverTime')}</h3>
		<p class="text-xs text-textSec mt-0.5 mb-4">{t('runtime_charts_cpuSubtitle')}</p>
		<div class="h-[250px] flex items-center justify-center">
			<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
		</div>
	</div>
	<div class="bg-card border border-surface rounded-xl p-5">
		<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_ramOverTime')}</h3>
		<p class="text-xs text-textSec mt-0.5 mb-4">{t('runtime_charts_ramSubtitle')}</p>
		<div class="h-[250px] flex items-center justify-center">
			<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
		</div>
	</div>
</div>

<!-- Mobile: Runtime Charts — no real data source available -->
<div class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<h3 class="text-sm font-semibold text-textMain mb-3">{t('runtime_charts_cpuOverTime')}</h3>
	<div class="h-[200px] flex items-center justify-center">
		<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
	</div>
</div>
