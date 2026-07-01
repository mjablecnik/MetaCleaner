<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<!-- Desktop: error log — no real data source available -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="mb-5">
		<h3 class="text-lg font-semibold text-textMain">{t('database_errorLog_title')}</h3>
	</div>
	<p class="text-sm text-textSec text-center py-8">{t('common_labels_noData')}</p>
</section>

<!-- Mobile: error log — no real data source available -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<h3 class="text-sm font-semibold text-textMain mb-3">{t('database_errorLog_title')}</h3>
	<p class="text-sm text-textSec text-center py-6">{t('common_labels_noData')}</p>
</section>
