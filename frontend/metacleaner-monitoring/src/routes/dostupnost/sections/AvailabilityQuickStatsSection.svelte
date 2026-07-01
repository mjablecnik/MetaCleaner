<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<!-- Desktop: inside the SLA sidebar (combined via AvailabilitySlaSection) -->
<div class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<h3 class="text-base font-semibold text-textMain mb-4">{t('availability_quickStats_title')}</h3>
	<div class="space-y-3">
		<div class="flex justify-between items-center">
			<span class="text-sm text-textSec">{t('availability_quickStats_totalOutages')}</span>
			<span class="text-sm font-semibold text-textMain">—</span>
		</div>
		<div class="flex justify-between items-center">
			<span class="text-sm text-textSec">{t('availability_quickStats_mttr')}</span>
			<span class="text-sm font-semibold text-textMain">—</span>
		</div>
		<div class="flex justify-between items-center">
			<span class="text-sm text-textSec">{t('availability_quickStats_mtbf')}</span>
			<span class="text-sm font-semibold text-textMain">—</span>
		</div>
		<div class="flex justify-between items-center">
			<span class="text-sm text-textSec">{t('availability_quickStats_longestOutage')}</span>
			<span class="text-sm font-semibold text-textMain">—</span>
		</div>
		<div class="flex justify-between items-center">
			<span class="text-sm text-textSec">{t('availability_quickStats_checkInterval')}</span>
			<span class="text-sm font-semibold text-textMain">—</span>
		</div>
		<div class="h-px bg-surface my-1"></div>
		<div class="flex justify-between items-center">
			<span class="text-sm text-textSec">{t('availability_quickStats_alertsSent')}</span>
			<span class="text-sm font-semibold text-textMain">—</span>
		</div>
	</div>
</div>

<!-- Mobile -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4 mb-24">
	<h3 class="text-sm font-semibold text-textMain mb-4">{t('availability_quickStats_title')}</h3>
	<div class="grid grid-cols-2 gap-3">
		<div class="bg-surface/50 rounded-xl p-3 text-center">
			<p class="text-2xl font-bold text-textMain">—</p>
			<p class="text-xs text-textSec mt-1">{t('availability_quickStats_totalOutages')}</p>
		</div>
		<div class="bg-surface/50 rounded-xl p-3 text-center">
			<p class="text-2xl font-bold text-textMain">—</p>
			<p class="text-xs text-textSec mt-1">{t('availability_quickStats_mttr')}</p>
		</div>
		<div class="bg-surface/50 rounded-xl p-3 text-center">
			<p class="text-2xl font-bold text-textMain">—</p>
			<p class="text-xs text-textSec mt-1">{t('availability_quickStats_mtbf')}</p>
		</div>
		<div class="bg-surface/50 rounded-xl p-3 text-center">
			<p class="text-2xl font-bold text-textMain">—</p>
			<p class="text-xs text-textSec mt-1">{t('availability_quickStats_longestOutage')}</p>
		</div>
		<div class="bg-surface/50 rounded-xl p-3 text-center">
			<p class="text-2xl font-bold text-textMain">—</p>
			<p class="text-xs text-textSec mt-1">{t('availability_quickStats_checkInterval')}</p>
		</div>
		<div class="bg-surface/50 rounded-xl p-3 text-center">
			<p class="text-2xl font-bold text-textMain">—</p>
			<p class="text-xs text-textSec mt-1">{t('availability_quickStats_alertsSent')}</p>
		</div>
	</div>
</section>
