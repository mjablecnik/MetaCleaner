<script lang="ts">
	import { t } from '$lib/i18n';
	import { getEdgeKpiStats, getEdgeSecondaryKpis } from '$lib/repositories/edgeRepository';

	const edgeKpis = getEdgeKpiStats();
	const secondaryKpis = getEdgeSecondaryKpis();
</script>

<!-- Desktop: KPI Stats Row 1 -->
<section class="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
	{#each edgeKpis as kpi (kpi.key)}
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-start mb-3">
				<h3 class="text-textSec text-sm font-medium">{t(kpi.labelKey)}</h3>
				{#if kpi.key === 'totalRequests'}
					<span class="px-2 py-0.5 {kpi.badgeClass} text-xs rounded-full font-medium">24h</span>
				{:else if kpi.badgeKey}
					<span class="px-2 py-0.5 {kpi.badgeClass} text-xs rounded-full font-medium"
						>{t(kpi.badgeKey)}</span
					>
				{/if}
			</div>
			<div class="flex items-end gap-2 {kpi.barWidth ? 'mb-3' : ''}">
				<span
					class="text-3xl font-bold {kpi.key === 'blockedThreats' ? 'text-secondary' : 'text-textMain'}"
					>{kpi.value}</span
				>
				{#if kpi.unit}
					<span class="text-sm text-textSec mb-1">{kpi.unit}</span>
				{/if}
				{#if kpi.trend}
					<span
						class="text-sm {kpi.trendPositive ? 'text-success' : 'text-secondary'} mb-1 flex items-center gap-1 ml-1"
					>
						<i class="fa-solid fa-arrow-up text-xs"></i>{kpi.trend}
					</span>
				{/if}
			</div>
			{#if kpi.barWidth && kpi.barClass}
				<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden">
					<div class="h-full {kpi.barClass} rounded-full" style="width:{kpi.barWidth}"></div>
				</div>
			{/if}
			<p class="text-xs text-textSec mt-2">{kpi.subtext}</p>
		</div>
	{/each}
</section>

<!-- Desktop: KPI Stats Row 2 -->
<section class="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
	{#each secondaryKpis as kpi (kpi.key)}
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-8 h-8 rounded-lg {kpi.iconBg} flex items-center justify-center">
					<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
				</div>
				<h3 class="text-textSec text-sm font-medium">{t(kpi.labelKey)}</h3>
			</div>
			<div class="text-2xl font-bold text-textMain">
				{kpi.value}{#if kpi.unit} <span class="text-sm font-normal text-textSec">{kpi.unit}</span
					>{/if}
			</div>
			<p class="text-xs text-textSec mt-1">
				{kpi.subtextIsKey ? t(kpi.subtext) : kpi.subtext}
			</p>
		</div>
	{/each}
</section>

<!-- Mobile: KPI Primary Row -->
<div class="lg:hidden space-y-4">
	<section class="grid grid-cols-2 gap-3">
		{#each edgeKpis as kpi (kpi.key)}
			{#if kpi.key === 'cacheHitRate'}
				<div class="bg-card border border-surface rounded-xl p-4 col-span-2">
					<div class="flex justify-between items-start mb-2">
						<h3 class="text-textSec text-xs font-medium">{t(kpi.labelKey)}</h3>
						{#if kpi.badgeKey}
							<span class="px-2 py-0.5 {kpi.badgeClass} text-xs rounded-full font-medium"
								>{t(kpi.badgeKey)}</span
							>
						{/if}
					</div>
					<div class="flex items-end gap-2 mb-2">
						<span class="text-4xl font-bold text-textMain">{kpi.value}</span>
						{#if kpi.unit}<span class="text-sm text-textSec mb-1">{kpi.unit}</span>{/if}
						{#if kpi.trend}
							<span
								class="text-sm {kpi.trendPositive ? 'text-success' : 'text-secondary'} mb-1 flex items-center gap-1 ml-1"
							>
								<i class="fa-solid fa-arrow-up text-xs"></i>{kpi.trend}
							</span>
						{/if}
					</div>
					{#if kpi.barWidth && kpi.barClass}
						<div class="w-full h-2 bg-surface rounded-full overflow-hidden">
							<div class="h-full {kpi.barClass} rounded-full" style="width:{kpi.barWidth}"></div>
						</div>
					{/if}
					<p class="text-xs text-textSec mt-2">{kpi.subtext}</p>
				</div>
			{:else if kpi.key === 'totalRequests'}
				<div class="bg-card border border-surface rounded-xl p-4">
					<div class="flex justify-between items-start mb-2">
						<h3 class="text-textSec text-xs font-medium leading-tight">{t(kpi.labelKey)}</h3>
						<span class="px-1.5 py-0.5 {kpi.badgeClass} text-xs rounded-full font-medium">24h</span>
					</div>
					<div class="text-2xl font-bold text-textMain">{kpi.value}</div>
					<p class="text-xs text-textSec mt-1">{kpi.subtext}</p>
				</div>
			{:else if kpi.key === 'savedBandwidth'}
				<div class="bg-card border border-surface rounded-xl p-4">
					<div class="flex justify-between items-start mb-2">
						<h3 class="text-textSec text-xs font-medium leading-tight">
							{t('edge_kpi_savedBandwidthMobile')}
						</h3>
						{#if kpi.badgeKey}
							<span class="px-1.5 py-0.5 {kpi.badgeClass} text-xs rounded-full font-medium"
								>{t(kpi.badgeKey)}</span
							>
						{/if}
					</div>
					<div class="flex items-end gap-1 mb-2">
						<span class="text-2xl font-bold text-textMain">{kpi.value}</span>
						{#if kpi.unit}<span class="text-xs text-textSec mb-0.5">{kpi.unit}</span>{/if}
					</div>
					{#if kpi.barWidth && kpi.barClass}
						<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden">
							<div class="h-full {kpi.barClass} rounded-full" style="width:{kpi.barWidth}"></div>
						</div>
					{/if}
					<p class="text-xs text-textSec mt-1">72% z cache</p>
				</div>
			{/if}
		{/each}
	</section>

	<!-- Mobile: Threats + Secondary KPIs -->
	<section class="grid grid-cols-2 gap-3">
		{#each edgeKpis as kpi (kpi.key)}
			{#if kpi.key === 'blockedThreats'}
				<div class="bg-card border border-surface rounded-xl p-4">
					<div class="flex justify-between items-start mb-2">
						<h3 class="text-textSec text-xs font-medium leading-tight">{t(kpi.labelKey)}</h3>
						{#if kpi.badgeKey}
							<span class="px-1.5 py-0.5 {kpi.badgeClass} text-xs rounded-full font-medium"
								>{t(kpi.badgeKey)}</span
							>
						{/if}
					</div>
					<div class="text-2xl font-bold text-secondary">{kpi.value}</div>
					<p class="text-xs text-secondary mt-1 flex items-center gap-1">
						<i class="fa-solid fa-arrow-up text-xs"></i>+312 dnes
					</p>
				</div>
			{/if}
		{/each}
		{#each secondaryKpis as kpi (kpi.key)}
			{#if kpi.key === 'avgTtfb'}
				<div class="bg-card border border-surface rounded-xl p-4">
					<div class="flex items-center gap-2 mb-2">
						<div class="w-6 h-6 rounded-md {kpi.iconBg} flex items-center justify-center">
							<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
						</div>
						<h3 class="text-textSec text-xs font-medium">{t(kpi.labelKey)}</h3>
					</div>
					<div class="text-2xl font-bold text-textMain">
						{kpi.value} <span class="text-xs font-normal text-textSec">{kpi.unit}</span>
					</div>
					<p class="text-xs text-textSec mt-1">-12ms vs. origin</p>
				</div>
			{:else if kpi.key === 'activePop'}
				<div class="bg-card border border-surface rounded-xl p-4">
					<div class="flex items-center gap-2 mb-2">
						<div class="w-6 h-6 rounded-md {kpi.iconBg} flex items-center justify-center">
							<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
						</div>
						<h3 class="text-textSec text-xs font-medium">{t(kpi.labelKey)}</h3>
					</div>
					<div class="text-2xl font-bold text-textMain">{kpi.value}</div>
					<p class="text-xs text-textSec mt-1">{t('edge_kpi_popSubtextMobile')}</p>
				</div>
			{:else if kpi.key === 'wafRules'}
				<div class="bg-card border border-surface rounded-xl p-4">
					<div class="flex items-center gap-2 mb-2">
						<div class="w-6 h-6 rounded-md {kpi.iconBg} flex items-center justify-center">
							<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
						</div>
						<h3 class="text-textSec text-xs font-medium">{t(kpi.labelKey)}</h3>
					</div>
					<div class="text-2xl font-bold text-textMain">{kpi.value}</div>
					<p class="text-xs text-textSec mt-1">3 nová dnes</p>
				</div>
			{/if}
		{/each}
	</section>

	<!-- Mobile: SSL/TLS Banner -->
	<div class="bg-card border border-surface rounded-xl p-4 flex items-center gap-3">
		<div class="w-10 h-10 rounded-lg bg-blue/15 flex items-center justify-center flex-shrink-0">
			<i class="fa-solid fa-rotate text-blue"></i>
		</div>
		<div class="flex-1 min-w-0">
			<div class="text-textMain font-bold text-base">TLS 1.3</div>
			<p class="text-xs text-textSec">Certifikát platný · exp. za 89 dní</p>
		</div>
		<span class="px-2 py-1 bg-success/10 text-success text-xs rounded-lg font-medium flex-shrink-0"
			>{t('common_status_valid')}</span
		>
	</div>
</div>
