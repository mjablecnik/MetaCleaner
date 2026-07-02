<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<!-- Desktop: Dashboard Row 2 Charts — no real data source available -->
<section class="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
	<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-4 lg:p-5 shadow-sm">
		<h3 class="text-base lg:text-lg font-semibold text-textMain mb-4">
			{t('dashboard_charts_serverResources')}
		</h3>
		<div class="h-[200px] lg:h-[250px] flex items-center justify-center">
			<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
		</div>
	</div>
	<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-4 lg:p-5 shadow-sm">
		<h3 class="text-base lg:text-lg font-semibold text-textMain mb-4">
			{t('dashboard_charts_dbLatency')}
		</h3>
		<div class="h-[200px] lg:h-[250px] flex items-center justify-center">
			<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
		</div>
	</div>
</section>

<!-- Mobile: Dashboard Row 2 Charts — no real data source available -->
<section class="lg:hidden space-y-3">
	<div class="bg-card border border-surface rounded-2xl p-4">
		<h3 class="text-base font-semibold text-textMain mb-3">
			{t('dashboard_charts_serverResources')}
		</h3>
		<div class="h-[200px] flex items-center justify-center">
			<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
		</div>
	</div>
</section>
