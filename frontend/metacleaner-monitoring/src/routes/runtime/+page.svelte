<script lang="ts">
	import { onMount } from 'svelte';
	import { chartColors } from '$lib/theme/chartColors';
	import { t } from '$lib/i18n';
	import { base } from '$app/paths';
	import {
		getRuntimeStats,
		getRuntimeSecondaryKpis,
		getMachineInstances,
		getDeployHistory,
		getRuntimeErrorLog,
		getRuntimeSummary,
		getRuntimeHttpStatusDistribution
	} from '$lib/repositories/runtimeRepository';

	const runtimeStats = getRuntimeStats();
	const secondaryKpis = getRuntimeSecondaryKpis();
	const machines = getMachineInstances();
	const deploys = getDeployHistory();
	const errorLog = getRuntimeErrorLog();
	const summary = getRuntimeSummary();
	const httpStatus = getRuntimeHttpStatusDistribution();

	let activeChart = $state<'cpu' | 'ram' | 'response' | 'network'>('cpu');
	let instancesOpen = $state(true);
	let deploysOpen = $state(false);
	let errorsOpen = $state(true);

	onMount(() => {
		const Plotly = (window as any).Plotly;
		if (!Plotly) return;

		const bgCard = chartColors.card;
		const textSec = chartColors.textSec;
		const errorColor = chartColors.error;
		const secondaryColor = chartColors.secondary;
		const purpleColor = chartColors.purpleLight;
		const blueColor = chartColors.blue;
		const greenColor = chartColors.greenMuted;
		const gridColor = 'rgba(30,41,59,0.8)';
		const chartConfig = { responsive: true, displayModeBar: false, displaylogo: false };

		const commonLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 10, r: 10, b: 40, l: 45 },
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
			margin: { t: 8, r: 8, b: 32, l: 38 },
			xaxis: { ...commonLayout.xaxis, tickfont: { color: textSec, size: 9 }, nticks: 6 },
			yaxis: { ...commonLayout.yaxis, tickfont: { color: textSec, size: 9 } }
		};

		const hours = ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];
		const avgCpu = [28, 24, 30, 38, 52, 64, 71, 74, 68, 62, 55, 48];
		const peakCpu = [45, 38, 51, 62, 78, 88, 91, 91, 84, 78, 70, 61];
		const ramData = [0.9, 0.85, 1.0, 1.1, 1.4, 1.7, 1.85, 1.8, 1.75, 1.65, 1.55, 1.4];
		const p50 = [88, 80, 95, 105, 112, 118, 122, 115, 108, 102, 96, 90];
		const p99 = [320, 290, 380, 440, 600, 780, 840, 790, 660, 540, 420, 360];
		const netIn  = [180, 150, 200, 260, 420, 680, 840, 900, 780, 650, 520, 380];
		const netOut = [320, 280, 360, 480, 780, 1200, 1560, 1620, 1380, 1100, 880, 620];
		const rpm = [280, 240, 310, 420, 740, 1120, 1480, 1640, 1390, 1180, 920, 660];

		const dataCpu = [
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				x: hours, y: peakCpu,
				line: { color: secondaryColor, width: 2, shape: 'spline', dash: 'dot' },
				fillcolor: 'rgba(249,115,22,0.06)',
				hovertemplate: '<b>%{x}</b><br>Peak: %{y}%<extra></extra>'
			},
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				x: hours, y: avgCpu,
				line: { color: purpleColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(167,139,250,0.10)',
				hovertemplate: '<b>%{x}</b><br>CPU: %{y}%<extra></extra>'
			}
		];

		const dataRam = [
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				x: hours, y: ramData,
				line: { color: blueColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(59,130,246,0.10)',
				hovertemplate: '<b>%{x}</b><br>RAM: %{y} GB<extra></extra>'
			},
			{
				type: 'scatter', mode: 'lines',
				x: hours, y: Array(hours.length).fill(4),
				line: { color: errorColor, width: 1.5, dash: 'dot' },
				hovertemplate: 'Limit: 4 GB<extra></extra>'
			}
		];

		const dataResponse = [
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				x: hours, y: p99,
				line: { color: secondaryColor, width: 2, shape: 'spline' },
				fillcolor: 'rgba(249,115,22,0.07)',
				hovertemplate: '<b>%{x}</b><br>P99: %{y}ms<extra></extra>'
			},
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				x: hours, y: p50,
				line: { color: greenColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(62,207,142,0.10)',
				hovertemplate: '<b>%{x}</b><br>P50: %{y}ms<extra></extra>'
			}
		];

		const dataNetwork = [
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				x: hours, y: netOut,
				line: { color: greenColor, width: 2, shape: 'spline' },
				fillcolor: 'rgba(62,207,142,0.08)',
				hovertemplate: '<b>%{x}</b><br>OUT: %{y} MB<extra></extra>'
			},
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				x: hours, y: netIn,
				line: { color: blueColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(59,130,246,0.10)',
				hovertemplate: '<b>%{x}</b><br>IN: %{y} MB<extra></extra>'
			}
		];

		const dataHttpPie = [
			{
				type: 'pie',
				labels: ['2xx OK', '3xx Redirect', '4xx Client Error', '5xx Server Error'],
				values: [94.2, 2.8, 2.1, 0.9],
				hole: 0.60,
				marker: {
					colors: [greenColor, blueColor, secondaryColor, errorColor],
					line: { color: bgCard, width: 2 }
				},
				textinfo: 'none',
				hovertemplate: '<b>%{label}</b><br>%{value}%<extra></extra>',
				direction: 'clockwise'
			}
		];

		const dataRpm = [
			{
				type: 'bar',
				x: hours,
				y: rpm,
				marker: {
					color: rpm.map(v => v > 1400 ? purpleColor : 'rgba(167,139,250,0.5)'),
					opacity: 0.9
				},
				hovertemplate: '<b>%{x}</b><br>%{y} req/min<extra></extra>'
			}
		];

		const cpuLayout = {
			...commonLayout,
			yaxis: { ...commonLayout.yaxis, title: { text: '%', font: { size: 10, color: textSec } }, range: [0, 100] }
		};

		const ramLayout = {
			...commonLayout,
			yaxis: { ...commonLayout.yaxis, title: { text: 'GB', font: { size: 10, color: textSec } }, range: [0, 4.5] }
		};

		const responseLayout = {
			...commonLayout,
			margin: { t: 10, r: 10, b: 35, l: 45 },
			yaxis: { ...commonLayout.yaxis, title: { text: 'ms', font: { size: 10, color: textSec } } }
		};

		const networkLayout = {
			...commonLayout,
			margin: { t: 10, r: 10, b: 35, l: 45 },
			yaxis: { ...commonLayout.yaxis, title: { text: 'MB', font: { size: 10, color: textSec } } }
		};

		const pieLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 5, r: 5, b: 5, l: 5 },
			showlegend: false,
			annotations: [{
				text: `<b style="font-size:18px;color:${chartColors.textMain}">94.2%</b><br><span style="font-size:10px;color:${chartColors.textSec}">2xx OK</span>`,
				x: 0.5, y: 0.5,
				xanchor: 'center', yanchor: 'middle',
				showarrow: false,
				font: { size: 13, color: chartColors.textMain }
			}]
		};

		// Desktop charts
		const elCpu = document.getElementById('chart-cpu');
		if (elCpu) Plotly.newPlot('chart-cpu', dataCpu, cpuLayout, chartConfig);

		const elRam = document.getElementById('chart-ram');
		if (elRam) Plotly.newPlot('chart-ram', dataRam, ramLayout, chartConfig);

		const elResponse = document.getElementById('chart-response');
		if (elResponse) Plotly.newPlot('chart-response', dataResponse, { ...responseLayout }, chartConfig);

		const elNetwork = document.getElementById('chart-network');
		if (elNetwork) Plotly.newPlot('chart-network', dataNetwork, { ...networkLayout }, chartConfig);

		const elHttpStatus = document.getElementById('chart-http-status');
		if (elHttpStatus) Plotly.newPlot('chart-http-status', dataHttpPie, pieLayout, chartConfig);

		const elRpm = document.getElementById('chart-rpm');
		if (elRpm) Plotly.newPlot('chart-rpm', dataRpm, {
			...commonLayout,
			bargap: 0.3,
			margin: { t: 10, r: 10, b: 40, l: 50 },
			yaxis: { ...commonLayout.yaxis, title: { text: 'req/min', font: { size: 10, color: textSec } } }
		}, chartConfig);

		// Mobile charts
		const elCpuM = document.getElementById('chart-cpu-m');
		if (elCpuM) Plotly.newPlot('chart-cpu-m', dataCpu, { ...mobileLayout, yaxis: { ...mobileLayout.yaxis, range: [0, 100] } }, chartConfig);

		const elRamM = document.getElementById('chart-ram-m');
		if (elRamM) Plotly.newPlot('chart-ram-m', dataRam, { ...mobileLayout, yaxis: { ...mobileLayout.yaxis, range: [0, 4.5] } }, chartConfig);

		const elResponseM = document.getElementById('chart-response-m');
		if (elResponseM) Plotly.newPlot('chart-response-m', dataResponse, mobileLayout, chartConfig);

		const elNetworkM = document.getElementById('chart-network-m');
		if (elNetworkM) Plotly.newPlot('chart-network-m', dataNetwork, mobileLayout, chartConfig);

		const elHttpStatusM = document.getElementById('chart-http-status-m');
		if (elHttpStatusM) Plotly.newPlot('chart-http-status-m', dataHttpPie, {
			...pieLayout,
			margin: { t: 4, r: 4, b: 4, l: 4 },
			annotations: [{
				text: `<b style="font-size:14px;color:${chartColors.textMain}">94.2%</b>`,
				x: 0.5, y: 0.5, xanchor: 'center', yanchor: 'middle',
				showarrow: false, font: { size: 11, color: chartColors.textMain }
			}]
		}, chartConfig);

		const elRpmM = document.getElementById('chart-rpm-m');
		if (elRpmM) Plotly.newPlot('chart-rpm-m', dataRpm, {
			...mobileLayout,
			bargap: 0.35
		}, chartConfig);

		const handleResize = () => {
			['chart-cpu','chart-ram','chart-response','chart-network','chart-http-status','chart-rpm',
			 'chart-cpu-m','chart-ram-m','chart-response-m','chart-network-m','chart-http-status-m','chart-rpm-m'].forEach(id => {
				const el = document.getElementById(id);
				if (el) Plotly.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	function switchChart(tab: 'cpu' | 'ram' | 'response' | 'network') {
		activeChart = tab;
		// resize after tab switch
		setTimeout(() => {
			const Plotly = (window as any).Plotly;
			if (!Plotly) return;
			const el = document.getElementById(`chart-${tab}-m`);
			if (el) Plotly.Plots.resize(el);
		}, 50);
	}
</script>

<!-- ===== DESKTOP LAYOUT ===== -->
<div class="hidden lg:block">
	<header class="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-surface px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<div class="w-9 h-9 rounded-lg bg-purple-light/15 border border-purple-light/30 flex items-center justify-center">
				<i class="fa-solid fa-microchip text-purple-light text-sm"></i>
			</div>
			<div>
				<h1 class="text-2xl font-bold text-textMain">{t('layout_nav_runtime')}</h1>
				<p class="text-sm text-textSec mt-0.5">{t('runtime_header_subtitle')}</p>
			</div>
		</div>
		<div class="flex items-center gap-3 flex-wrap">
			<div class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium">
				<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
				{summary.statusBadge}
			</div>
			<select class="bg-surface border border-border text-sm text-textMain rounded-lg px-3 py-2 focus:outline-none">
				<option>{t('common_timeRange_last24h')}</option>
				<option>{t('common_timeRange_last7d')}</option>
				<option>{t('common_timeRange_last30d')}</option>
			</select>
			<button class="px-4 py-2 bg-surface hover:bg-surface-hover text-white rounded-lg text-sm font-medium transition-colors border border-border">
				<i class="fa-solid fa-download mr-2"></i>{t('common_actions_export')}
			</button>
		</div>
	</header>

	<div class="p-6 max-w-7xl mx-auto space-y-6">

		<!-- KPI Stats Row 1 -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each runtimeStats as stat (stat.key)}
				<div class="bg-card border border-surface rounded-xl p-5">
					<div class="flex justify-between items-start mb-3">
						<h3 class="text-textSec text-sm font-medium">{t(stat.labelKey)}</h3>
						{#if stat.badgeKey}
							<span class="px-2 py-0.5 {stat.badgeClass} text-xs rounded-full font-medium">{t(stat.badgeKey)}</span>
						{/if}
					</div>
					<div class="flex items-end gap-2 {stat.barWidth ? 'mb-3' : ''}">
						<span class="text-3xl font-bold {stat.valueClass ?? 'text-textMain'}">{stat.value}</span>
						{#if stat.unit}
							<span class="text-sm text-textSec mb-1">{stat.unit}</span>
						{/if}
						{#if stat.trend}
							<span class="text-sm {stat.trendClass ?? 'text-secondary'} mb-1 flex items-center gap-1 ml-1">
								<i class="fa-solid {stat.trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs"></i>{stat.trend}
							</span>
						{/if}
					</div>
					{#if stat.barWidth}
						<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden">
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
				<div class="bg-card border border-surface rounded-xl p-5">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-8 h-8 rounded-lg {kpi.iconClass} flex items-center justify-center">
							<i class="fa-solid {kpi.icon} text-xs"></i>
						</div>
						<h3 class="text-textSec text-sm font-medium">{t(kpi.labelKey)}</h3>
					</div>
					<div class="text-2xl font-bold text-textMain">{kpi.value}{#if kpi.unit} <span class="text-sm font-normal text-textSec">{kpi.unit}</span>{/if}</div>
					<p class="text-xs text-textSec mt-1">{kpi.subtext}</p>
				</div>
			{/each}
		</section>

		<!-- Charts Row: CPU + RAM -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_cpuOverTime')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('runtime_charts_cpuSubtitle')}</p>
					</div>
					<div class="flex gap-2">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-purple-light inline-block"></span>CPU %</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-secondary inline-block"></span>Peak</span>
					</div>
				</div>
				<div id="chart-cpu" class="h-[220px] w-full"></div>
			</div>
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_ramOverTime')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('runtime_charts_ramSubtitle')}</p>
					</div>
					<div class="flex items-center gap-1.5 px-2 py-1 bg-blue/10 border border-blue/20 rounded text-xs text-blue">
						<i class="fa-solid fa-memory text-xs"></i>
						{t('runtime_charts_ramLimit')}
					</div>
				</div>
				<div id="chart-ram" class="h-[220px] w-full"></div>
			</div>
		</section>

		<!-- Instances + Response Time / Network -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Instances -->
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-center mb-5">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('runtime_instances_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('runtime_instances_flyioInfo')}</p>
					</div>
					<button class="flex items-center gap-2 px-3 py-1.5 bg-purple-light/10 border border-purple-light/20 rounded-lg text-purple-light text-xs font-medium hover:bg-purple-light/20 transition-colors">
						<i class="fa-solid fa-plus text-xs"></i>{t('runtime_instances_scale')}
					</button>
				</div>
				<div class="space-y-3">
					{#each machines as m (m.id)}
						<div class="p-4 rounded-xl bg-surface/40 border border-border/40">
							<div class="flex items-center justify-between mb-3">
								<div class="flex items-center gap-3">
									<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
									<span class="text-textMain font-medium text-sm font-mono">{m.name} · {m.displayId}</span>
									<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">{m.status}</span>
								</div>
								<span class="text-xs text-textSec">shared-cpu-2x · {m.ramTotalDisplay} GB RAM</span>
							</div>
							<div class="grid grid-cols-3 gap-3">
								<div>
									<div class="text-xs text-textSec mb-1">CPU</div>
									<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
										<div class="h-full {m.cpuClass} rounded-full" style="width:{m.cpuPercent}%"></div>
									</div>
									<div class="text-xs {m.cpuWarning ? 'text-secondary' : 'text-textMain'} mt-1">{m.cpuDisplay}</div>
								</div>
								<div>
									<div class="text-xs text-textSec mb-1">RAM</div>
									<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
										<div class="h-full bg-blue rounded-full" style="width:{m.ramBarWidth}"></div>
									</div>
									<div class="text-xs text-textMain mt-1">{m.ramDisplay}</div>
								</div>
								<div>
									<div class="text-xs text-textSec mb-1">{t('common_labels_uptime')}</div>
									<div class="text-xs text-textMain mt-1 font-mono">{m.uptime}</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Response Time + Network stacked -->
			<div class="flex flex-col gap-6">
				<div class="bg-card border border-surface rounded-xl p-5">
					<div class="flex justify-between items-center mb-4">
						<div>
							<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_responseTime')}</h3>
							<p class="text-xs text-textSec mt-0.5">{t('runtime_charts_responseSubtitle')}</p>
						</div>
						<div class="flex gap-2">
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-green-muted inline-block"></span>P50</span>
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-secondary inline-block"></span>P99</span>
						</div>
					</div>
					<div id="chart-response" class="h-[160px] w-full"></div>
				</div>
				<div class="bg-card border border-surface rounded-xl p-5">
					<div class="flex justify-between items-center mb-4">
						<div>
							<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_networkTraffic')}</h3>
							<p class="text-xs text-textSec mt-0.5">{t('runtime_charts_networkSubtitle')}</p>
						</div>
						<div class="flex gap-2">
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-blue inline-block"></span>IN</span>
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-green-muted inline-block"></span>OUT</span>
						</div>
					</div>
					<div id="chart-network" class="h-[160px] w-full"></div>
				</div>
			</div>
		</section>

		<!-- Deploy History + Error Log -->
		<section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Deploy History -->
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('runtime_deploys_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('runtime_deploys_subtitle')}</p>
					</div>
					<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('runtime_deploys_badge')}</span>
				</div>
				<div class="space-y-3">
					{#each deploys as d (d.id)}
						<div class="flex items-start gap-3">
							<div class="mt-1 w-7 h-7 rounded-lg {d.iconClass} flex items-center justify-center flex-shrink-0">
								<i class="fa-solid {d.icon} {d.status === 'failed' ? 'text-error' : d.status === 'success' ? 'text-success' : 'text-secondary'} text-xs"></i>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between">
									<span class="text-textMain text-sm font-semibold">{d.version}</span>
									<span class="text-xs text-textSec">{d.timestamp}</span>
								</div>
								<p class="text-xs {d.status === 'failed' ? 'text-error' : 'text-textSec'} mt-0.5 truncate">{d.commitMessage}</p>
								<p class="text-xs text-textSec mt-0.5">{d.subtext}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Runtime Error Log -->
			<div class="bg-card border border-surface rounded-xl p-5 lg:col-span-2">
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('runtime_errorLog_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('runtime_errorLog_subtitle')}</p>
					</div>
					<div class="flex gap-3 flex-wrap">
						<div class="flex rounded-lg overflow-hidden border border-border">
							<button class="px-3 py-1.5 bg-error/20 text-error text-xs font-medium">{t('runtime_filters_all')}</button>
							<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface">OOM</button>
							<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface">Crash</button>
							<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface">Health</button>
						</div>
						<div class="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5">
							<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
							<input type="text" placeholder="{t('runtime_errorLog_searchPlaceholder')}" class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-28" />
						</div>
					</div>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-surface">
								<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_time')}</th>
								<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('runtime_table_instance')}</th>
								<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_type')}</th>
								<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_message')}</th>
								<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3">{t('common_table_status')}</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-surface/60">
							{#each errorLog as entry (entry.id)}
								<tr class="hover:bg-surface/30 transition-colors">
									<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">{entry.time}</td>
									<td class="py-3 pr-4 text-textSec font-mono text-xs">{entry.machine}</td>
									<td class="py-3 pr-4"><span class="px-2 py-0.5 {entry.levelClass} text-xs rounded font-medium">{entry.level}</span></td>
									<td class="py-3 pr-4 text-textMain max-w-xs truncate text-xs">{entry.message}</td>
									<td class="py-3"><span class="px-2 py-0.5 {entry.statusClass} text-xs rounded">{t(entry.statusKey)}</span></td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</section>

		<!-- HTTP Status + RPM -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_httpStatus')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('runtime_charts_httpStatusSubtitle')}</p>
					</div>
				</div>
				<div id="chart-http-status" class="h-[200px] w-full"></div>
				<div class="mt-4 grid grid-cols-2 gap-3">
					{#each httpStatus as item}
						<div class="flex items-center justify-between text-sm">
							<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full {item.color} inline-block"></span><span class="text-textSec">{item.label}</span></div>
							<span class="text-textMain font-medium">{item.percent}%</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_rpm')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('runtime_charts_rpmSubtitle')}</p>
					</div>
					<div class="flex gap-2">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-purple-light inline-block"></span>rpm</span>
					</div>
				</div>
				<div id="chart-rpm" class="h-[240px] w-full"></div>
			</div>
		</section>

	</div>
</div>

<!-- ===== MOBILE LAYOUT ===== -->
<div class="lg:hidden pb-20">

	<!-- Title row -->
	<div class="px-4 pt-3 pb-2">
		<div class="flex items-center gap-2.5">
			<div class="w-7 h-7 rounded-md bg-purple-light/15 border border-purple-light/30 flex items-center justify-center">
				<i class="fa-solid fa-microchip text-purple-light text-xs"></i>
			</div>
			<div>
				<h1 class="text-sm font-bold text-textMain leading-tight">{t('layout_nav_runtime')}</h1>
				<p class="text-xs text-textSec">{t('runtime_header_subtitleMobile')}</p>
			</div>
		</div>
	</div>

	<!-- Online status -->
	<div class="px-4 pb-3">
		<div class="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/20 rounded-lg text-success text-xs font-medium w-fit">
			<div class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
			{summary.statusBadge}
		</div>
	</div>

	<!-- Time range + region selector -->
	<div class="px-4 pb-4">
		<div class="flex items-center gap-2">
			<select class="flex-1 bg-card border border-border text-sm text-textMain rounded-xl px-4 py-3 focus:outline-none">
				<option>{t('common_timeRange_last24h')}</option>
				<option>{t('common_timeRange_last7d')}</option>
				<option>{t('common_timeRange_last30d')}</option>
			</select>
			<div class="flex items-center gap-1.5 px-3 py-3 bg-card border border-surface rounded-xl text-textSec text-xs">
				<i class="fa-solid fa-server text-xs"></i>
				<span>fra</span>
			</div>
		</div>
	</div>

	<div class="px-4 space-y-4">

		<!-- KPI Primary Stats 2×2 -->
		<section class="grid grid-cols-2 gap-3">
			{#each runtimeStats as stat (stat.key)}
				<div class="bg-card border border-surface rounded-xl p-4">
					<div class="flex items-start justify-between mb-2">
						<p class="text-textSec text-xs font-medium">{t(stat.labelKey)}</p>
						{#if stat.badgeKey}
							<span class="px-1.5 py-0.5 {stat.badgeClass} text-[10px] rounded-full font-medium">
								{#if stat.key === 'cpuUsage'}⚠{:else if stat.key === 'restarts24h'}!{:else}{t(stat.badgeKey)}{/if}
							</span>
						{/if}
					</div>
					<div class="flex items-end gap-1 {stat.barWidth ? 'mb-2' : ''}">
						<span class="text-2xl font-bold {stat.valueClass ?? 'text-textMain'}">{stat.value}</span>
						{#if stat.unit}
							<span class="text-xs text-textSec mb-0.5">{stat.key === 'ramUsage' ? 'GB' : stat.unit}</span>
						{/if}
						{#if stat.trend}
							<span class="text-xs {stat.trendClass ?? 'text-secondary'} mb-0.5 {stat.unit ? '' : 'ml-1'}">
								<i class="fa-solid {stat.trendUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs"></i>{stat.trend}
							</span>
						{/if}
					</div>
					{#if stat.barWidth}
						<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden mb-1">
							<div class="h-full {stat.barClass} rounded-full" style="width:{stat.barWidth}"></div>
						</div>
					{/if}
					<p class="text-[10px] text-textSec {!stat.barWidth ? 'mt-1' : ''}">{stat.key === 'cpuUsage' ? 'Peak: 91%' : stat.key === 'ramUsage' ? '45% / 4 GB' : stat.key === 'uptime30d' ? 'Výpadek: 8 min' : 'OOM:2 · Crash:3'}</p>
				</div>
			{/each}
		</section>

		<!-- KPI Secondary 2×2 -->
		<section class="grid grid-cols-2 gap-3">
			{#each secondaryKpis as kpi (kpi.key)}
				<div class="bg-card border border-surface rounded-xl p-4">
					<div class="flex items-center gap-2 mb-2">
						<div class="w-7 h-7 rounded-lg {kpi.iconClass} flex items-center justify-center flex-shrink-0">
							<i class="fa-solid {kpi.icon} text-xs"></i>
						</div>
						<p class="text-textSec text-xs font-medium">{t(kpi.labelKey)}</p>
					</div>
					<div class="text-2xl font-bold text-textMain">{kpi.value}{#if kpi.unit} <span class="text-sm font-normal text-textSec">{kpi.key === 'activeInstances' ? '/ 5' : kpi.unit}</span>{/if}</div>
					<p class="text-[10px] text-textSec mt-1">{kpi.key === 'activeInstances' ? 'Autoscale: OFF' : kpi.key === 'networkTraffic' ? 'IN:840 · OUT:1.56GB' : kpi.key === 'avgResponseTime' ? 'P99: 840ms' : 'Dnes 11:04 · 38s'}</p>
				</div>
			{/each}
		</section>

		<!-- Charts Tabs -->
		<section class="bg-card border border-surface rounded-xl p-4">
			<div class="flex items-center gap-1 mb-4 bg-[#0a1628] rounded-lg p-1">
				<button
					onclick={() => switchChart('cpu')}
					class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'cpu' ? 'bg-surface text-white' : 'text-textSec'}"
				>CPU</button>
				<button
					onclick={() => switchChart('ram')}
					class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'ram' ? 'bg-surface text-white' : 'text-textSec'}"
				>RAM</button>
				<button
					onclick={() => switchChart('response')}
					class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'response' ? 'bg-surface text-white' : 'text-textSec'}"
				>Response</button>
				<button
					onclick={() => switchChart('network')}
					class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'network' ? 'bg-surface text-white' : 'text-textSec'}"
				>Network</button>
			</div>

				<!-- CPU panel -->
			<div class="{activeChart === 'cpu' ? '' : 'hidden'}">
				<div class="flex items-center justify-between mb-3">
					<div>
						<p class="text-sm font-semibold text-textMain">{t('runtime_charts_cpuOverTime')}</p>
						<p class="text-xs text-textSec">{t('runtime_charts_cpuSubtitle')}</p>
					</div>
					<div class="flex gap-1.5">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-purple-light inline-block"></span>CPU</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>Peak</span>
					</div>
				</div>
				<div id="chart-cpu-m" class="h-[200px] w-full"></div>
			</div>
			<!-- RAM panel -->
			<div class="{activeChart === 'ram' ? '' : 'hidden'}">
				<div class="flex items-center justify-between mb-3">
					<div>
						<p class="text-sm font-semibold text-textMain">{t('runtime_charts_ramOverTime')}</p>
						<p class="text-xs text-textSec">{t('runtime_charts_ramSubtitle')}</p>
					</div>
					<div class="flex items-center gap-1 px-2 py-1 bg-blue/10 border border-blue/20 rounded text-xs text-blue">
						<i class="fa-solid fa-memory text-xs"></i>{t('runtime_charts_ramLimit')}
					</div>
				</div>
				<div id="chart-ram-m" class="h-[200px] w-full"></div>
			</div>
			<!-- Response panel -->
			<div class="{activeChart === 'response' ? '' : 'hidden'}">
				<div class="flex items-center justify-between mb-3">
					<div>
						<p class="text-sm font-semibold text-textMain">{t('runtime_charts_responseTime')}</p>
						<p class="text-xs text-textSec">{t('runtime_charts_responseSubtitle')}</p>
					</div>
					<div class="flex gap-1.5">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-muted inline-block"></span>P50</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>P99</span>
					</div>
				</div>
				<div id="chart-response-m" class="h-[200px] w-full"></div>
			</div>
			<!-- Network panel -->
			<div class="{activeChart === 'network' ? '' : 'hidden'}">
				<div class="flex items-center justify-between mb-3">
					<div>
						<p class="text-sm font-semibold text-textMain">{t('runtime_charts_networkTraffic')}</p>
						<p class="text-xs text-textSec">{t('runtime_charts_networkSubtitle')}</p>
					</div>
					<div class="flex gap-1.5">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-blue inline-block"></span>IN</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-muted inline-block"></span>OUT</span>
					</div>
				</div>
				<div id="chart-network-m" class="h-[200px] w-full"></div>
			</div>
		</section>

		<!-- HTTP Status + RPM side by side -->
		<section class="grid grid-cols-2 gap-3">
			<div class="bg-card border border-surface rounded-xl p-4">
				<p class="text-sm font-semibold text-textMain mb-1">{t('runtime_charts_httpStatusMobile')}</p>
				<p class="text-xs text-textSec mb-3">{t('runtime_charts_httpStatusSubtitleMobile')}</p>
				<div id="chart-http-status-m" class="h-[150px] w-full"></div>
				<div class="mt-3 space-y-1.5">
					{#each httpStatus as item}
						<div class="flex items-center justify-between text-xs">
							<div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full {item.color} inline-block"></span><span class="text-textSec">{item.label.slice(0, 3)}</span></div>
							<span class="text-textMain font-medium">{item.percent}%</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="bg-card border border-surface rounded-xl p-4">
				<p class="text-sm font-semibold text-textMain mb-1">{t('runtime_charts_rpmMobile')}</p>
				<p class="text-xs text-textSec mb-3">{t('runtime_charts_rpmSubtitleMobile')}</p>
				<div id="chart-rpm-m" class="h-[150px] w-full"></div>
				<div class="mt-3 p-2 bg-surface/50 rounded-lg text-center">
					<p class="text-xs text-textSec">{t('runtime_charts_rpmPeak')}</p>
					<p class="text-base font-bold text-purple-light">1,640</p>
					<p class="text-xs text-textSec">req/min</p>
				</div>
			</div>
		</section>

		<!-- Instances Accordion -->
		<section class="bg-card border border-surface rounded-xl overflow-hidden">
			<button
				onclick={() => (instancesOpen = !instancesOpen)}
				class="w-full flex items-center justify-between p-4 text-left"
			>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-purple-light/15 flex items-center justify-center">
						<i class="fa-solid fa-microchip text-purple-light text-xs"></i>
					</div>
					<div>
						<p class="text-sm font-semibold text-textMain">{t('runtime_instances_titleMobile')}</p>
						<p class="text-[10px] text-textSec">{t('runtime_instances_subtitleMobile')}</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">{summary.machinesOnline}/{summary.machinesTotal}</span>
					<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {instancesOpen ? 'rotate-180' : ''}"></i>
				</div>
			</button>
			{#if instancesOpen}
				<div class="px-4 pb-4 space-y-3">
					<div class="flex justify-end">
						<button class="flex items-center gap-2 px-3 py-2 bg-purple-light/10 border border-purple-light/20 rounded-lg text-purple-light text-xs font-medium">
							<i class="fa-solid fa-plus text-xs"></i>{t('runtime_instances_scale')}
						</button>
					</div>
					{#each machines as m (m.id)}
						<div class="p-4 rounded-xl bg-surface/40 border {m.cpuWarning ? 'border-secondary/20' : 'border-border/40'}">
							<div class="flex items-center justify-between mb-3">
								<div class="flex items-center gap-2">
									<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
									<span class="text-textMain font-medium text-xs font-mono">{m.name} · {m.displayId}</span>
								</div>
								<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">{m.status}</span>
							</div>
							<p class="text-xs text-textSec mb-3">shared-cpu-2x · {m.ramTotalDisplay} GB RAM</p>
							<div class="grid grid-cols-3 gap-3">
								<div>
									<div class="text-xs text-textSec mb-1">CPU</div>
									<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
										<div class="h-full {m.cpuClass} rounded-full" style="width:{m.cpuPercent}%"></div>
									</div>
									<div class="text-xs {m.cpuWarning ? 'text-secondary' : 'text-textMain'} mt-1">{m.cpuDisplay}</div>
								</div>
								<div>
									<div class="text-xs text-textSec mb-1">RAM</div>
									<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
										<div class="h-full bg-blue rounded-full" style="width:{m.ramBarWidth}"></div>
									</div>
									<div class="text-xs text-textMain mt-1">{m.ramDisplay}</div>
								</div>
								<div>
									<div class="text-xs text-textSec mb-1">{t('common_labels_uptime')}</div>
									<div class="text-xs text-textMain mt-1 font-mono">{m.uptime}</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Deploy History Accordion -->
		<section class="bg-card border border-surface rounded-xl overflow-hidden">
			<button
				onclick={() => (deploysOpen = !deploysOpen)}
				class="w-full flex items-center justify-between p-4 text-left"
			>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center">
						<i class="fa-solid fa-rocket text-secondary text-xs"></i>
					</div>
					<div>
						<p class="text-sm font-semibold text-textMain">{t('runtime_deploys_title')}</p>
						<p class="text-[10px] text-textSec">{t('runtime_deploys_subtitle')}</p>
					</div>
				</div>
				<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {deploysOpen ? 'rotate-180' : ''}"></i>
			</button>
			{#if deploysOpen}
				<div class="px-4 pb-4 space-y-3">
					{#each deploys as d, i (d.id)}
						<div class="flex items-start gap-3 py-2 {i < deploys.length - 1 ? 'border-b border-surface/60' : ''}">
							<div class="mt-0.5 w-7 h-7 rounded-lg {d.iconClass} flex items-center justify-center flex-shrink-0">
								<i class="fa-solid {d.icon} {d.status === 'failed' ? 'text-error' : d.status === 'success' ? 'text-success' : 'text-secondary'} text-xs"></i>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between">
									<span class="text-textMain text-sm font-semibold">{d.version}</span>
									<span class="text-xs text-textSec">{d.timestamp}</span>
								</div>
								<p class="text-xs {d.status === 'failed' ? 'text-error' : 'text-textSec'} mt-0.5 truncate">{d.commitMessage}</p>
								<p class="text-xs text-textSec mt-0.5">{d.subtext}</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Error Log Accordion -->
		<section class="bg-card border border-surface rounded-xl overflow-hidden">
			<button
				onclick={() => (errorsOpen = !errorsOpen)}
				class="w-full flex items-center justify-between p-4 text-left"
			>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-error/15 flex items-center justify-center">
						<i class="fa-solid fa-triangle-exclamation text-error text-xs"></i>
					</div>
					<div>
						<p class="text-sm font-semibold text-textMain">{t('runtime_errorLog_title')}</p>
						<p class="text-[10px] text-textSec">{t('runtime_errorLog_subtitleMobile')}</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded-full font-bold">{errorLog.length}</span>
					<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {errorsOpen ? 'rotate-180' : ''}"></i>
				</div>
			</button>
			{#if errorsOpen}
				<div class="px-4 pb-4">
					<div class="flex gap-2 mb-4">
						<div class="flex rounded-lg overflow-hidden border border-border flex-1">
							<button class="flex-1 py-2 bg-error/20 text-error text-xs font-medium">{t('common_status_all')}</button>
							<button class="flex-1 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-surface">OOM</button>
							<button class="flex-1 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-surface">Crash</button>
							<button class="flex-1 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-surface">Health</button>
						</div>
					</div>
					<div class="space-y-2">
						{#each errorLog as entry (entry.id)}
							<div class="p-3 rounded-xl bg-surface/40 border {entry.borderClass}">
								<div class="flex items-center justify-between mb-1.5">
									<div class="flex items-center gap-2">
										<span class="px-1.5 py-0.5 {entry.levelClass} text-xs rounded font-medium">{entry.level}</span>
										<span class="text-xs text-textSec font-mono">{entry.machine}</span>
									</div>
									<span class="text-xs text-textSec font-mono">{entry.time}</span>
								</div>
								<p class="text-xs text-textMain">{entry.message}</p>
								<div class="mt-1.5">
									<span class="px-1.5 py-0.5 {entry.statusClass} text-xs rounded">{t(entry.statusKey)}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</section>

	</div>

	<!-- Bottom Navigation -->
	<nav class="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-surface flex items-center justify-around px-2 py-2">
		<a href="{base}/" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-white transition-colors min-w-[44px]">
			<i class="fa-solid fa-gauge-high text-base"></i>
			<span class="text-[9px] font-medium">{t('layout_nav_dashboard')}</span>
		</a>
		<a href="{base}/dostupnost" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-white transition-colors min-w-[44px]">
			<i class="fa-solid fa-server text-base"></i>
			<span class="text-[9px] font-medium">{t('layout_nav_availability')}</span>
		</a>
		<a href="{base}/runtime" class="flex flex-col items-center gap-1 px-3 py-2 text-purple-light min-w-[44px]">
			<i class="fa-solid fa-microchip text-base"></i>
			<span class="text-[9px] font-semibold">Runtime</span>
		</a>
		<a href="{base}/performance" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-white transition-colors min-w-[44px]">
			<i class="fa-solid fa-bolt text-base"></i>
			<span class="text-[9px] font-medium">Perf.</span>
		</a>
		<a href="{base}/nastaveni" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-white transition-colors min-w-[44px]">
			<i class="fa-solid fa-gear text-base"></i>
			<span class="text-[9px] font-medium">{t('layout_nav_settings')}</span>
		</a>
	</nav>

</div>
