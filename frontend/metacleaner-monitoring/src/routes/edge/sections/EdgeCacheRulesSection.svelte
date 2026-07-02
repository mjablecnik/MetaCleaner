<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<!-- Desktop: Cache Rules — no real data source available -->
<div class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex justify-between items-center mb-4">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('edge_cacheRules_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('edge_cacheRules_subtitle')}</p>
		</div>
		<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('edge_cacheRules_badge')}</span
		>
	</div>
	<p class="text-sm text-textSec text-center py-8">{t('common_labels_noData')}</p>
</div>

<!-- Mobile: Cache Rules — no real data source available -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<div class="flex items-center gap-3">
		<div class="w-8 h-8 rounded-lg bg-green-muted/15 flex items-center justify-center">
			<i class="fa-solid fa-image text-green-muted text-xs"></i>
		</div>
		<div>
			<p class="text-sm font-semibold text-textMain">{t('edge_cacheRules_title')}</p>
			<p class="text-[10px] text-textSec">{t('edge_cacheRules_subtitleMobile')}</p>
		</div>
	</div>
	<p class="text-sm text-textSec text-center py-6">{t('common_labels_noData')}</p>
</section>
