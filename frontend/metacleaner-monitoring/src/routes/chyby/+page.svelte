<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';
	import {
		getErrorKpis,
		getErrorTypeBreakdown,
		getTopEndpoints,
		getErrorLog,
		getErrorsStats
	} from '$lib/repositories/errorsRepository';

	const kpis = getErrorKpis();
	const breakdown = getErrorTypeBreakdown();
	const endpoints = getTopEndpoints();
	const logEntries = getErrorLog();
	const errStats = getErrorsStats();

	let breakdownOpen = $state(true);
	let endpointsOpen = $state(true);
	let activeFilter = $state('all');

	const errorFilters = [
		{ value: 'all', labelKey: 'errors_filters_all' },
		{ value: '5xx', labelKey: 'errors_filters_5xx' },
		{ value: 'js', labelKey: 'errors_filters_js' },
		{ value: 'backend', labelKey: 'errors_filters_backend' },
		{ value: 'timeout', labelKey: 'errors_filters_timeout' }
	];

	onMount(() => {
		const Plotly = (window as any).Plotly;
		if (!Plotly) return;

		const bgCard = '#111d33';
		const textSec = '#94a3b8';
		const errorColor = '#ef4444';
		const secondaryColor = '#f97316';
		const purpleColor = '#8b5cf6';
		const blueColor = '#3b82f6';
		const gridColor = 'rgba(30,41,59,0.8)';
		const chartConfig = { responsive: true, displayModeBar: false, displaylogo: false };

		const commonLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 10, r: 10, b: 40, l: 40 },
			showlegend: false,
			xaxis: {
				gridcolor: gridColor,
				linecolor: gridColor,
				tickcolor: 'transparent',
				tickfont: { color: textSec, size: 10 },
				zeroline: false
			},
			yaxis: {
				gridcolor: gridColor,
				linecolor: gridColor,
				tickcolor: 'transparent',
				tickfont: { color: textSec, size: 10 },
				zeroline: false
			}
		};

		const mobileLayout = {
			...commonLayout,
			font: { ...commonLayout.font, size: 10 },
			margin: { t: 8, r: 8, b: 32, l: 32 },
			xaxis: { ...commonLayout.xaxis, tickfont: { color: textSec, size: 9 } },
			yaxis: { ...commonLayout.yaxis, tickfont: { color: textSec, size: 9 } }
		};

		const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
		const vals5xx = [1, 0, 2, 1, 3, 5, 7, 12, 6, 4, 3, 2];
		const jsVals = [4, 3, 6, 5, 9, 14, 18, 22, 17, 13, 10, 6];
		const backVals = [1, 0, 1, 2, 2, 3, 4, 5, 2, 1, 1, 0];

		const data5xx = [
			{
				type: 'scatter',
				mode: 'lines',
				fill: 'tozeroy',
				x: hours,
				y: vals5xx,
				line: { color: errorColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(239,68,68,0.12)',
				hovertemplate: '<b>%{x}</b><br>Chyby: %{y}<extra></extra>'
			},
			{
				type: 'scatter',
				mode: 'markers',
				x: hours,
				y: vals5xx,
				marker: { color: errorColor, size: 5, line: { color: bgCard, width: 1.5 } },
				hoverinfo: 'skip'
			}
		];

		const dataJsBackend = [
			{
				type: 'bar',
				name: 'JS Errors',
				x: hours,
				y: jsVals,
				marker: { color: secondaryColor, opacity: 0.85 },
				hovertemplate: '<b>%{x}</b><br>JS: %{y}<extra></extra>'
			},
			{
				type: 'bar',
				name: 'Backend',
				x: hours,
				y: backVals,
				marker: { color: errorColor, opacity: 0.85 },
				hovertemplate: '<b>%{x}</b><br>Backend: %{y}<extra></extra>'
			}
		];

		// Use breakdown counts from repository for pie chart
		const breakdownData = getErrorTypeBreakdown();
		const pieColors = [errorColor, secondaryColor, purpleColor, blueColor];
		const dataPie = [
			{
				type: 'pie',
				labels: breakdownData.map((b) => t(b.labelKey)),
				values: breakdownData.map((b) => b.count),
				hole: 0.62,
				marker: {
					colors: pieColors,
					line: { color: bgCard, width: 2 }
				},
				textinfo: 'none',
				hovertemplate: '<b>%{label}</b><br>%{value} chyb<br>%{percent}<extra></extra>',
				direction: 'clockwise'
			}
		];

		const total = breakdownData.reduce((s, b) => s + b.count, 0);
		const pieLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 10, r: 10, b: 10, l: 10 },
			showlegend: false,
			annotations: [
				{
					text: `<b style="font-size:20px;color:#fff">${total}</b><br><span style="font-size:11px;color:#94a3b8">celkem</span>`,
					x: 0.5,
					y: 0.5,
					xanchor: 'center',
					yanchor: 'middle',
					showarrow: false,
					font: { size: 14, color: '#ffffff' }
				}
			]
		};

		const pieMobileLayout = {
			...pieLayout,
			font: { ...pieLayout.font, size: 10 },
			margin: { t: 8, r: 8, b: 8, l: 8 },
			annotations: [
				{
					...pieLayout.annotations[0],
					text: `<b style="font-size:18px;color:#fff">${total}</b><br><span style="font-size:10px;color:#94a3b8">celkem</span>`
				}
			]
		};

		// Desktop charts
		const d5xx = document.getElementById('chart-5xx');
		if (d5xx)
			Plotly.newPlot('chart-5xx', data5xx, { ...commonLayout, xaxis: { ...commonLayout.xaxis, tickvals: hours.filter((_, i) => i % 2 === 0) } }, chartConfig);

		const dJsBackend = document.getElementById('chart-js-backend');
		if (dJsBackend)
			Plotly.newPlot('chart-js-backend', dataJsBackend, { ...commonLayout, barmode: 'group', bargap: 0.3, bargroupgap: 0.1 }, chartConfig);

		const dPie = document.getElementById('chart-pie');
		if (dPie) Plotly.newPlot('chart-pie', dataPie, pieLayout, chartConfig);

		// Mobile charts
		const m5xx = document.getElementById('chart-5xx-m');
		if (m5xx)
			Plotly.newPlot('chart-5xx-m', data5xx, { ...mobileLayout, xaxis: { ...mobileLayout.xaxis, tickvals: hours.filter((_, i) => i % 3 === 0) } }, chartConfig);

		const mJsBackend = document.getElementById('chart-js-backend-m');
		if (mJsBackend)
			Plotly.newPlot('chart-js-backend-m', dataJsBackend, { ...mobileLayout, barmode: 'group', bargap: 0.3, bargroupgap: 0.1 }, chartConfig);

		const mPie = document.getElementById('chart-pie-m');
		if (mPie) Plotly.newPlot('chart-pie-m', dataPie, pieMobileLayout, chartConfig);

		const handleResize = () => {
			['chart-5xx', 'chart-js-backend', 'chart-pie', 'chart-5xx-m', 'chart-js-backend-m', 'chart-pie-m'].forEach((id) => {
				const el = document.getElementById(id);
				if (el) Plotly.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- ===== DESKTOP LAYOUT ===== -->
<div class="hidden lg:block">
	<header class="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-[#1e293b] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-textMain">{t('errors_header_title')}</h1>
			<p class="text-sm text-textSec mt-1">{t('errors_header_subtitle')}</p>
		</div>
		<div class="flex items-center gap-3 flex-wrap">
			<div class="flex items-center gap-2 px-3 py-1.5 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium">
				<div class="w-2 h-2 rounded-full bg-error animate-pulse"></div>
				{errStats.activeIncidents} {t('errors_status_activeIncidents')}
			</div>
			<select class="bg-[#1e293b] border border-[#334155] text-sm text-textMain rounded-lg px-3 py-2 focus:outline-none">
				<option>{t('common_timeRange_last24h')}</option>
				<option>{t('common_timeRange_last7d')}</option>
				<option>{t('common_timeRange_last30d')}</option>
			</select>
			<button class="px-4 py-2 bg-[#1e293b] hover:bg-[#2d3748] text-white rounded-lg text-sm font-medium transition-colors border border-[#334155]">
				<i class="fa-solid fa-download mr-2"></i>{t('common_actions_export')}
			</button>
		</div>
	</header>

	<div class="p-6 max-w-7xl mx-auto space-y-6">
		<!-- KPI Stats -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each kpis as kpi (kpi.key)}
				<div class="bg-card border border-[#1e293b] rounded-xl p-5">
					<div class="flex justify-between items-start mb-3">
						<h3 class="text-textSec text-sm font-medium">{t(kpi.labelKey)}</h3>
						<span class="px-2 py-0.5 text-xs rounded-full font-medium {kpi.severityClass}">{t(kpi.severityKey)}</span>
					</div>
					<div class="flex items-end gap-2">
						<span class="text-3xl font-bold {kpi.valueClass}">{kpi.value}</span>
						<span class="text-sm {kpi.trendClass} mb-1 flex items-center gap-1">
							<i class="fa-solid {kpi.trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs"></i>{kpi.trend > 0 ? '+' : ''}{kpi.trend}
						</span>
					</div>
					<p class="text-xs text-textSec mt-2">{t(kpi.subtextKey)}</p>
				</div>
			{/each}
		</section>

		<!-- Charts Row -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<h3 class="text-lg font-semibold text-textMain">{t('errors_charts_5xxTimeline')}</h3>
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec">Backend API</span>
				</div>
				<div id="chart-5xx" class="h-[220px] w-full"></div>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<h3 class="text-lg font-semibold text-textMain">{t('errors_charts_jsVsBackend')}</h3>
					<div class="flex gap-3 text-xs">
						<div class="flex items-center gap-1.5">
							<span class="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span><span class="text-textSec">JS</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span class="w-2.5 h-2.5 rounded-full bg-error inline-block"></span><span class="text-textSec">Backend</span>
						</div>
					</div>
				</div>
				<div id="chart-js-backend" class="h-[220px] w-full"></div>
			</div>
		</section>

		<!-- Error Type Breakdown + Top Endpoints -->
		<section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Donut Chart -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<h3 class="text-lg font-semibold text-textMain mb-4">{t('errors_charts_errorTypes')}</h3>
				<div id="chart-pie" class="h-[220px] w-full"></div>
				<div class="mt-3 space-y-2">
					{#each breakdown as item (item.labelKey)}
						<div class="flex items-center justify-between text-sm">
							<div class="flex items-center gap-2">
								<span class="w-2.5 h-2.5 rounded-full {item.color} inline-block"></span>
								<span class="text-textSec">{t(item.labelKey)}</span>
							</div>
							<span class="text-textMain font-medium">{item.count}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Top Endpoints -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-5 lg:col-span-2">
				<div class="flex justify-between items-center mb-4">
					<h3 class="text-lg font-semibold text-textMain">{t('errors_endpoints_title')}</h3>
					<span class="text-xs text-textSec">{t('errors_endpoints_subtitle')}</span>
				</div>
				<div class="space-y-3">
					{#each endpoints as ep (ep.path)}
						<div class="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
							<span class="px-2 py-0.5 text-xs font-mono rounded font-semibold {ep.methodClass}">{ep.method}</span>
							<span class="text-textMain text-sm font-medium flex-1 truncate">{ep.path}</span>
							<div class="flex items-center gap-3">
								<div class="w-24 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
									<div class="h-full {ep.barClass} rounded-full" style="width:{ep.barWidth}"></div>
								</div>
								<span class="{ep.countClass} font-semibold text-sm w-8 text-right">{ep.errorCount}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Error Log Table -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-5">
			<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
				<h3 class="text-lg font-semibold text-textMain">{t('errors_log_title')}</h3>
				<div class="flex gap-3 flex-wrap">
					<div class="flex rounded-lg overflow-hidden border border-[#334155]">
						{#each errorFilters as filter}
							<button
								class="px-3 py-1.5 text-xs font-medium transition-colors {activeFilter === filter.value ? 'bg-error/20 text-error' : 'bg-transparent text-textSec hover:bg-[#1e293b]'}"
								onclick={() => (activeFilter = filter.value)}>{t(filter.labelKey)}</button
							>
						{/each}
					</div>
					<div class="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-1.5">
						<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
						<input type="text" placeholder={t('errors_log_searchPlaceholder')} class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-32" />
					</div>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-[#1e293b]">
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_time')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_type')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_message')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_endpoint')} / {t('common_table_source')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3">{t('common_table_status')}</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[#1e293b]/60">
						{#each logEntries as entry (entry.id)}
							<tr class="hover:bg-[#1e293b]/30 transition-colors">
								<td class="py-3 pr-4 text-textSec whitespace-nowrap">{entry.time}</td>
								<td class="py-3 pr-4"><span class="px-2 py-0.5 text-xs rounded font-medium {entry.typeClass}">{entry.type}</span></td>
								<td class="py-3 pr-4 text-textMain max-w-xs truncate">{entry.message}</td>
								<td class="py-3 pr-4 text-textSec font-mono text-xs">{entry.source}</td>
								<td class="py-3"><span class="px-2 py-0.5 text-xs rounded {entry.statusClass}">{t(entry.statusKey)}</span></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	</div>
</div>

<!-- ===== MOBILE LAYOUT ===== -->
<div class="lg:hidden">
	<div class="px-4 pt-4 space-y-4">
		<!-- Page Title + Time Selector -->
		<div class="flex items-start justify-between gap-3">
			<div>
				<h1 class="text-xl font-bold text-textMain">{t('errors_header_title')}</h1>
				<p class="text-xs text-textSec mt-0.5">{t('errors_header_subtitleMobile')}</p>
			</div>
			<select class="bg-[#1e293b] border border-[#334155] text-xs text-textMain rounded-lg px-3 py-2 focus:outline-none" style="min-height:44px">
				<option>{t('common_timeRange_last24h')}</option>
				<option>{t('common_timeRange_last7d')}</option>
				<option>{t('common_timeRange_last30d')}</option>
			</select>
		</div>

		<!-- Active Incidents Banner -->
		<div class="p-3 rounded-xl bg-error/10 border border-error/30 flex items-center gap-3">
			<div class="w-8 h-8 rounded-full bg-error/20 border border-error/40 flex items-center justify-center flex-shrink-0">
				<i class="fa-solid fa-triangle-exclamation text-error text-sm"></i>
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-sm font-semibold text-textMain">{errStats.activeIncidents} {t('errors_status_activeIncidents')}</p>
				<p class="text-xs text-textSec truncate">{errStats.bannerDescription}</p>
			</div>
			<i class="fa-solid fa-chevron-right text-textSec text-xs flex-shrink-0"></i>
		</div>

		<!-- KPI Stats 2x2 -->
		<section class="grid grid-cols-2 gap-3">
			{#each kpis as kpi (kpi.key)}
				<div class="bg-card border border-[#1e293b] rounded-xl p-4">
					<div class="flex items-center justify-between mb-2">
						<span class="text-textSec text-xs font-medium leading-tight">{t(kpi.labelKeyMobile)}</span>
						<span class="px-1.5 py-0.5 text-[10px] rounded-full font-medium {kpi.severityClass}">{t(kpi.severityKey)}</span>
					</div>
					<div class="flex items-end gap-1.5">
						<span class="text-2xl font-bold {kpi.valueClass}">{kpi.value}</span>
						<span class="text-xs {kpi.trendClass} mb-0.5 flex items-center gap-0.5">
							<i class="fa-solid {kpi.trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-[10px]"></i>{kpi.trend > 0 ? '+' : ''}{kpi.trend}
						</span>
					</div>
					<p class="text-[10px] text-textSec mt-1.5">{t(kpi.subtextKeyMobile)}</p>
				</div>
			{/each}
		</section>

		<!-- 5xx Chart -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-semibold text-textMain">{t('errors_charts_5xxTimeline')}</h3>
				<span class="px-2 py-1 bg-badge rounded text-[10px] text-textSec">Backend API</span>
			</div>
			<div id="chart-5xx-m" class="h-[180px] w-full"></div>
		</section>

		<!-- JS vs Backend Chart -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-semibold text-textMain">{t('errors_mobile_jsVsBackend')}</h3>
				<div class="flex gap-3 text-[10px]">
					<div class="flex items-center gap-1">
						<span class="w-2 h-2 rounded-full bg-secondary inline-block"></span><span class="text-textSec">JS</span>
					</div>
					<div class="flex items-center gap-1">
						<span class="w-2 h-2 rounded-full bg-error inline-block"></span><span class="text-textSec">Backend</span>
					</div>
				</div>
			</div>
			<div id="chart-js-backend-m" class="h-[180px] w-full"></div>
		</section>

		<!-- Error Type Breakdown Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				class="w-full flex items-center justify-between p-4"
				style="min-height:52px"
				onclick={() => (breakdownOpen = !breakdownOpen)}
			>
				<h3 class="text-sm font-semibold text-textMain">{t('errors_charts_errorTypes')}</h3>
				<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {breakdownOpen ? 'rotate-180' : ''}"></i>
			</button>
			{#if breakdownOpen}
				<div class="px-4 pb-4">
					<div id="chart-pie-m" class="h-[200px] w-full"></div>
					<div class="mt-3 space-y-2.5">
						{#each breakdown as item (item.labelKey)}
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="w-2.5 h-2.5 rounded-full {item.color} inline-block"></span>
									<span class="text-textSec text-xs">{t(item.labelKey)}</span>
								</div>
								<span class="text-textMain font-semibold text-sm">{item.count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</section>

		<!-- Top Endpoints Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				class="w-full flex items-center justify-between p-4"
				style="min-height:52px"
				onclick={() => (endpointsOpen = !endpointsOpen)}
			>
				<h3 class="text-sm font-semibold text-textMain">{t('errors_endpoints_title')}</h3>
				<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {endpointsOpen ? 'rotate-180' : ''}"></i>
			</button>
			{#if endpointsOpen}
				<div class="px-4 pb-4 space-y-2.5">
					{#each endpoints as ep (ep.path)}
						<div class="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
							<span class="px-2 py-0.5 text-[10px] font-mono rounded font-semibold shrink-0 {ep.methodClass}">{ep.method}</span>
							<span class="text-textMain text-xs font-medium flex-1 truncate">{ep.path}</span>
							<div class="flex items-center gap-2 shrink-0">
								<div class="w-16 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
									<div class="h-full {ep.barClass} rounded-full" style="width:{ep.barWidth}"></div>
								</div>
								<span class="{ep.countClass} font-bold text-xs w-5 text-right">{ep.errorCount}</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Error Log Card-based -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4 mb-24">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-semibold text-textMain">{t('errors_mobile_logTitle')}</h3>
				<span class="text-[10px] text-textSec">{logEntries.length} {t('common_labels_entries')}</span>
			</div>

			<!-- Search -->
			<div class="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5 mb-3">
				<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
				<input type="text" placeholder={t('errors_log_searchPlaceholder')} class="bg-transparent text-xs text-textMain placeholder-textSec outline-none flex-1" />
			</div>

			<!-- Filter Pills (using errorFilters with labelKeys) -->
			<div class="flex gap-1.5 mb-4 overflow-x-auto pb-1">
				{#each errorFilters as filter}
					<button
						class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
						style="min-height:36px"
						onclick={() => (activeFilter = filter.value)}
						style:background-color={activeFilter === filter.value ? 'rgba(239,68,68,0.2)' : '#1e293b'}
						style:color={activeFilter === filter.value ? '#ef4444' : '#94a3b8'}
					>
						{t(filter.labelKey)}
					</button>
				{/each}
			</div>

			<!-- Log Cards -->
			<div class="space-y-3">
				{#each logEntries as entry (entry.id)}
					<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40 space-y-2">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="px-2 py-0.5 text-[10px] rounded font-bold {entry.typeClass}">{entry.type}</span>
								<span class="text-textSec text-[10px]">{entry.time}</span>
							</div>
							<span class="px-2 py-0.5 text-[10px] rounded font-medium {entry.statusClass}">{t(entry.statusKey)}</span>
						</div>
						<p class="text-xs text-textMain font-medium leading-snug">{entry.message}</p>
						<p class="text-[10px] text-textSec font-mono">{entry.source}</p>
					</div>
				{/each}
			</div>
		</section>
	</div>

	<!-- Mobile Bottom Navigation -->
	<nav class="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-[#1e293b] flex items-center justify-around px-2 py-2">
		<a href="{base}/" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-textMain transition-colors" style="min-width:52px;min-height:52px;justify-content:center">
			<i class="fa-solid fa-gauge-high text-lg"></i>
			<span class="text-xs">{t('layout_nav_dashboard')}</span>
		</a>
		<a href="{base}/dostupnost" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-textMain transition-colors" style="min-width:52px;min-height:52px;justify-content:center">
			<i class="fa-solid fa-server text-lg"></i>
			<span class="text-xs">{t('layout_nav_availability')}</span>
		</a>
		<a href="{base}/chyby" class="flex flex-col items-center gap-1 px-3 py-2" style="min-width:52px;min-height:52px;justify-content:center;color:#ef4444">
			<i class="fa-solid fa-triangle-exclamation text-lg"></i>
			<span class="text-xs font-semibold">{t('layout_nav_errors')}</span>
		</a>
		<a href="{base}/performance" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-textMain transition-colors" style="min-width:52px;min-height:52px;justify-content:center">
			<i class="fa-solid fa-bolt text-lg"></i>
			<span class="text-xs">{t('layout_nav_performance')}</span>
		</a>
		<a href="{base}/nastaveni" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-textMain transition-colors" style="min-width:52px;min-height:52px;justify-content:center">
			<i class="fa-solid fa-gear text-lg"></i>
			<span class="text-xs">{t('layout_nav_settings')}</span>
		</a>
	</nav>
</div>
