<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<section class="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
	<!-- Response Time chart — no real data source available -->
	<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-4 lg:p-5 shadow-sm">
		<div class="flex justify-between items-start lg:items-center mb-4 lg:mb-6">
			<div>
				<h3 class="text-base lg:text-lg font-semibold text-textMain">
					{t('dashboard_charts_responseTime')}
				</h3>
				<div class="flex items-baseline gap-1 mt-1 lg:hidden">
					<span class="text-2xl font-bold text-textMain">—</span>
				</div>
			</div>
			<span class="hidden lg:block text-2xl font-bold text-textMain">—</span>
		</div>
		<div class="h-[200px] lg:h-[250px] flex items-center justify-center">
			<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
		</div>
	</div>

	<!-- Errors chart — no real data source available -->
	<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-4 lg:p-5 shadow-sm">
		<div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 mb-4 lg:mb-6">
			<h3 class="text-base lg:text-lg font-semibold text-textMain">
				{t('dashboard_charts_errors')}
				<span class="hidden lg:inline">{t('dashboard_charts_errorsSuffix')}</span>
			</h3>
		</div>
		<div class="h-[200px] lg:h-[250px] flex items-center justify-center">
			<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
		</div>
	</div>
</section>
