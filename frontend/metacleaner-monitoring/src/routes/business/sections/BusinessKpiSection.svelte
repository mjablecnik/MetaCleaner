<script lang="ts">
	import { t } from '$lib/i18n';
	import { getBusinessKpiStats } from '$lib/repositories/businessRepository';

	const kpiStats = getBusinessKpiStats();
</script>

<!-- ===== DESKTOP KPI ===== -->
<div class="hidden lg:block space-y-4">
	<!-- KPI Row 1 -->
	<section class="grid grid-cols-4 gap-4">
		{#each kpiStats as stat (stat.key)}
			<div
				class="bg-card border {stat.borderClass ?? 'border-surface'} rounded-xl p-5 {stat.key ===
				'mrr'
					? 'relative overflow-hidden'
					: ''}"
			>
				{#if stat.key === 'mrr'}
					<div
						class="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full -translate-y-8 translate-x-8"
					></div>
				{/if}
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t(stat.labelKey)}</h3>
					<span class="px-2 py-0.5 {stat.badgeClass} text-xs rounded-full font-medium"
						>{stat.badgeLabel}</span
					>
				</div>
				<div class="flex items-end gap-2 mb-1">
					<span class="text-3xl font-bold {stat.valueClass ?? 'text-textMain'}">{stat.value}</span>
				</div>
				<p class="text-xs text-textSec">{t(stat.subtext)}</p>
			</div>
		{/each}
	</section>

	<!-- KPI Row 2 -->
	<section class="grid grid-cols-3 gap-4">
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
					<i class="fa-solid fa-bag-shopping text-success text-xs"></i>
				</div>
				<h3 class="text-textSec text-sm font-medium">{t('business_kpi_newOrders')}</h3>
			</div>
			<div class="text-2xl font-bold text-textMain">7</div>
			<p class="text-xs text-textSec mt-1 flex items-center gap-1">
				<span class="text-success font-medium">+3</span>
				{t('business_kpi_newOrdersSubtext')}
			</p>
		</div>
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-8 h-8 rounded-lg bg-purple/15 flex items-center justify-center">
					<i class="fa-solid fa-user-plus text-purple text-xs"></i>
				</div>
				<h3 class="text-textSec text-sm font-medium">{t('business_kpi_newCustomers')}</h3>
			</div>
			<div class="text-2xl font-bold text-textMain">34</div>
			<p class="text-xs text-textSec mt-1">
				<span class="text-success font-medium">+8</span>
				{t('business_kpi_newOrdersSubtext')}
			</p>
		</div>
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-8 h-8 rounded-lg bg-blue/15 flex items-center justify-center">
					<i class="fa-solid fa-credit-card text-blue text-xs"></i>
				</div>
				<h3 class="text-textSec text-sm font-medium">{t('business_kpi_activeSubscriptions')}</h3>
			</div>
			<div class="text-2xl font-bold text-textMain">1,840</div>
			<p class="text-xs text-textSec mt-1">{t('business_kpi_activeSubscriptionsSubtext')}</p>
		</div>
	</section>
</div>

<!-- ===== MOBILE KPI ===== -->
<div class="lg:hidden space-y-4">
	<!-- KPI Row 1 grid-cols-2 -->
	<section class="grid grid-cols-2 gap-3">
		<div class="bg-card border border-surface rounded-xl p-4 relative overflow-hidden">
			<div
				class="absolute top-0 right-0 w-16 h-16 bg-success/5 rounded-full -translate-y-4 translate-x-4"
			></div>
			<h3 class="text-textSec text-xs font-medium mb-2">{t('business_kpi_mrr')}</h3>
			<div class="text-2xl font-bold text-textMain">$1,240</div>
			<span class="text-xs text-success font-medium mt-0.5 block">+5.2%</span>
			<p class="text-xs text-textSec mt-1 leading-tight">{t('business_kpi_mrrSubtext')}</p>
		</div>
		<div class="bg-card border border-error/20 rounded-xl p-4">
			<h3 class="text-textSec text-xs font-medium mb-2">{t('business_kpi_churnRate')}</h3>
			<div class="text-2xl font-bold text-error">3.2%</div>
			<span class="text-xs text-error font-medium mt-0.5 block"
				>{t('business_kpi_churnBadge')}</span
			>
			<p class="text-xs text-textSec mt-1 leading-tight">{t('business_kpi_churnRateSubtext')}</p>
		</div>
		<div class="bg-card border border-surface rounded-xl p-4">
			<h3 class="text-textSec text-xs font-medium mb-2 leading-tight">
				{t('business_kpi_activeUsers')}
			</h3>
			<div class="text-2xl font-bold text-textMain">89</div>
			<span class="text-xs text-success font-medium mt-0.5 block">+3.4%</span>
			<p class="text-xs text-textSec mt-1 leading-tight">{t('business_kpi_activeUsersSubtext')}</p>
		</div>
		<div class="bg-card border border-surface rounded-xl p-4">
			<h3 class="text-textSec text-xs font-medium mb-2 leading-tight">
				{t('business_kpi_activeSubscriptions')}
			</h3>
			<div class="text-2xl font-bold text-textMain">1,840</div>
			<p class="text-xs text-textSec mt-1 leading-tight">
				{t('business_kpi_activeSubscriptionsSubtext')}
			</p>
		</div>
	</section>

	<!-- KPI Row 2 grid-cols-2 -->
	<section class="grid grid-cols-2 gap-3">
		<div class="bg-card border border-surface rounded-xl p-4">
			<div class="w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center mb-2">
				<i class="fa-solid fa-bag-shopping text-success text-xs"></i>
			</div>
			<div class="text-xl font-bold text-textMain">7</div>
			<p class="text-xs text-textSec mt-0.5 leading-tight">{t('business_kpi_newOrders')}</p>
			<span class="text-xs text-success font-medium">+3</span>
		</div>
		<div class="bg-card border border-surface rounded-xl p-4">
			<div class="w-7 h-7 rounded-lg bg-purple/15 flex items-center justify-center mb-2">
				<i class="fa-solid fa-user-plus text-purple text-xs"></i>
			</div>
			<div class="text-xl font-bold text-textMain">34</div>
			<p class="text-xs text-textSec mt-0.5 leading-tight">{t('business_kpi_newCustomers')}</p>
			<span class="text-xs text-success font-medium">+8</span>
		</div>
	</section>
</div>
