<script lang="ts">
	import { t } from '$lib/i18n';
	import {
		getSecurityKpiStats,
		getSecuritySecondaryKpis
	} from '$lib/repositories/securityRepository';

	const kpiStats = getSecurityKpiStats();
	const secondaryKpis = getSecuritySecondaryKpis();

	const threatScoreKpi = kpiStats[0];
	const standardKpiStats = kpiStats.slice(1);
</script>

<!-- ===== DESKTOP: KPI Stats Row 1 ===== -->
<section class="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
	<!-- Threat Score (special card with bar) -->
	<div class="bg-card border {threatScoreKpi.borderClass} rounded-xl p-5 relative overflow-hidden">
		<div class="absolute top-0 right-0 w-24 h-24 bg-error/5 rounded-full -translate-y-8 translate-x-8"></div>
		<div class="flex justify-between items-start mb-3">
			<h3 class="text-textSec text-sm font-medium">{t(threatScoreKpi.labelKey)}</h3>
			<span class="px-2 py-0.5 {threatScoreKpi.badgeClass} text-xs rounded-full font-medium">{t(threatScoreKpi.badgeKey)}</span>
		</div>
		<div class="flex items-end gap-2 mb-3">
			<span class="text-3xl font-bold {threatScoreKpi.valueClass}">{threatScoreKpi.value}</span>
			<span class="text-sm text-textSec mb-1">{threatScoreKpi.unit}</span>
			<span class="text-sm {threatScoreKpi.valueClass} mb-1 flex items-center gap-1 ml-1"><i class="fa-solid fa-arrow-up text-xs"></i>{threatScoreKpi.trend}</span>
		</div>
		<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden">
			<div class="h-full {threatScoreKpi.barClass} rounded-full" style="width:{threatScoreKpi.barWidth}"></div>
		</div>
		<p class="text-xs text-textSec mt-2">{threatScoreKpi.subtext}</p>
	</div>
	<!-- Standard KPI cards -->
	{#each standardKpiStats as stat (stat.key)}
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-start mb-3">
				<h3 class="text-textSec text-sm font-medium">{t(stat.labelKey)}</h3>
				<span class="px-2 py-0.5 {stat.badgeClass} text-xs rounded-full font-medium">{t(stat.badgeKey)}</span>
			</div>
			<div class="flex items-end gap-2">
				<span class="text-3xl font-bold {stat.valueClass ?? 'text-textMain'}">{stat.value}</span>
				{#if stat.trend}
					<span class="text-sm {stat.trendPositive ? 'text-success' : 'text-secondary'} mb-1 flex items-center gap-1"><i class="fa-solid fa-arrow-up text-xs"></i>{stat.trend}</span>
				{/if}
			</div>
			<p class="text-xs text-textSec mt-2">{stat.subtext}</p>
		</div>
	{/each}
</section>

<!-- ===== DESKTOP: KPI Stats Row 2 ===== -->
<section class="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
	{#each secondaryKpis as kpi (kpi.key)}
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-8 h-8 rounded-lg {kpi.iconBg} flex items-center justify-center">
					<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
				</div>
				<h3 class="text-textSec text-sm font-medium">{t(kpi.labelKey)}</h3>
			</div>
			{#if kpi.key === 'sslCerts'}
				<div class="text-2xl font-bold {kpi.valueClass}">{t(kpi.value)}</div>
				<p class="text-xs text-textSec mt-1">{kpi.subtext} <span class="{kpi.subtextExtraClass}">{kpi.subtextExtra}</span></p>
			{:else}
				<div class="text-2xl font-bold text-textMain">{kpi.value}</div>
				<p class="text-xs text-textSec mt-1">{kpi.subtext}</p>
			{/if}
		</div>
	{/each}
</section>

<!-- ===== MOBILE: KPI Stats (2x2 grid, Threat Score spans full width) ===== -->
<section class="lg:hidden grid grid-cols-2 gap-3">
	<!-- Threat Score (full width) -->
	<div class="bg-card border {threatScoreKpi.borderClass} rounded-xl p-4 relative overflow-hidden col-span-2">
		<div class="absolute top-0 right-0 w-20 h-20 bg-error/5 rounded-full -translate-y-6 translate-x-6"></div>
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-textSec text-xs font-medium">{t(threatScoreKpi.labelKey)}</h3>
			<span class="px-2 py-0.5 {threatScoreKpi.badgeClass} text-xs rounded-full font-medium">{t(threatScoreKpi.badgeKey)}</span>
		</div>
		<div class="flex items-center gap-3 mb-3">
			<span class="text-4xl font-bold {threatScoreKpi.valueClass}">{threatScoreKpi.value}</span>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs text-textSec">{threatScoreKpi.unit}</span>
				<span class="text-xs {threatScoreKpi.valueClass} flex items-center gap-1 font-medium"><i class="fa-solid fa-arrow-up text-xs"></i>{threatScoreKpi.trend} dnes</span>
			</div>
			<div class="flex-1 ml-2">
				<div class="w-full h-2 bg-surface rounded-full overflow-hidden">
					<div class="h-full bg-gradient-to-r from-error/60 to-error rounded-full" style="width:{threatScoreKpi.barWidth}"></div>
				</div>
				<p class="text-xs text-textSec mt-1">{threatScoreKpi.subtext}</p>
			</div>
		</div>
	</div>

	<!-- Failed Logins -->
	<div class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-textSec text-xs font-medium mb-2 leading-tight">{t('security_kpi_failedLogins')}</h3>
		<div class="text-2xl font-bold text-textMain">{standardKpiStats[0].value}</div>
		<span class="text-xs text-secondary flex items-center gap-0.5 font-medium mt-0.5"><i class="fa-solid fa-arrow-up text-xs"></i>{standardKpiStats[0].trend}</span>
		<p class="text-xs text-textSec mt-1.5 leading-tight">Brute-force: 4 IP</p>
		<span class="mt-2 inline-block px-1.5 py-0.5 {standardKpiStats[0].badgeClass} text-xs rounded-full font-medium">{t(standardKpiStats[0].badgeKey)}</span>
	</div>

	<!-- Blocked IPs -->
	<div class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-textSec text-xs font-medium mb-2 leading-tight">{t('security_kpi_blockedIpsMobile')}</h3>
		<div class="text-2xl font-bold text-textMain">{standardKpiStats[1].value}</div>
		<span class="text-xs text-success flex items-center gap-0.5 font-medium mt-0.5"><i class="fa-solid fa-arrow-up text-xs"></i>{standardKpiStats[1].trend}</span>
		<p class="text-xs text-textSec mt-1.5 leading-tight">Auto: 28 · Manual: 10</p>
		<span class="mt-2 inline-block px-1.5 py-0.5 {standardKpiStats[1].badgeClass} text-xs rounded-full font-medium">{t(standardKpiStats[1].badgeKey)}</span>
	</div>

	<!-- Anomalies -->
	<div class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-textSec text-xs font-medium mb-2">{t('security_kpi_anomalies')}</h3>
		<div class="text-2xl font-bold {standardKpiStats[2].valueClass ?? 'text-textMain'}">{standardKpiStats[2].value}</div>
		<span class="text-xs {standardKpiStats[2].valueClass} flex items-center gap-0.5 font-medium mt-0.5"><i class="fa-solid fa-arrow-up text-xs"></i>{standardKpiStats[2].trend}</span>
		<p class="text-xs text-textSec mt-1.5 leading-tight">SQL, XSS, Rate</p>
		<span class="mt-2 inline-block px-1.5 py-0.5 {standardKpiStats[2].badgeClass} text-xs rounded-full font-medium">{t(standardKpiStats[2].badgeKey)}</span>
	</div>

	<!-- SSL Certs -->
	{#each secondaryKpis.filter(k => k.key === 'sslCerts') as kpi (kpi.key)}
		<div class="bg-card border border-surface rounded-xl p-4">
			<h3 class="text-textSec text-xs font-medium mb-2">{t(kpi.labelKey)}</h3>
			<div class="text-2xl font-bold {kpi.valueClass}">{t(kpi.value)}</div>
			<p class="text-xs text-textSec mt-1.5">{kpi.subtext} <span class="{kpi.subtextExtraClass}">{kpi.subtextExtra}</span></p>
			<div class="w-8 h-8 rounded-lg {kpi.iconBg} flex items-center justify-center mt-2">
				<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
			</div>
		</div>
	{/each}
</section>

<!-- ===== MOBILE: Secondary Stats (horizontal scroll) ===== -->
<section class="lg:hidden overflow-x-auto -mx-4 px-4">
	<div class="flex gap-3 w-max">
		{#each secondaryKpis.filter(k => k.key !== 'sslCerts') as kpi (kpi.key)}
			<div class="bg-card border border-surface rounded-xl p-4 w-36 flex-shrink-0">
				<div class="w-8 h-8 rounded-lg {kpi.iconBg} flex items-center justify-center mb-2">
					<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
				</div>
				<div class="text-xl font-bold text-textMain">{kpi.value}</div>
				<p class="text-xs text-textSec mt-0.5 leading-tight">{t(kpi.labelKey)}</p>
			</div>
		{/each}
		<div class="bg-card border border-surface rounded-xl p-4 w-36 flex-shrink-0">
			<div class="w-8 h-8 rounded-lg bg-blue/15 flex items-center justify-center mb-2">
				<i class="fa-solid fa-eye text-blue text-xs"></i>
			</div>
			<div class="text-xl font-bold text-textMain">12</div>
			<p class="text-xs text-textSec mt-0.5 leading-tight">Unikátní útočníci</p>
		</div>
	</div>
</section>
