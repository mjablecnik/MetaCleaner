<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<!-- ===== DESKTOP GOALS ===== -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex justify-between items-center mb-5">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('business_okr_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('business_okr_subtitle')}</p>
		</div>
	</div>
	<div class="grid grid-cols-4 gap-4">
		<div class="bg-surface/50 rounded-xl p-4">
			<div class="flex justify-between items-start mb-2">
				<h4 class="text-textSec text-xs font-medium">{t('business_okr_mrrGoal')}</h4>
				<span class="text-success text-xs font-bold">96%</span>
			</div>
			<div class="text-2xl font-bold text-textMain mb-2">$50,000</div>
			<div class="w-full h-2 bg-surface-deep rounded-full overflow-hidden">
				<div class="h-full bg-success rounded-full transition-all" style="width:96%"></div>
			</div>
			<p class="text-xs text-textSec mt-2">$48,320 / $50,000</p>
		</div>
		<div class="bg-surface/50 rounded-xl p-4">
			<div class="flex justify-between items-start mb-2">
				<h4 class="text-textSec text-xs font-medium">{t('business_okr_newCustomers')}</h4>
				<span class="text-success text-xs font-bold">79%</span>
			</div>
			<div class="text-2xl font-bold text-textMain mb-2">400</div>
			<div class="w-full h-2 bg-surface-deep rounded-full overflow-hidden">
				<div class="h-full bg-blue rounded-full transition-all" style="width:79%"></div>
			</div>
			<p class="text-xs text-textSec mt-2">318 / 400</p>
		</div>
		<div class="bg-surface/50 rounded-xl p-4">
			<div class="flex justify-between items-start mb-2">
				<h4 class="text-textSec text-xs font-medium">{t('business_okr_churnRate')}</h4>
				<span class="text-secondary text-xs font-bold">{t('business_okr_approxTarget')}</span>
			</div>
			<div class="text-2xl font-bold text-error mb-2">&lt;2.0%</div>
			<div class="w-full h-2 bg-surface-deep rounded-full overflow-hidden">
				<div class="h-full bg-secondary rounded-full transition-all" style="width:55%"></div>
			</div>
			<p class="text-xs text-textSec mt-2">{t('business_okr_currently', { value: '2.1%' })}</p>
		</div>
		<div class="bg-surface/50 rounded-xl p-4">
			<div class="flex justify-between items-start mb-2">
				<h4 class="text-textSec text-xs font-medium">{t('business_okr_npsGoal')}</h4>
				<span class="text-success text-xs font-bold">90%</span>
			</div>
			<div class="text-2xl font-bold text-textMain mb-2">80</div>
			<div class="w-full h-2 bg-surface-deep rounded-full overflow-hidden">
				<div class="h-full bg-purple rounded-full transition-all" style="width:90%"></div>
			</div>
			<p class="text-xs text-textSec mt-2">72 / 80</p>
		</div>
	</div>
</section>

<!-- ===== MOBILE GOALS ===== -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<h3 class="text-sm font-semibold text-textMain mb-1">{t('business_okr_title')}</h3>
	<p class="text-xs text-textSec mb-4">{t('business_okr_subtitle')}</p>
	<div class="grid grid-cols-2 gap-3">
		<div class="bg-surface/50 rounded-xl p-3">
			<div class="flex justify-between items-start mb-1.5">
				<h4 class="text-textSec text-xs font-medium">{t('business_okr_mrrGoal')}</h4>
				<span class="text-success text-xs font-bold">96%</span>
			</div>
			<div class="text-lg font-bold text-textMain mb-2">$50,000</div>
			<div class="w-full h-1.5 bg-surface-deep rounded-full overflow-hidden">
				<div class="h-full bg-success rounded-full" style="width:96%"></div>
			</div>
			<p class="text-xs text-textSec mt-1.5">$48,320 / $50,000</p>
		</div>
		<div class="bg-surface/50 rounded-xl p-3">
			<div class="flex justify-between items-start mb-1.5">
				<h4 class="text-textSec text-xs font-medium">{t('business_okr_newCustomers')}</h4>
				<span class="text-success text-xs font-bold">79%</span>
			</div>
			<div class="text-lg font-bold text-textMain mb-2">400</div>
			<div class="w-full h-1.5 bg-surface-deep rounded-full overflow-hidden">
				<div class="h-full bg-blue rounded-full" style="width:79%"></div>
			</div>
			<p class="text-xs text-textSec mt-1.5">318 / 400</p>
		</div>
		<div class="bg-surface/50 rounded-xl p-3">
			<div class="flex justify-between items-start mb-1.5">
				<h4 class="text-textSec text-xs font-medium">{t('business_okr_churnRate')}</h4>
				<span class="text-secondary text-xs font-bold">{t('business_okr_approxTarget')}</span>
			</div>
			<div class="text-lg font-bold text-error mb-2">&lt;2.0%</div>
			<div class="w-full h-1.5 bg-surface-deep rounded-full overflow-hidden">
				<div class="h-full bg-secondary rounded-full" style="width:55%"></div>
			</div>
			<p class="text-xs text-textSec mt-1.5">{t('business_okr_currently', { value: '2.1%' })}</p>
		</div>
		<div class="bg-surface/50 rounded-xl p-3">
			<div class="flex justify-between items-start mb-1.5">
				<h4 class="text-textSec text-xs font-medium">{t('business_okr_npsGoal')}</h4>
				<span class="text-success text-xs font-bold">90%</span>
			</div>
			<div class="text-lg font-bold text-textMain mb-2">80</div>
			<div class="w-full h-1.5 bg-surface-deep rounded-full overflow-hidden">
				<div class="h-full bg-purple rounded-full" style="width:90%"></div>
			</div>
			<p class="text-xs text-textSec mt-1.5">72 / 80</p>
		</div>
	</div>
</section>
