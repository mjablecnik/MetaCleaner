<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<!-- Desktop: Threat Types — no real data source available -->
<section class="hidden lg:grid grid-cols-1 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5">
		<h3 class="text-lg font-semibold text-textMain mb-1">{t('edge_threats_title')}</h3>
		<p class="text-xs text-textSec mb-4">{t('edge_threats_subtitle')}</p>
		<p class="text-sm text-textSec text-center py-8">{t('common_labels_noData')}</p>
	</div>
</section>

<!-- Mobile: Threat Types — no real data source available -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<h3 class="text-sm font-semibold text-textMain mb-1">{t('edge_threats_title')}</h3>
	<p class="text-xs text-textSec mb-3">{t('edge_threats_subtitle')}</p>
	<p class="text-sm text-textSec text-center py-6">{t('common_labels_noData')}</p>
</section>
