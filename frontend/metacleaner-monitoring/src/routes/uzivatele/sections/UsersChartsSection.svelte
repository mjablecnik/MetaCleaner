<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<!-- Desktop: Users Charts — no real data source available -->
<section class="hidden lg:block">
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-6">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('users_charts_registrations')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('users_charts_registrationsSubtitle')}</p>
			</div>
			<span class="px-2.5 py-1 bg-badge rounded-md text-xs text-textSec border border-border"
				>{t('common_timeRange_last30d')}</span
			>
		</div>
		<div class="h-[220px] flex items-center justify-center">
			<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
		</div>
	</div>
</section>

<!-- Mobile: Users Charts — no real data source available -->
<section class="lg:hidden space-y-4">
	<div class="bg-card border border-surface rounded-xl p-4">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-sm font-semibold text-textMain">{t('users_charts_registrations')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('common_timeRange_last30d')}</p>
			</div>
			<span class="px-2.5 py-1 bg-badge rounded-md text-xs text-textSec border border-border"
				>{t('common_timeRange_last30d')}</span
			>
		</div>
		<div class="h-[180px] flex items-center justify-center">
			<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
		</div>
	</div>
</section>
