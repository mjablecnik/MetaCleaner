<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<!-- Desktop: Errors Timeline — no real data source available -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<h3 class="text-lg font-semibold text-textMain mb-4">{t('errors_charts_5xxTimeline')}</h3>
	<div class="h-[220px] flex items-center justify-center">
		<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
	</div>
</section>

<!-- Mobile: Errors Timeline — no real data source available -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<h3 class="text-sm font-semibold text-textMain mb-3">{t('errors_charts_5xxTimeline')}</h3>
	<div class="h-[180px] flex items-center justify-center">
		<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
	</div>
</section>
