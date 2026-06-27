<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';
	import {
		getPerformanceKpiStats,
		getPerformanceSecondaryKpis,
		getSlowEndpoints,
		getCoreWebVitals,
		getErrorCodeDistribution,
		getPerformanceEvents
	} from '$lib/repositories/performanceRepository';

	type AccordionKey = 'response' | 'throughput' | 'cpu' | 'errors';
	type EventFilter = 'all' | 'critical' | 'warning' | 'info';

	const kpiStats = getPerformanceKpiStats();
	const secondaryKpis = getPerformanceSecondaryKpis();
	const slowEndpoints = getSlowEndpoints();
	const coreWebVitals = getCoreWebVitals();
	const errorDistribution = getErrorCodeDistribution();
	const performanceEvents = getPerformanceEvents();

	let accordionOpen = $state<Record<AccordionKey, boolean>>({
		response: true,
		throughput: false,
		cpu: false,
		errors: false
	});
	let activeEventFilter = $state<EventFilter>('all');

	function toggleAccordion(key: AccordionKey) {
		accordionOpen[key] = !accordionOpen[key];
		if (accordionOpen[key]) {
			setTimeout(() => {
				const Plotly = (window as any).Plotly;
				if (!Plotly) return;
				const elMap: Record<AccordionKey, string> = {
					response: 'chart-response-time-m',
					throughput: 'chart-throughput-m',
					cpu: 'chart-cpu-ram-m',
					errors: 'chart-error-donut-m'
				};
				const el = document.getElementById(elMap[key]);
				if (el) Plotly.Plots.resize(el);
			}, 50);
		}
	}

	onMount(() => {
		const Plotly = (window as any).Plotly;
		if (!Plotly) return;

		const bgCard = '#111d33';
		const textSec = '#94a3b8';
		const errorColor = '#ef4444';
		const secondaryColor = '#f97316';
		const purpleColor = '#8b5cf6';
		const blueColor = '#3b82f6';
		const greenColor = '#3ecf8e';
		const amberColor = '#f59e0b';
		const gridColor = 'rgba(30,41,59,0.8)';
		const chartConfig = { responsive: true, displayModeBar: false, displaylogo: false };

		const commonLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 10, r: 10, b: 40, l: 50 },
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
			margin: { t: 8, r: 8, b: 36, l: 44 },
			xaxis: { ...commonLayout.xaxis, tickfont: { color: textSec, size: 9 }, nticks: 6 },
			yaxis: { ...commonLayout.yaxis, tickfont: { color: textSec, size: 9 } }
		};

		const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
		const hoursShort = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];

		const avgResp = [120, 105, 130, 150, 180, 220, 310, 460, 280, 210, 185, 165];
		const p95Resp = [310, 280, 350, 420, 520, 780, 1100, 1840, 920, 680, 520, 440];
		const rpm = [820, 710, 950, 1240, 2100, 4800, 5840, 6210, 4980, 3840, 2910, 1920];
		const errs = [12, 8, 14, 18, 42, 180, 220, 310, 160, 90, 54, 30];
		const cpu = [18, 14, 22, 28, 42, 68, 78, 84, 62, 48, 38, 30];
		const ram = [55, 52, 58, 62, 68, 78, 82, 85, 80, 76, 72, 68];

		const dataResponseTime = [
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				name: 'P95', x: hours, y: p95Resp,
				line: { color: purpleColor, width: 2, shape: 'spline' },
				fillcolor: 'rgba(139,92,246,0.07)',
				hovertemplate: '<b>%{x}</b><br>P95: %{y}ms<extra></extra>'
			},
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				name: 'Avg', x: hours, y: avgResp,
				line: { color: greenColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(62,207,142,0.10)',
				hovertemplate: '<b>%{x}</b><br>Avg: %{y}ms<extra></extra>'
			}
		];

		const dataThroughput = [
			{
				type: 'bar', name: 'req/min',
				x: hours, y: rpm,
				marker: { color: blueColor, opacity: 0.75 },
				hovertemplate: '<b>%{x}</b><br>%{y} req/min<extra></extra>'
			},
			{
				type: 'scatter', mode: 'lines',
				name: 'Chyby', x: hours, y: errs,
				yaxis: 'y2',
				line: { color: errorColor, width: 2, shape: 'spline' },
				hovertemplate: '<b>%{x}</b><br>Chyby: %{y}<extra></extra>'
			}
		];

		const dataCpuRam = [
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				name: 'CPU', x: hours, y: cpu,
				line: { color: greenColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(62,207,142,0.08)',
				hovertemplate: '<b>%{x}</b><br>CPU: %{y}%<extra></extra>'
			},
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				name: 'RAM', x: hours, y: ram,
				line: { color: amberColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(245,158,11,0.07)',
				hovertemplate: '<b>%{x}</b><br>RAM: %{y}%<extra></extra>'
			}
		];

		const dataErrorDonut = [
			{
				type: 'pie',
				labels: ['500 Internal', '503 Timeout', '502 Bad GW', 'Ostatní'],
				values: [42, 31, 18, 9],
				hole: 0.60,
				marker: {
					colors: [errorColor, secondaryColor, amberColor, purpleColor],
					line: { color: bgCard, width: 2 }
				},
				textinfo: 'none',
				hovertemplate: '<b>%{label}</b><br>%{value}%<extra></extra>',
				direction: 'clockwise'
			}
		];

		const pieLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 5, r: 5, b: 5, l: 5 },
			showlegend: false,
			annotations: [{
				text: '<b>68</b><br><span style="font-size:10px;color:#94a3b8">chyb / 24h</span>',
				x: 0.5, y: 0.5,
				xanchor: 'center', yanchor: 'middle',
				showarrow: false,
				font: { size: 14, color: '#ffffff' }
			}]
		};

		const throughputLayout = {
			...commonLayout,
			bargap: 0.3,
			yaxis: { ...commonLayout.yaxis, title: { text: 'req/min', font: { size: 10, color: textSec } } },
			yaxis2: {
				overlaying: 'y', side: 'right',
				gridcolor: 'transparent',
				tickfont: { color: errorColor, size: 9 },
				zeroline: false, showgrid: false
			}
		};

		// Desktop charts
		const elRespTime = document.getElementById('chart-response-time');
		if (elRespTime) Plotly.newPlot('chart-response-time', dataResponseTime, { ...commonLayout, yaxis: { ...commonLayout.yaxis, title: { text: 'ms', font: { size: 10, color: textSec } } } }, chartConfig);

		const elThroughput = document.getElementById('chart-throughput');
		if (elThroughput) Plotly.newPlot('chart-throughput', dataThroughput, throughputLayout, chartConfig);

		const elCpuRam = document.getElementById('chart-cpu-ram');
		if (elCpuRam) Plotly.newPlot('chart-cpu-ram', dataCpuRam, { ...commonLayout, yaxis: { ...commonLayout.yaxis, range: [0, 100], title: { text: '%', font: { size: 10, color: textSec } } } }, chartConfig);

		const elErrorDonut = document.getElementById('chart-error-donut');
		if (elErrorDonut) Plotly.newPlot('chart-error-donut', dataErrorDonut, pieLayout, chartConfig);

		// Mobile charts
		const mobileThroughputLayout = {
			...mobileLayout,
			bargap: 0.3,
			yaxis: { ...mobileLayout.yaxis, title: { text: 'rpm', font: { size: 9, color: textSec } } },
			yaxis2: {
				overlaying: 'y', side: 'right',
				gridcolor: 'transparent',
				tickfont: { color: errorColor, size: 8 },
				zeroline: false, showgrid: false
			}
		};

		const mobilePieLayout = {
			...pieLayout,
			margin: { t: 5, r: 5, b: 5, l: 5 },
			annotations: [{
				text: '<b>68</b><br><span style="font-size:9px;color:#94a3b8">chyb/24h</span>',
				x: 0.5, y: 0.5,
				xanchor: 'center', yanchor: 'middle',
				showarrow: false,
				font: { size: 14, color: '#ffffff' }
			}]
		};

		const dataResponseTimeM = dataResponseTime.map((d: any) => ({ ...d, x: hoursShort }));
		const dataThroughputM = dataThroughput.map((d: any) => ({ ...d, x: hoursShort }));
		const dataCpuRamM = dataCpuRam.map((d: any) => ({ ...d, x: hoursShort }));

		const elRespTimeM = document.getElementById('chart-response-time-m');
		if (elRespTimeM) Plotly.newPlot('chart-response-time-m', dataResponseTimeM, { ...mobileLayout, yaxis: { ...mobileLayout.yaxis, title: { text: 'ms', font: { size: 9, color: textSec } } } }, chartConfig);

		const elThroughputM = document.getElementById('chart-throughput-m');
		if (elThroughputM) Plotly.newPlot('chart-throughput-m', dataThroughputM, mobileThroughputLayout, chartConfig);

		const elCpuRamM = document.getElementById('chart-cpu-ram-m');
		if (elCpuRamM) Plotly.newPlot('chart-cpu-ram-m', dataCpuRamM, { ...mobileLayout, yaxis: { ...mobileLayout.yaxis, range: [0, 100], title: { text: '%', font: { size: 9, color: textSec } } } }, chartConfig);

		const elErrorDonutM = document.getElementById('chart-error-donut-m');
		if (elErrorDonutM) Plotly.newPlot('chart-error-donut-m', dataErrorDonut, mobilePieLayout, chartConfig);

		const handleResize = () => {
			['chart-response-time', 'chart-throughput', 'chart-cpu-ram', 'chart-error-donut',
			 'chart-response-time-m', 'chart-throughput-m', 'chart-cpu-ram-m', 'chart-error-donut-m'].forEach(id => {
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
		<div class="flex items-center gap-4">
			<div class="w-9 h-9 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center">
				<i class="fa-solid fa-bolt text-[#f59e0b] text-sm"></i>
			</div>
			<div>
				<h1 class="text-2xl font-bold text-textMain">{t('layout_nav_performance')}</h1>
				<p class="text-sm text-textSec mt-0.5">{t('performance_header_subtitle')}</p>
			</div>
		</div>
		<div class="flex items-center gap-3 flex-wrap">
			<div class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium">
				<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
				{t('performance_status_systemOk')}
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

		<!-- KPI Stats Row 1 -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each kpiStats as stat (stat.key)}
				<div class="bg-card border border-[#1e293b] rounded-xl p-5">
					<div class="flex justify-between items-start mb-3">
						<h3 class="text-textSec text-sm font-medium">{t(stat.labelKey)}</h3>
						<span class="px-2 py-0.5 {stat.badgeClass} text-xs rounded-full font-medium">{t(stat.badgeKey)}</span>
					</div>
					<div class="flex items-end gap-2 mb-3">
						<span class="text-3xl font-bold {stat.valueClass ?? 'text-textMain'}">{stat.value}</span>
						{#if stat.unit}
							<span class="text-sm text-textSec mb-1">{stat.unit}</span>
						{/if}
						{#if stat.trend}
							<span class="text-sm {stat.trendPositive ? 'text-success' : 'text-error'} mb-1 flex items-center gap-1">
								<i class="fa-solid {stat.trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs"></i>{stat.trend}
							</span>
						{/if}
					</div>
					{#if stat.barWidth}
						<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full {stat.barClass} rounded-full" style="width:{stat.barWidth}"></div>
						</div>
					{/if}
					<p class="text-xs text-textSec mt-2">{stat.subtext}</p>
				</div>
			{/each}
		</section>

		<!-- KPI Stats Row 2 -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each secondaryKpis as kpi (kpi.key)}
				<div class="bg-card border border-[#1e293b] rounded-xl p-5">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-8 h-8 rounded-lg {kpi.iconBg} flex items-center justify-center">
							<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
						</div>
						<h3 class="text-textSec text-sm font-medium">{t(kpi.labelKey)}</h3>
					</div>
					{#if kpi.barWidth}
						<div class="flex items-end gap-2 mb-2">
							<span class="text-2xl font-bold text-textMain">{kpi.value}</span>
							{#if kpi.unit}
								<span class="text-sm text-textSec mb-0.5">{kpi.unit}</span>
							{/if}
						</div>
						<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full {kpi.barColor} rounded-full" style="width:{kpi.barWidth}"></div>
						</div>
					{:else}
						<div class="text-2xl font-bold text-textMain">{kpi.value} <span class="text-sm font-normal text-textSec">{kpi.unit}</span></div>
					{/if}
					<p class="text-xs text-textSec mt-2">{kpi.subtext}</p>
				</div>
			{/each}
		</section>

		<!-- Charts Row 1 -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('performance_charts_responseTime')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('performance_charts_responseSubtitle')}</p>
					</div>
					<div class="flex gap-2">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3ecf8e] inline-block"></span>Avg</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#8b5cf6] inline-block"></span>P95</span>
					</div>
				</div>
				<div id="chart-response-time" class="h-[220px] w-full"></div>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('performance_charts_throughput')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('performance_charts_throughputSubtitle')}</p>
					</div>
					<div class="flex gap-2">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3b82f6] inline-block"></span>req/min</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#ef4444] inline-block"></span>Chyby</span>
					</div>
				</div>
				<div id="chart-throughput" class="h-[220px] w-full"></div>
			</div>
		</section>

		<!-- Charts Row 2 -->
		<section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5 lg:col-span-2">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('performance_charts_cpuRam')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('performance_charts_cpuRamSubtitle')}</p>
					</div>
					<div class="flex gap-2">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3ecf8e] inline-block"></span>CPU</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#f59e0b] inline-block"></span>RAM</span>
					</div>
				</div>
				<div id="chart-cpu-ram" class="h-[220px] w-full"></div>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<h3 class="text-lg font-semibold text-textMain mb-1">{t('performance_charts_errorTypes')}</h3>
				<p class="text-xs text-textSec mb-4">{t('performance_charts_errorTypesSubtitle')}</p>
				<div id="chart-error-donut" class="h-[180px] w-full"></div>
				<div class="mt-4 space-y-2">
					{#each errorDistribution as dist (dist.code)}
						<div class="flex items-center justify-between text-sm">
							<div class="flex items-center gap-2">
								<span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color:{dist.color}"></span>
								<span class="text-textSec">{dist.label}</span>
							</div>
							<span class="text-textMain font-medium">{dist.percent}%</span>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Endpoints + Web Vitals -->
		<section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5 lg:col-span-2">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('performance_endpoints_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('performance_endpoints_subtitle')}</p>
					</div>
					<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('performance_endpoints_badge')}</span>
				</div>
				<div class="space-y-3">
					{#each slowEndpoints as ep (ep.id)}
						<div class="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
							<span class="px-2 py-0.5 {ep.methodClass} text-xs font-mono rounded font-semibold flex-shrink-0">{ep.method}</span>
							<div class="flex-1 min-w-0">
								<p class="text-textMain text-sm font-mono truncate">{ep.path}</p>
								<p class="text-xs text-textSec mt-0.5">Calls: {ep.callCount} · Errors: {ep.errorRate}</p>
							</div>
							<div class="flex-shrink-0 w-28">
								<div class="flex items-center justify-between mb-1">
									<span class="{ep.timeColor} font-bold text-sm">{ep.avgMs.toLocaleString()} ms</span>
								</div>
								<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden">
									<div class="h-full {ep.barColor} rounded-full" style="width:{ep.barWidth}"></div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<h3 class="text-lg font-semibold text-textMain mb-1">{t('performance_cwv_title')}</h3>
				<p class="text-xs text-textSec mb-5">{t('performance_cwv_subtitle')}</p>
				<div class="space-y-5">
					{#each coreWebVitals as vital (vital.key)}
						<div>
							<div class="flex justify-between items-center mb-1.5">
								<div>
									<span class="text-sm text-textMain font-medium">{vital.label}</span>
									<span class="text-xs text-textSec ml-1">{vital.description}</span>
								</div>
								<span class="{vital.statusClass} font-bold text-sm">{vital.value}{vital.unit}</span>
							</div>
							<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full {vital.barClass} rounded-full" style="width:{vital.barWidth}"></div>
							</div>
							<div class="flex justify-between text-xs text-textSec mt-1">
								<span>{vital.threshold}</span>
								<span class="{vital.statusClass} font-medium">{vital.statusSymbol}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Performance Event Log -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-5">
			<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('performance_eventLog_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('performance_eventLog_subtitle')}</p>
				</div>
				<div class="flex gap-3 flex-wrap">
					<div class="flex rounded-lg overflow-hidden border border-[#334155]">
						<button class="px-3 py-1.5 bg-[#f59e0b]/20 text-[#f59e0b] text-xs font-medium">{t('performance_filters_all')}</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">{t('performance_filters_critical')}</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">{t('performance_filters_warning')}</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">{t('performance_filters_info')}</button>
					</div>
					<div class="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-1.5">
						<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
						<input type="text" placeholder={t('performance_eventLog_searchPlaceholder')} class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-32" />
					</div>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-[#1e293b]">
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_time')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('performance_table_severity')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_type')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('performance_table_descriptionEndpoint')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('performance_table_service')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3">{t('common_table_status')}</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[#1e293b]/60">
						{#each performanceEvents as evt (evt.id)}
							<tr class="hover:bg-[#1e293b]/30 transition-colors">
								<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">{evt.time}</td>
								<td class="py-3 pr-4"><span class="px-2 py-0.5 {evt.levelClass} text-xs rounded font-medium">{t(evt.levelKey)}</span></td>
								<td class="py-3 pr-4 text-textSec text-xs">{evt.type}</td>
								<td class="py-3 pr-4 text-textMain max-w-xs truncate">{evt.message}</td>
								<td class="py-3 pr-4 text-textSec font-mono text-xs">{evt.endpoint ?? ''}</td>
								<td class="py-3"><span class="px-2 py-0.5 {evt.statusClass} text-xs rounded">{t(evt.statusKey)}</span></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

	</div>
</div>

<!-- ===== MOBILE LAYOUT ===== -->
<div class="lg:hidden pb-20">

	<!-- Title row -->
	<div class="px-4 pt-3 pb-2 bg-card border-b border-[#1e293b] flex items-center justify-between gap-3">
		<div class="flex items-center gap-2.5">
			<div class="w-7 h-7 rounded-md bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center">
				<i class="fa-solid fa-bolt text-[#f59e0b] text-xs"></i>
			</div>
			<p class="text-xs text-textSec truncate">{t('performance_header_subtitleMobile')}</p>
		</div>
		<select class="bg-[#1e293b] border border-[#334155] text-xs text-textMain rounded-lg px-2.5 py-1.5 focus:outline-none flex-shrink-0">
			<option>{t('common_timeRange_last24h')}</option>
			<option>{t('common_timeRange_last7d')}</option>
			<option>{t('common_timeRange_last30d')}</option>
		</select>
	</div>

	<div class="px-4 py-4 space-y-4">

		<!-- KPI Primary Stats - 2x2 grid -->
		<section class="grid grid-cols-2 gap-3">
			{#each kpiStats as stat (stat.key)}
				<div class="bg-card border border-[#1e293b] rounded-xl p-4">
					<div class="flex items-start justify-between mb-2">
						<h3 class="text-textSec text-xs font-medium leading-tight">
							{#if stat.key === 'avgResponseTime'}
								{t('performance_kpi_avgResponseTimeMobile')}
							{:else}
								{t(stat.labelKey)}
							{/if}
						</h3>
						<span class="px-1.5 py-0.5 {stat.badgeClass} text-xs rounded-full font-medium flex-shrink-0 ml-1">
							{#if stat.key === 'apdex'}✓{:else if stat.key === 'errorRate'}⚠{:else if stat.key === 'throughput'}N{:else}{t(stat.badgeKey)}{/if}
						</span>
					</div>
					<div class="flex items-end gap-1 mb-2">
						<span class="text-2xl font-bold {stat.valueClass ?? 'text-textMain'}">{stat.value}</span>
						{#if stat.unit}
							<span class="text-xs text-textSec mb-0.5">{stat.unit}</span>
						{/if}
						{#if stat.trend}
							<span class="text-xs {stat.trendPositive ? 'text-success' : 'text-error'} mb-0.5 flex items-center gap-0.5">
								<i class="fa-solid {stat.trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs"></i>{stat.trend}
							</span>
						{/if}
					</div>
					{#if stat.barWidth}
						<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full {stat.barClass} rounded-full" style="width:{stat.barWidth}"></div>
						</div>
					{/if}
					<p class="text-xs text-textSec mt-1.5">{stat.subtext}</p>
				</div>
			{/each}
		</section>

		<!-- System Resources -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<h3 class="text-sm font-semibold text-textMain mb-3">{t('performance_resources_title')}</h3>
			<div class="grid grid-cols-2 gap-4">
				{#each secondaryKpis as kpi (kpi.key)}
					<div>
						<div class="flex items-center gap-2 mb-2">
							<div class="w-6 h-6 rounded-md {kpi.iconBg} flex items-center justify-center flex-shrink-0">
								<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
							</div>
							<span class="text-textSec text-xs">{kpi.shortLabel}</span>
						</div>
						{#if kpi.barWidth}
							<div class="flex items-end gap-1 mb-1.5">
								<span class="text-xl font-bold text-textMain">{kpi.value}</span>
								{#if kpi.unit}
									<span class="text-xs text-textSec mb-0.5">{kpi.unit}</span>
								{/if}
							</div>
							<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full {kpi.barColor} rounded-full" style="width:{kpi.barWidth}"></div>
							</div>
						{:else}
							<div class="flex items-end gap-1">
								<span class="text-xl font-bold text-textMain">{kpi.value}</span>
								{#if kpi.unit}
									<span class="text-xs text-textSec mb-0.5">{kpi.unit}</span>
								{/if}
							</div>
						{/if}
						<p class="text-xs text-textSec mt-1">{kpi.subtext}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Charts (Accordions) -->
		<section class="space-y-3">
			<!-- Response Time -->
			<div class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
				<button
					onclick={() => toggleAccordion('response')}
					class="w-full flex items-center justify-between p-4 text-left"
				>
					<div class="flex items-center gap-3">
						<div class="w-7 h-7 rounded-lg bg-[#3ecf8e]/15 flex items-center justify-center">
							<i class="fa-solid fa-wave-square text-[#3ecf8e] text-xs"></i>
						</div>
						<div>
							<p class="text-sm font-semibold text-textMain">{t('performance_charts_responseTimeMobile')}</p>
							<p class="text-xs text-textSec">{t('performance_charts_responseSubtitleMobile')}</p>
						</div>
					</div>
					<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {accordionOpen.response ? 'rotate-180' : ''}"></i>
				</button>
				{#if accordionOpen.response}
					<div class="px-4 pb-4">
						<div class="flex gap-2 mb-3">
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3ecf8e] inline-block"></span>Avg</span>
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#8b5cf6] inline-block"></span>P95</span>
						</div>
						<div id="chart-response-time-m" class="h-[180px] w-full"></div>
					</div>
				{/if}
			</div>

			<!-- Throughput -->
			<div class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
				<button
					onclick={() => toggleAccordion('throughput')}
					class="w-full flex items-center justify-between p-4 text-left"
				>
					<div class="flex items-center gap-3">
						<div class="w-7 h-7 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center">
							<i class="fa-solid fa-chart-bar text-[#3b82f6] text-xs"></i>
						</div>
						<div>
							<p class="text-sm font-semibold text-textMain">{t('performance_charts_throughputMobile')}</p>
							<p class="text-xs text-textSec">{t('performance_charts_throughputSubtitleMobile')}</p>
						</div>
					</div>
					<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {accordionOpen.throughput ? 'rotate-180' : ''}"></i>
				</button>
				{#if accordionOpen.throughput}
					<div class="px-4 pb-4">
						<div class="flex gap-2 mb-3">
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3b82f6] inline-block"></span>req/min</span>
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#ef4444] inline-block"></span>Chyby</span>
						</div>
						<div id="chart-throughput-m" class="h-[180px] w-full"></div>
					</div>
				{/if}
			</div>

			<!-- CPU & RAM -->
			<div class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
				<button
					onclick={() => toggleAccordion('cpu')}
					class="w-full flex items-center justify-between p-4 text-left"
				>
					<div class="flex items-center gap-3">
						<div class="w-7 h-7 rounded-lg bg-[#f59e0b]/15 flex items-center justify-center">
							<i class="fa-solid fa-server text-[#f59e0b] text-xs"></i>
						</div>
						<div>
							<p class="text-sm font-semibold text-textMain">{t('performance_charts_cpuRamMobile')}</p>
							<p class="text-xs text-textSec">{t('performance_charts_cpuRamSubtitleMobile')}</p>
						</div>
					</div>
					<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {accordionOpen.cpu ? 'rotate-180' : ''}"></i>
				</button>
				{#if accordionOpen.cpu}
					<div class="px-4 pb-4">
						<div class="flex gap-2 mb-3">
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3ecf8e] inline-block"></span>CPU</span>
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#f59e0b] inline-block"></span>RAM</span>
						</div>
						<div id="chart-cpu-ram-m" class="h-[180px] w-full"></div>
					</div>
				{/if}
			</div>

			<!-- Error Distribution -->
			<div class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
				<button
					onclick={() => toggleAccordion('errors')}
					class="w-full flex items-center justify-between p-4 text-left"
				>
					<div class="flex items-center gap-3">
						<div class="w-7 h-7 rounded-lg bg-error/15 flex items-center justify-center">
							<i class="fa-solid fa-circle-exclamation text-error text-xs"></i>
						</div>
						<div>
							<p class="text-sm font-semibold text-textMain">{t('performance_charts_errorTypes')}</p>
							<p class="text-xs text-textSec">{t('performance_charts_errorTypesSubtitleMobile')}</p>
						</div>
					</div>
					<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {accordionOpen.errors ? 'rotate-180' : ''}"></i>
				</button>
				{#if accordionOpen.errors}
					<div class="px-4 pb-4">
						<div id="chart-error-donut-m" class="h-[180px] w-full"></div>
						<div class="mt-3 space-y-2.5">
							{#each errorDistribution as dist (dist.code)}
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color:{dist.color}"></span>
										<span class="text-textSec text-xs">{dist.label}</span>
									</div>
									<span class="text-textMain font-semibold text-xs">{dist.percent}%</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</section>

		<!-- Slowest Endpoints -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<div class="p-4 border-b border-[#1e293b] flex items-center justify-between">
				<div>
					<h3 class="text-sm font-semibold text-textMain">{t('performance_endpoints_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('performance_endpoints_subtitleMobile')}</p>
				</div>
				<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('performance_endpoints_badgeMobile')}</span>
			</div>
			<div class="divide-y divide-[#1e293b]/60">
				{#each slowEndpoints as ep (ep.id)}
					<div class="p-4">
						<div class="flex items-center gap-2 mb-2">
							<span class="px-1.5 py-0.5 {ep.methodClass} text-xs font-mono rounded font-semibold flex-shrink-0">{ep.method}</span>
							<p class="text-textMain text-xs font-mono truncate flex-1">{ep.path}</p>
							<span class="{ep.timeColor} font-bold text-sm flex-shrink-0">{ep.avgMs.toLocaleString()} ms</span>
						</div>
						<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden mb-1.5">
							<div class="h-full {ep.barColor} rounded-full" style="width:{ep.barWidth}"></div>
						</div>
						<p class="text-xs text-textSec">Calls: {ep.callCount} · Errors: {ep.errorRate}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Core Web Vitals -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<h3 class="text-sm font-semibold text-textMain mb-1">{t('performance_cwv_title')}</h3>
			<p class="text-xs text-textSec mb-4">{t('performance_cwv_subtitle')}</p>
			<div class="space-y-4">
				{#each coreWebVitals as vital (vital.key)}
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<div class="flex items-center gap-2">
								<span class="text-sm font-semibold text-textMain">{vital.label}</span>
								<span class="text-xs text-textSec">{vital.description}</span>
							</div>
							<span class="{vital.statusClass} font-bold text-sm">{vital.value}{vital.unit}</span>
						</div>
						<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full {vital.barClass} rounded-full" style="width:{vital.barWidth}"></div>
						</div>
						<div class="flex justify-between text-xs text-textSec mt-1">
							<span>{vital.threshold}</span>
							<span class="{vital.statusClass} font-medium">{vital.statusSymbol}</span>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Performance Event Log -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<div class="p-4 border-b border-[#1e293b]">
				<h3 class="text-sm font-semibold text-textMain">{t('performance_eventLog_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('performance_eventLog_subtitleMobile')}</p>
				<div class="flex gap-0 mt-3 rounded-lg overflow-hidden border border-[#334155]">
					<button
						onclick={() => (activeEventFilter = 'all')}
						class="flex-1 px-2 py-2 text-xs font-medium transition-colors {activeEventFilter === 'all' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-transparent text-textSec hover:bg-[#1e293b]'}"
					>{t('performance_filters_all')}</button>
					<button
						onclick={() => (activeEventFilter = 'critical')}
						class="flex-1 px-2 py-2 text-xs font-medium transition-colors {activeEventFilter === 'critical' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-transparent text-textSec hover:bg-[#1e293b]'}"
					>{t('performance_filters_critical')}</button>
					<button
						onclick={() => (activeEventFilter = 'warning')}
						class="flex-1 px-2 py-2 text-xs font-medium transition-colors {activeEventFilter === 'warning' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-transparent text-textSec hover:bg-[#1e293b]'}"
					>{t('performance_filters_warning')}</button>
					<button
						onclick={() => (activeEventFilter = 'info')}
						class="flex-1 px-2 py-2 text-xs font-medium transition-colors {activeEventFilter === 'info' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-transparent text-textSec hover:bg-[#1e293b]'}"
					>{t('performance_filters_info')}</button>
				</div>
			</div>
			<div class="divide-y divide-[#1e293b]/60">
				{#each performanceEvents.filter(e => activeEventFilter === 'all' || e.level === activeEventFilter) as evt (evt.id)}
					<div class="p-4">
						<div class="flex items-start justify-between gap-2 mb-2">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="px-2 py-0.5 {evt.levelClass} text-xs rounded font-medium">{t(evt.levelKey)}</span>
								<span class="text-textSec text-xs">{evt.type}</span>
							</div>
							<div class="flex items-center gap-2 flex-shrink-0">
								<span class="px-2 py-0.5 {evt.statusClass} text-xs rounded">{t(evt.statusKey)}</span>
								<span class="text-textSec font-mono text-xs">{evt.time.substring(0, 5)}</span>
							</div>
						</div>
						<p class="text-textMain text-xs leading-relaxed mb-1.5">{evt.message}</p>
						{#if evt.endpoint}
							<p class="text-textSec font-mono text-xs">{evt.endpoint}</p>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<div class="h-4"></div>
	</div>

	<!-- Bottom Navigation -->
	<nav class="fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-[#1e293b] px-2 py-2 flex items-center justify-around lg:hidden">
		<a href="{base}/" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-gauge-high text-base"></i>
			<span class="text-xs">{t('layout_nav_dashboard')}</span>
		</a>
		<a href="{base}/runtime" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-server text-base"></i>
			<span class="text-xs">{t('layout_nav_runtime')}</span>
		</a>
		<a href="{base}/performance" class="flex flex-col items-center gap-1 px-3 py-1.5 text-[#f59e0b] min-w-[44px]">
			<i class="fa-solid fa-bolt text-base"></i>
			<span class="text-xs font-semibold">{t('layout_nav_performance')}</span>
		</a>
		<a href="{base}/chyby" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-triangle-exclamation text-base"></i>
			<span class="text-xs">{t('layout_nav_errors')}</span>
		</a>
		<a href="{base}/nastaveni" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-gear text-base"></i>
			<span class="text-xs">{t('layout_nav_settings')}</span>
		</a>
	</nav>
</div>
