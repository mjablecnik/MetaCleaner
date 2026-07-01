<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<!-- ===== DESKTOP REVENUE CHARTS — no real data source available ===== -->
<div class="hidden lg:block space-y-6">
	<section class="grid grid-cols-2 gap-6">
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="mb-4">
				<h3 class="text-lg font-semibold text-textMain">{t('business_charts_mrrGrowth')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('business_charts_mrrSubtitle')}</p>
			</div>
			<div class="h-[240px] flex items-center justify-center">
				<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
			</div>
		</div>
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="mb-4">
				<h3 class="text-lg font-semibold text-textMain">{t('business_charts_userGrowth')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('business_charts_userSubtitle')}</p>
			</div>
			<div class="h-[240px] flex items-center justify-center">
				<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
			</div>
		</div>
	</section>

	<section class="grid grid-cols-2 gap-6">
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_churnNewMrr_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_churnNewMrr_subtitle')}</p>
				</div>
				<div class="flex gap-2">
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-success inline-block"></span>{t(
							'business_churnNewMrr_new'
						)}</span
					>
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-error inline-block"></span>{t(
							'business_churnNewMrr_churn'
						)}</span
					>
				</div>
			</div>
			<div class="h-[240px] flex items-center justify-center">
				<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
			</div>
		</div>
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="mb-4">
				<h3 class="text-lg font-semibold text-textMain">{t('business_dailyRevenue_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('business_dailyRevenue_subtitle')}</p>
			</div>
			<div class="h-[240px] flex items-center justify-center">
				<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
			</div>
		</div>
	</section>
</div>

<!-- ===== MOBILE REVENUE CHARTS — no real data source available ===== -->
<div class="lg:hidden space-y-4">
	<section class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_charts_mrrGrowth')}</h3>
		<p class="text-xs text-textSec mb-3">{t('business_charts_mrrSubtitle')}</p>
		<div class="h-[200px] flex items-center justify-center">
			<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
		</div>
	</section>

	<section class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_charts_userGrowth')}</h3>
		<p class="text-xs text-textSec mb-3">{t('business_charts_userSubtitle')}</p>
		<div class="h-[200px] flex items-center justify-center">
			<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
		</div>
	</section>

	<section class="bg-card border border-surface rounded-xl p-4">
		<div class="flex items-center justify-between mb-3">
			<div>
				<h3 class="text-sm font-semibold text-textMain">{t('business_churnNewMrr_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('business_churnNewMrr_subtitleMobile')}</p>
			</div>
			<div class="flex gap-2">
				<span class="px-2 py-0.5 bg-badge rounded text-xs text-textSec flex items-center gap-1"
					><span class="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>{t(
						'business_churnNewMrr_new'
					)}</span
				>
				<span class="px-2 py-0.5 bg-badge rounded text-xs text-textSec flex items-center gap-1"
					><span class="w-1.5 h-1.5 rounded-full bg-error inline-block"></span>{t(
						'business_churnNewMrr_churn'
					)}</span
				>
			</div>
		</div>
		<div class="h-[200px] flex items-center justify-center">
			<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
		</div>
	</section>

	<section class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_dailyRevenue_title')}</h3>
		<p class="text-xs text-textSec mb-3">{t('business_dailyRevenue_subtitle')}</p>
		<div class="h-[180px] flex items-center justify-center">
			<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
		</div>
	</section>
</div>
