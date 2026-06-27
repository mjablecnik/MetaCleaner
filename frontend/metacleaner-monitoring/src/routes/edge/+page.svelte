<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { base } from '$app/paths';

	let activeChart = $state<'requests' | 'bandwidth' | 'http'>('requests');
	let wafLogOpen = $state(true);
	let cacheRulesOpen = $state(false);
	let ttfbOpen = $state(true);

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
		const cfOrange = '#f6821f';
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
		const hoursShort = ['00','02','04','06','08','10','12','14','16','18','20','22'];

		const cacheHit = [820,680,940,1120,1800,2200,2050,2400,2100,1760,1440,1100];
		const cacheMiss = [180,140,210,280,420,480,430,520,440,380,310,240];
		const bw = [48,38,62,82,148,192,168,210,185,158,124,88];

		const dataRequests = [
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				name: 'Cache HIT',
				x: hours, y: cacheHit,
				line: { color: greenColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(62,207,142,0.10)',
				hovertemplate: '<b>%{x}</b><br>Cache HIT: %{y}k req<extra></extra>'
			},
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				name: 'Cache MISS',
				x: hours, y: cacheMiss,
				line: { color: cfOrange, width: 2, shape: 'spline' },
				fillcolor: 'rgba(246,130,31,0.10)',
				hovertemplate: '<b>%{x}</b><br>Cache MISS: %{y}k req<extra></extra>'
			}
		];

		const dataBandwidth = [
			{
				type: 'bar',
				x: hours, y: bw,
				marker: {
					color: bw.map((v: number) => v > 180 ? cfOrange : blueColor),
					opacity: 0.85
				},
				hovertemplate: '<b>%{x}</b><br>%{y} GB/h<extra></extra>'
			}
		];

		const dataThreatPie = [
			{
				type: 'pie',
				labels: ['DDoS', 'Bad Bots', 'WAF Block', 'IP Block'],
				values: [54, 28, 13, 5],
				hole: 0.60,
				marker: {
					colors: [errorColor, secondaryColor, purpleColor, blueColor],
					line: { color: bgCard, width: 2 }
				},
				textinfo: 'none',
				hovertemplate: '<b>%{label}</b><br>%{value}%<extra></extra>',
				direction: 'clockwise'
			}
		];

		const pieCenterAnnotation = {
			text: '<b style="font-size:18px;color:#fff">1,247</b><br><span style="font-size:10px;color:#94a3b8">Hrozeb</span>',
			x: 0.5, y: 0.5,
			xanchor: 'center', yanchor: 'middle',
			showarrow: false,
			font: { size: 13, color: '#ffffff' }
		};

		const regions = ['EU West','US East','US West','Middle East','Asia Pac.','S. America'];
		const ttfbVals = [38, 61, 78, 98, 114, 152];
		const ttfbColors = ttfbVals.map((v: number) => v < 80 ? greenColor : v < 120 ? secondaryColor : errorColor);

		const dataHttpStatus = [
			{ type: 'bar', name: '2xx', x: hoursShort, y: [960,940,975,950,948,952,960,945,970,958,965,972], marker: { color: greenColor, opacity: 0.85 }, hovertemplate: '<b>%{x}:00</b><br>2xx: %{y}‰<extra></extra>' },
			{ type: 'bar', name: '3xx', x: hoursShort, y: [22,28,14,26,28,24,20,30,18,24,20,18], marker: { color: blueColor, opacity: 0.85 }, hovertemplate: '<b>%{x}:00</b><br>3xx: %{y}‰<extra></extra>' },
			{ type: 'bar', name: '4xx', x: hoursShort, y: [12,20,8,16,16,14,14,16,8,12,10,8], marker: { color: secondaryColor, opacity: 0.85 }, hovertemplate: '<b>%{x}:00</b><br>4xx: %{y}‰<extra></extra>' },
			{ type: 'bar', name: '5xx', x: hoursShort, y: [6,12,3,8,8,10,6,9,4,6,5,2], marker: { color: errorColor, opacity: 0.85 }, hovertemplate: '<b>%{x}:00</b><br>5xx: %{y}‰<extra></extra>' }
		];

		const requestsLayout = {
			...commonLayout,
			yaxis: { ...commonLayout.yaxis, title: { text: 'req/tis.', font: { size: 10, color: textSec } } }
		};
		const bandwidthLayout = {
			...commonLayout,
			bargap: 0.3,
			yaxis: { ...commonLayout.yaxis, title: { text: 'GB/h', font: { size: 10, color: textSec } } }
		};
		const pieLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 5, r: 5, b: 5, l: 5 },
			showlegend: false,
			annotations: [pieCenterAnnotation]
		};
		const ttfbLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 10 },
			margin: { t: 5, r: 10, b: 35, l: 40 },
			showlegend: false,
			bargap: 0.35,
			xaxis: { gridcolor: gridColor, linecolor: gridColor, tickcolor: 'transparent', tickfont: { color: textSec, size: 9 }, zeroline: false },
			yaxis: { gridcolor: gridColor, linecolor: gridColor, tickcolor: 'transparent', tickfont: { color: textSec, size: 9 }, zeroline: false, title: { text: 'ms', font: { size: 9, color: textSec } } }
		};
		const httpLayout = {
			...commonLayout,
			barmode: 'stack',
			bargap: 0.3,
			showlegend: false,
			yaxis: { ...commonLayout.yaxis, title: { text: '‰ req', font: { size: 10, color: textSec } } }
		};

		// Desktop charts
		const elRequests = document.getElementById('chart-requests');
		if (elRequests) Plotly.newPlot('chart-requests', dataRequests, requestsLayout, chartConfig);

		const elBandwidth = document.getElementById('chart-bandwidth');
		if (elBandwidth) Plotly.newPlot('chart-bandwidth', dataBandwidth, bandwidthLayout, chartConfig);

		const elThreatPie = document.getElementById('chart-threat-pie');
		if (elThreatPie) Plotly.newPlot('chart-threat-pie', dataThreatPie, pieLayout, chartConfig);

		const elTtfb = document.getElementById('chart-ttfb-region');
		if (elTtfb) Plotly.newPlot('chart-ttfb-region', [{ type: 'bar', x: regions, y: ttfbVals, marker: { color: ttfbColors, opacity: 0.85 }, hovertemplate: '<b>%{x}</b><br>TTFB: %{y}ms<extra></extra>' }], ttfbLayout, chartConfig);

		const elHttp = document.getElementById('chart-http-status');
		if (elHttp) Plotly.newPlot('chart-http-status', dataHttpStatus, httpLayout, chartConfig);

		// Mobile charts
		const elRequestsM = document.getElementById('chart-requests-m');
		if (elRequestsM) Plotly.newPlot('chart-requests-m', dataRequests, { ...mobileLayout, yaxis: { ...mobileLayout.yaxis, title: { text: 'req/tis.', font: { size: 9, color: textSec } } } }, chartConfig);

		const elBandwidthM = document.getElementById('chart-bandwidth-m');
		if (elBandwidthM) Plotly.newPlot('chart-bandwidth-m', dataBandwidth, { ...mobileLayout, bargap: 0.3 }, chartConfig);

		const elHttpM = document.getElementById('chart-http-status-m');
		if (elHttpM) Plotly.newPlot('chart-http-status-m', dataHttpStatus, { ...mobileLayout, barmode: 'stack', bargap: 0.3 }, chartConfig);

		const elThreatPieM = document.getElementById('chart-threat-pie-m');
		if (elThreatPieM) Plotly.newPlot('chart-threat-pie-m', dataThreatPie, {
			...pieLayout,
			margin: { t: 4, r: 4, b: 4, l: 4 },
			annotations: [{ text: '<b style="font-size:14px;color:#fff">1,247</b><br><span style="font-size:9px;color:#94a3b8">Hrozeb</span>', x: 0.5, y: 0.5, xanchor: 'center', yanchor: 'middle', showarrow: false, font: { size: 11, color: '#ffffff' } }]
		}, chartConfig);

		const elTtfbM = document.getElementById('chart-ttfb-region-m');
		if (elTtfbM) Plotly.newPlot('chart-ttfb-region-m', [{ type: 'bar', x: regions, y: ttfbVals, marker: { color: ttfbColors, opacity: 0.85 }, hovertemplate: '<b>%{x}</b><br>%{y}ms<extra></extra>' }], {
			paper_bgcolor: bgCard, plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 9 },
			margin: { t: 5, r: 5, b: 34, l: 34 },
			showlegend: false, bargap: 0.35,
			xaxis: { gridcolor: gridColor, linecolor: gridColor, tickcolor: 'transparent', tickfont: { color: textSec, size: 8 }, zeroline: false },
			yaxis: { gridcolor: gridColor, linecolor: gridColor, tickcolor: 'transparent', tickfont: { color: textSec, size: 8 }, zeroline: false, title: { text: 'ms', font: { size: 8, color: textSec } } }
		}, chartConfig);

		const handleResize = () => {
			['chart-requests','chart-bandwidth','chart-threat-pie','chart-ttfb-region','chart-http-status',
			 'chart-requests-m','chart-bandwidth-m','chart-http-status-m','chart-threat-pie-m','chart-ttfb-region-m'].forEach(id => {
				const el = document.getElementById(id);
				if (el) Plotly.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	function switchChart(tab: 'requests' | 'bandwidth' | 'http') {
		activeChart = tab;
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
	<header class="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-[#1e293b] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<div class="w-9 h-9 rounded-lg bg-[#f6821f]/15 border border-[#f6821f]/30 flex items-center justify-center">
				<i class="fa-solid fa-cloud text-[#f6821f] text-sm"></i>
			</div>
			<div>
				<h1 class="text-2xl font-bold text-textMain">{t('layout_nav_edge')}</h1>
				<p class="text-sm text-textSec mt-0.5">{t('edge_header_subtitle')}</p>
			</div>
		</div>
		<div class="flex items-center gap-3 flex-wrap">
			<div class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium">
				<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
				{t('edge_status_cdnOnline')}
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
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t('edge_kpi_cacheHitRate')}</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">{t('common_status_excellent')}</span>
				</div>
				<div class="flex items-end gap-2 mb-3">
					<span class="text-3xl font-bold text-textMain">94.2</span>
					<span class="text-sm text-textSec mb-1">%</span>
					<span class="text-sm text-success mb-1 flex items-center gap-1 ml-1"><i class="fa-solid fa-arrow-up text-xs"></i>+1.4%</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full bg-success rounded-full" style="width:94.2%"></div>
				</div>
				<p class="text-xs text-textSec mt-2">Cíl: ≥ 90% · Splněno</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t('edge_kpi_totalRequests')}</h3>
					<span class="px-2 py-0.5 bg-[#3b82f6]/10 text-[#3b82f6] text-xs rounded-full font-medium">24h</span>
				</div>
				<div class="flex items-end gap-2">
					<span class="text-3xl font-bold text-textMain">48.3M</span>
				</div>
				<p class="text-xs text-textSec mt-2">Peak: 2.4M/h v 10:00</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t('edge_kpi_savedBandwidth')}</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">{t('common_status_ok')}</span>
				</div>
				<div class="flex items-end gap-2 mb-3">
					<span class="text-3xl font-bold text-textMain">2.8</span>
					<span class="text-sm text-textSec mb-1">TB</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full bg-[#3b82f6] rounded-full" style="width:72%"></div>
				</div>
				<p class="text-xs text-textSec mt-2">3.9 TB celkem · 72% z cache</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t('edge_kpi_blockedThreats')}</h3>
					<span class="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full font-medium">{t('common_status_caution')}</span>
				</div>
				<div class="flex items-end gap-2">
					<span class="text-3xl font-bold text-secondary">1,247</span>
					<span class="text-sm text-secondary mb-1 flex items-center gap-1"><i class="fa-solid fa-arrow-up text-xs"></i>+312</span>
				</div>
				<p class="text-xs text-textSec mt-2">DDoS, bots, bad IPs</p>
			</div>
		</section>

		<!-- KPI Stats Row 2 -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#f6821f]/15 flex items-center justify-center">
						<i class="fa-solid fa-globe text-[#f6821f] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">{t('edge_kpi_activePop')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">275</div>
				<p class="text-xs text-textSec mt-1">{t('edge_kpi_popSubtext')}</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#3ecf8e]/15 flex items-center justify-center">
						<i class="fa-solid fa-bolt text-[#3ecf8e] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">{t('edge_kpi_avgTtfb')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">38 <span class="text-sm font-normal text-textSec">ms</span></div>
				<p class="text-xs text-textSec mt-1">Z edge cache · -12ms vs. origin</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center">
						<i class="fa-solid fa-shield-halved text-[#8b5cf6] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">{t('edge_kpi_wafRules')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">48</div>
				<p class="text-xs text-textSec mt-1">Aktivních · 3 nová dnes</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center">
						<i class="fa-solid fa-rotate text-[#3b82f6] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">{t('edge_kpi_sslStatus')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">TLS 1.3</div>
				<p class="text-xs text-textSec mt-1">Certifikát platný · exp. 89 dní</p>
			</div>
		</section>

		<!-- Charts Row: Requests + Bandwidth -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('edge_charts_requestsOverTime')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('edge_charts_requestsSubtitle')}</p>
					</div>
					<div class="flex gap-2">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3ecf8e] inline-block"></span>{t('edge_charts_cacheHit')}</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#f6821f] inline-block"></span>{t('edge_charts_cacheMiss')}</span>
					</div>
				</div>
				<div id="chart-requests" class="h-[220px] w-full"></div>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('edge_charts_bandwidth')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('edge_charts_bandwidthSubtitle')}</p>
					</div>
					<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">Celkem: 3.9 TB</span>
				</div>
				<div id="chart-bandwidth" class="h-[220px] w-full"></div>
			</div>
		</section>

		<!-- Threat Types + TTFB by Region -->
		<section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<h3 class="text-lg font-semibold text-textMain mb-1">{t('edge_threats_title')}</h3>
				<p class="text-xs text-textSec mb-4">{t('edge_threats_subtitle')}</p>
				<div id="chart-threat-pie" class="h-[200px] w-full"></div>
				<div class="mt-4 space-y-2">
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block"></span><span class="text-textSec">DDoS</span></div>
						<span class="text-textMain font-medium">54%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block"></span><span class="text-textSec">Bad Bots</span></div>
						<span class="text-textMain font-medium">28%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] inline-block"></span><span class="text-textSec">WAF Block</span></div>
						<span class="text-textMain font-medium">13%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block"></span><span class="text-textSec">IP Block</span></div>
						<span class="text-textMain font-medium">5%</span>
					</div>
				</div>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-5 lg:col-span-2">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('edge_ttfb_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('edge_ttfb_subtitle')}</p>
					</div>
					<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('edge_ttfb_badge')}</span>
				</div>
				<div class="space-y-3.5">
					<div class="flex items-center gap-3">
						<div class="w-28 text-xs text-textSec truncate flex items-center gap-2"><i class="fa-solid fa-location-dot text-[#3ecf8e] text-xs"></i>EU West</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden"><div class="h-full bg-[#3ecf8e] rounded-full" style="width:19%"></div></div>
						<span class="text-xs text-textMain font-medium w-14 text-right">38 ms</span>
						<span class="w-14 text-right"><span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_ok')}</span></span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-28 text-xs text-textSec truncate flex items-center gap-2"><i class="fa-solid fa-location-dot text-[#3b82f6] text-xs"></i>US East</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden"><div class="h-full bg-[#3b82f6] rounded-full" style="width:30%"></div></div>
						<span class="text-xs text-textMain font-medium w-14 text-right">61 ms</span>
						<span class="w-14 text-right"><span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_ok')}</span></span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-28 text-xs text-textSec truncate flex items-center gap-2"><i class="fa-solid fa-location-dot text-[#f6821f] text-xs"></i>US West</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden"><div class="h-full bg-[#f6821f] rounded-full" style="width:38%"></div></div>
						<span class="text-xs text-textMain font-medium w-14 text-right">78 ms</span>
						<span class="w-14 text-right"><span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_ok')}</span></span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-28 text-xs text-textSec truncate flex items-center gap-2"><i class="fa-solid fa-location-dot text-[#8b5cf6] text-xs"></i>Asia Pacific</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden"><div class="h-full bg-[#8b5cf6] rounded-full" style="width:56%"></div></div>
						<span class="text-xs text-textMain font-medium w-14 text-right">114 ms</span>
						<span class="w-14 text-right"><span class="px-1.5 py-0.5 bg-secondary/10 text-secondary text-xs rounded">{t('common_status_warning')}</span></span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-28 text-xs text-textSec truncate flex items-center gap-2"><i class="fa-solid fa-location-dot text-[#ef4444] text-xs"></i>South America</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden"><div class="h-full bg-[#ef4444] rounded-full" style="width:74%"></div></div>
						<span class="text-xs text-textMain font-medium w-14 text-right">152 ms</span>
						<span class="w-14 text-right"><span class="px-1.5 py-0.5 bg-error/10 text-error text-xs rounded">{t('common_status_slow')}</span></span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-28 text-xs text-textSec truncate flex items-center gap-2"><i class="fa-solid fa-location-dot text-[#3b82f6] text-xs"></i>Middle East</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden"><div class="h-full bg-[#3b82f6]/60 rounded-full" style="width:48%"></div></div>
						<span class="text-xs text-textMain font-medium w-14 text-right">98 ms</span>
						<span class="w-14 text-right"><span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_ok')}</span></span>
					</div>
				</div>
				<div id="chart-ttfb-region" class="h-[140px] w-full mt-5"></div>
			</div>
		</section>

		<!-- HTTP Status + Cache Rules -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('edge_charts_httpStatus')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('edge_charts_httpStatusSubtitle')}</p>
					</div>
				</div>
				<div id="chart-http-status" class="h-[220px] w-full"></div>
				<div class="mt-3 grid grid-cols-2 gap-2">
					<div class="flex items-center gap-2 text-xs">
						<span class="w-2.5 h-2.5 rounded-full bg-[#3ecf8e] inline-block flex-shrink-0"></span>
						<span class="text-textSec">{t('edge_http_2xx')}</span>
						<span class="ml-auto text-textMain font-semibold">96.1%</span>
					</div>
					<div class="flex items-center gap-2 text-xs">
						<span class="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block flex-shrink-0"></span>
						<span class="text-textSec">{t('edge_http_3xx')}</span>
						<span class="ml-auto text-textMain font-semibold">2.4%</span>
					</div>
					<div class="flex items-center gap-2 text-xs">
						<span class="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block flex-shrink-0"></span>
						<span class="text-textSec">{t('edge_http_4xx')}</span>
						<span class="ml-auto text-textMain font-semibold">1.1%</span>
					</div>
					<div class="flex items-center gap-2 text-xs">
						<span class="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block flex-shrink-0"></span>
						<span class="text-textSec">{t('edge_http_5xx')}</span>
						<span class="ml-auto text-textMain font-semibold">0.4%</span>
					</div>
				</div>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('edge_cacheRules_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('edge_cacheRules_subtitle')}</p>
					</div>
					<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('edge_cacheRules_badge')}</span>
				</div>
				<div class="space-y-3">
					<div class="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="w-8 h-8 rounded-lg bg-[#3ecf8e]/15 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-image text-[#3ecf8e] text-xs"></i></div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-medium font-mono truncate">/assets/images/*</p>
							<p class="text-xs text-textSec mt-0.5">TTL: 30 dní · Static files</p>
						</div>
						<div class="text-right flex-shrink-0">
							<div class="text-success font-bold text-sm">99.1%</div>
							<div class="text-xs text-textSec">{t('edge_cacheRules_hitRate')}</div>
						</div>
					</div>
					<div class="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="w-8 h-8 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-code text-[#3b82f6] text-xs"></i></div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-medium font-mono truncate">/static/js/*.bundle.js</p>
							<p class="text-xs text-textSec mt-0.5">TTL: 7 dní · JS bundles</p>
						</div>
						<div class="text-right flex-shrink-0">
							<div class="text-[#3b82f6] font-bold text-sm">98.4%</div>
							<div class="text-xs text-textSec">{t('edge_cacheRules_hitRate')}</div>
						</div>
					</div>
					<div class="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="w-8 h-8 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-database text-[#8b5cf6] text-xs"></i></div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-medium font-mono truncate">/api/v1/products*</p>
							<p class="text-xs text-textSec mt-0.5">TTL: 5 min · API cache</p>
						</div>
						<div class="text-right flex-shrink-0">
							<div class="text-[#8b5cf6] font-bold text-sm">72.3%</div>
							<div class="text-xs text-textSec">{t('edge_cacheRules_hitRate')}</div>
						</div>
					</div>
					<div class="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="w-8 h-8 rounded-lg bg-[#f6821f]/15 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-file text-[#f6821f] text-xs"></i></div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-medium font-mono truncate">/api/v1/user/profile</p>
							<p class="text-xs text-textSec mt-0.5">TTL: Bypass · Auth required</p>
						</div>
						<div class="text-right flex-shrink-0">
							<div class="text-secondary font-bold text-sm">0%</div>
							<div class="text-xs text-textSec">{t('edge_cacheRules_hitRate')}</div>
						</div>
					</div>
					<div class="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="w-8 h-8 rounded-lg bg-[#3ecf8e]/15 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-globe text-[#3ecf8e] text-xs"></i></div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-medium font-mono truncate">/sitemap.xml</p>
							<p class="text-xs text-textSec mt-0.5">TTL: 1 den · SEO</p>
						</div>
						<div class="text-right flex-shrink-0">
							<div class="text-success font-bold text-sm">97.8%</div>
							<div class="text-xs text-textSec">{t('edge_cacheRules_hitRate')}</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- WAF & Security Log -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-5">
			<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('edge_wafLog_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('edge_wafLog_subtitle')}</p>
				</div>
				<div class="flex gap-3 flex-wrap">
					<div class="flex rounded-lg overflow-hidden border border-[#334155]">
						<button class="px-3 py-1.5 bg-secondary/20 text-secondary text-xs font-medium">{t('common_status_all')}</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">DDoS</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">WAF</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Bot</button>
					</div>
					<div class="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-1.5">
						<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
						<input type="text" placeholder={t('edge_wafLog_searchPlaceholder')} class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-36" />
					</div>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-[#1e293b]">
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_time')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_type')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('edge_table_ipAddress')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('edge_table_country')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('edge_table_ruleMessage')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_action')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3">{t('common_table_status')}</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[#1e293b]/60">
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">14:51:22</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">DDoS</span></td>
							<td class="py-3 pr-4 text-textMain font-mono text-xs whitespace-nowrap">185.220.101.47</td>
							<td class="py-3 pr-4 text-textSec text-xs">🇷🇺 RU</td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">L7 HTTP flood – 8,400 req/s z jedné IP</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">{t('common_status_blocked')}</span></td>
							<td class="py-3"><span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded">{t('common_status_active')}</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">14:38:04</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded font-medium">WAF</span></td>
							<td class="py-3 pr-4 text-textMain font-mono text-xs whitespace-nowrap">92.118.160.22</td>
							<td class="py-3 pr-4 text-textSec text-xs">🇨🇳 CN</td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">SQL Injection pokus – pravidlo CF-WAF-SQLi-001</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">{t('common_status_blocked')}</span></td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">13:55:18</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#f97316]/15 text-[#f97316] text-xs rounded font-medium">Bot</span></td>
							<td class="py-3 pr-4 text-textMain font-mono text-xs whitespace-nowrap">45.33.32.156</td>
							<td class="py-3 pr-4 text-textSec text-xs">🇺🇸 US</td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Scraping bot – User-Agent: Scrapy/2.11</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">{t('edge_status_challenge')}</span></td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">13:12:40</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded font-medium">WAF</span></td>
							<td class="py-3 pr-4 text-textMain font-mono text-xs whitespace-nowrap">103.21.244.0</td>
							<td class="py-3 pr-4 text-textSec text-xs">🇮🇳 IN</td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">XSS pokus – pravidlo CF-WAF-XSS-012</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">{t('common_status_blocked')}</span></td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">12:04:09</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">DDoS</span></td>
							<td class="py-3 pr-4 text-textMain font-mono text-xs whitespace-nowrap">195.178.110.33</td>
							<td class="py-3 pr-4 text-textSec text-xs">🇩🇪 DE</td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">SYN flood útok – 12,000 req/s z botnet sítě</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">{t('common_status_blocked')}</span></td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">10:28:55</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Rate Limit</span></td>
							<td class="py-3 pr-4 text-textMain font-mono text-xs whitespace-nowrap">82.102.17.84</td>
							<td class="py-3 pr-4 text-textSec text-xs">🇬🇧 GB</td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Rate limit překročen – /api/v1/login (200 req/min)</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">{t('edge_status_throttle')}</span></td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span></td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

	</div>
</div>

<!-- ===== MOBILE LAYOUT ===== -->
<div class="lg:hidden pb-20">

	<!-- Title row -->
	<div class="px-4 pt-3 pb-2">
		<div class="flex items-center gap-2.5">
			<div class="w-7 h-7 rounded-md bg-[#f6821f]/15 border border-[#f6821f]/30 flex items-center justify-center">
				<i class="fa-solid fa-cloud text-[#f6821f] text-xs"></i>
			</div>
			<div>
				<h1 class="text-sm font-bold text-textMain leading-tight">{t('layout_nav_edge')}</h1>
				<p class="text-xs text-textSec">{t('edge_header_subtitleMobile')}</p>
			</div>
		</div>
	</div>

	<!-- Status + Time -->
	<div class="px-4 pb-3 flex items-center gap-2">
		<div class="flex items-center gap-1.5 px-2.5 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-xs font-medium">
			<div class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
			{t('edge_status_cdnOnline')}
		</div>
	</div>

	<div class="px-4 pb-4">
		<select class="w-full bg-card border border-[#334155] text-sm text-textMain rounded-xl px-4 py-3 focus:outline-none">
			<option>{t('common_timeRange_last24h')}</option>
			<option>{t('common_timeRange_last7d')}</option>
			<option>{t('common_timeRange_last30d')}</option>
		</select>
	</div>

	<div class="px-4 space-y-4">

		<!-- KPI Primary Row -->
		<section class="grid grid-cols-2 gap-3">
			<!-- Cache Hit Rate - full width -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-4 col-span-2">
				<div class="flex justify-between items-start mb-2">
					<h3 class="text-textSec text-xs font-medium">{t('edge_kpi_cacheHitRate')}</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">{t('common_status_excellent')}</span>
				</div>
				<div class="flex items-end gap-2 mb-2">
					<span class="text-4xl font-bold text-textMain">94.2</span>
					<span class="text-sm text-textSec mb-1">%</span>
					<span class="text-sm text-success mb-1 flex items-center gap-1 ml-1"><i class="fa-solid fa-arrow-up text-xs"></i>+1.4%</span>
				</div>
				<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full bg-success rounded-full" style="width:94.2%"></div>
				</div>
				<p class="text-xs text-textSec mt-2">Cíl: ≥ 90% · Splněno</p>
			</div>
			<!-- Requests -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex justify-between items-start mb-2">
					<h3 class="text-textSec text-xs font-medium leading-tight">{t('edge_kpi_totalRequests')}</h3>
					<span class="px-1.5 py-0.5 bg-[#3b82f6]/10 text-[#3b82f6] text-xs rounded-full font-medium">24h</span>
				</div>
				<div class="text-2xl font-bold text-textMain">48.3M</div>
				<p class="text-xs text-textSec mt-1">Peak: 2.4M/h v 10:00</p>
			</div>
			<!-- Bandwidth -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex justify-between items-start mb-2">
					<h3 class="text-textSec text-xs font-medium leading-tight">{t('edge_kpi_savedBandwidthMobile')}</h3>
					<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">{t('common_status_ok')}</span>
				</div>
				<div class="flex items-end gap-1 mb-2">
					<span class="text-2xl font-bold text-textMain">2.8</span>
					<span class="text-xs text-textSec mb-0.5">TB</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full bg-[#3b82f6] rounded-full" style="width:72%"></div>
				</div>
				<p class="text-xs text-textSec mt-1">72% z cache</p>
			</div>
		</section>

		<!-- Threats + Secondary KPIs -->
		<section class="grid grid-cols-2 gap-3">
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex justify-between items-start mb-2">
					<h3 class="text-textSec text-xs font-medium leading-tight">{t('edge_kpi_blockedThreats')}</h3>
					<span class="px-1.5 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full font-medium">{t('common_status_caution')}</span>
				</div>
				<div class="text-2xl font-bold text-secondary">1,247</div>
				<p class="text-xs text-secondary mt-1 flex items-center gap-1"><i class="fa-solid fa-arrow-up text-xs"></i>+312 dnes</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-6 h-6 rounded-md bg-[#3ecf8e]/15 flex items-center justify-center">
						<i class="fa-solid fa-bolt text-[#3ecf8e] text-xs"></i>
					</div>
					<h3 class="text-textSec text-xs font-medium">{t('edge_kpi_avgTtfb')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">38 <span class="text-xs font-normal text-textSec">ms</span></div>
				<p class="text-xs text-textSec mt-1">-12ms vs. origin</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-6 h-6 rounded-md bg-[#f6821f]/15 flex items-center justify-center">
						<i class="fa-solid fa-globe text-[#f6821f] text-xs"></i>
					</div>
					<h3 class="text-textSec text-xs font-medium">{t('edge_kpi_activePop')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">275</div>
				<p class="text-xs text-textSec mt-1">{t('edge_kpi_popSubtextMobile')}</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-6 h-6 rounded-md bg-[#8b5cf6]/15 flex items-center justify-center">
						<i class="fa-solid fa-shield-halved text-[#8b5cf6] text-xs"></i>
					</div>
					<h3 class="text-textSec text-xs font-medium">{t('edge_kpi_wafRules')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">48</div>
				<p class="text-xs text-textSec mt-1">3 nová dnes</p>
			</div>
		</section>

		<!-- SSL/TLS Banner -->
		<div class="bg-card border border-[#1e293b] rounded-xl p-4 flex items-center gap-3">
			<div class="w-10 h-10 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center flex-shrink-0">
				<i class="fa-solid fa-rotate text-[#3b82f6]"></i>
			</div>
			<div class="flex-1 min-w-0">
				<div class="text-textMain font-bold text-base">TLS 1.3</div>
				<p class="text-xs text-textSec">Certifikát platný · exp. za 89 dní</p>
			</div>
			<span class="px-2 py-1 bg-success/10 text-success text-xs rounded-lg font-medium flex-shrink-0">{t('common_status_valid')}</span>
		</div>

		<!-- Charts Tabs -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<div class="flex items-center gap-1 mb-4 bg-[#0a1628] rounded-lg p-1">
				<button
					onclick={() => switchChart('requests')}
					class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'requests' ? 'bg-[#1e293b] text-white' : 'text-textSec'}"
				>{t('edge_tabs_requests')}</button>
				<button
					onclick={() => switchChart('bandwidth')}
					class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'bandwidth' ? 'bg-[#1e293b] text-white' : 'text-textSec'}"
				>{t('edge_tabs_bandwidth')}</button>
				<button
					onclick={() => switchChart('http')}
					class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'http' ? 'bg-[#1e293b] text-white' : 'text-textSec'}"
				>{t('edge_tabs_httpStatus')}</button>
			</div>

			<div class="{activeChart === 'requests' ? '' : 'hidden'}">
				<div class="flex items-center justify-between mb-3">
					<div>
						<p class="text-sm font-semibold text-textMain">{t('edge_charts_requestsOverTime')}</p>
						<p class="text-xs text-textSec">{t('edge_charts_requestsSubtitle')}</p>
					</div>
					<div class="flex gap-1.5">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#3ecf8e] inline-block"></span>{t('edge_charts_cacheHit')}</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#f6821f] inline-block"></span>{t('edge_charts_cacheMiss')}</span>
					</div>
				</div>
				<div id="chart-requests-m" class="h-[200px] w-full"></div>
			</div>
			<div class="{activeChart === 'bandwidth' ? '' : 'hidden'}">
				<div class="flex items-center justify-between mb-3">
					<div>
						<p class="text-sm font-semibold text-textMain">{t('edge_charts_bandwidth')}</p>
						<p class="text-xs text-textSec">{t('edge_charts_bandwidthSubtitle')}</p>
					</div>
				</div>
				<div id="chart-bandwidth-m" class="h-[200px] w-full"></div>
			</div>
			<div class="{activeChart === 'http' ? '' : 'hidden'}">
				<div class="flex items-center justify-between mb-3">
					<div>
						<p class="text-sm font-semibold text-textMain">{t('edge_charts_httpStatus')}</p>
						<p class="text-xs text-textSec">{t('edge_charts_httpStatusSubtitle')}</p>
					</div>
				</div>
				<div id="chart-http-status-m" class="h-[200px] w-full"></div>
				<div class="mt-3 grid grid-cols-2 gap-2">
					<div class="flex items-center gap-2 text-xs">
						<span class="w-2.5 h-2.5 rounded-full bg-[#3ecf8e] inline-block flex-shrink-0"></span>
						<span class="text-textSec">{t('edge_http_2xx')}</span>
						<span class="ml-auto text-textMain font-semibold">96.1%</span>
					</div>
					<div class="flex items-center gap-2 text-xs">
						<span class="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block flex-shrink-0"></span>
						<span class="text-textSec">{t('edge_http_3xx')}</span>
						<span class="ml-auto text-textMain font-semibold">2.4%</span>
					</div>
					<div class="flex items-center gap-2 text-xs">
						<span class="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block flex-shrink-0"></span>
						<span class="text-textSec">{t('edge_http_4xx')}</span>
						<span class="ml-auto text-textMain font-semibold">1.1%</span>
					</div>
					<div class="flex items-center gap-2 text-xs">
						<span class="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block flex-shrink-0"></span>
						<span class="text-textSec">{t('edge_http_5xx')}</span>
						<span class="ml-auto text-textMain font-semibold">0.4%</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Typy hrozeb -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<h3 class="text-sm font-semibold text-textMain mb-1">{t('edge_threats_title')}</h3>
			<p class="text-xs text-textSec mb-3">{t('edge_threats_subtitle')}</p>
			<div class="flex gap-4">
				<div id="chart-threat-pie-m" class="h-[160px] flex-shrink-0" style="width:160px;"></div>
				<div class="flex-1 space-y-2.5 flex flex-col justify-center">
					<div class="flex items-center justify-between text-xs">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block"></span><span class="text-textSec">DDoS</span></div>
						<span class="text-textMain font-semibold">54%</span>
					</div>
					<div class="flex items-center justify-between text-xs">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block"></span><span class="text-textSec">Bad Bots</span></div>
						<span class="text-textMain font-semibold">28%</span>
					</div>
					<div class="flex items-center justify-between text-xs">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] inline-block"></span><span class="text-textSec">WAF Block</span></div>
						<span class="text-textMain font-semibold">13%</span>
					</div>
					<div class="flex items-center justify-between text-xs">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block"></span><span class="text-textSec">IP Block</span></div>
						<span class="text-textMain font-semibold">5%</span>
					</div>
				</div>
			</div>
		</section>

		<!-- TTFB by Region -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<div class="flex justify-between items-center mb-3">
				<div>
					<h3 class="text-sm font-semibold text-textMain">{t('edge_ttfb_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('edge_ttfb_subtitle')}</p>
				</div>
				<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('edge_ttfb_badgeMobile')}</span>
			</div>
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<div class="w-20 text-xs text-textSec flex items-center gap-1.5 flex-shrink-0"><i class="fa-solid fa-location-dot text-[#3ecf8e] text-xs"></i>EU West</div>
					<div class="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden"><div class="h-full bg-[#3ecf8e] rounded-full" style="width:19%"></div></div>
					<span class="text-xs text-textMain font-medium w-12 text-right flex-shrink-0">38 ms</span>
					<span class="w-14 text-right flex-shrink-0"><span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_ok')}</span></span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-20 text-xs text-textSec flex items-center gap-1.5 flex-shrink-0"><i class="fa-solid fa-location-dot text-[#3b82f6] text-xs"></i>US East</div>
					<div class="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden"><div class="h-full bg-[#3b82f6] rounded-full" style="width:30%"></div></div>
					<span class="text-xs text-textMain font-medium w-12 text-right flex-shrink-0">61 ms</span>
					<span class="w-14 text-right flex-shrink-0"><span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_ok')}</span></span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-20 text-xs text-textSec flex items-center gap-1.5 flex-shrink-0"><i class="fa-solid fa-location-dot text-[#f6821f] text-xs"></i>US West</div>
					<div class="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden"><div class="h-full bg-[#f6821f] rounded-full" style="width:38%"></div></div>
					<span class="text-xs text-textMain font-medium w-12 text-right flex-shrink-0">78 ms</span>
					<span class="w-14 text-right flex-shrink-0"><span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_ok')}</span></span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-20 text-xs text-textSec flex items-center gap-1.5 flex-shrink-0"><i class="fa-solid fa-location-dot text-[#8b5cf6] text-xs"></i>Asia Pac.</div>
					<div class="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden"><div class="h-full bg-[#8b5cf6] rounded-full" style="width:56%"></div></div>
					<span class="text-xs text-textMain font-medium w-12 text-right flex-shrink-0">114 ms</span>
					<span class="w-14 text-right flex-shrink-0"><span class="px-1.5 py-0.5 bg-secondary/10 text-secondary text-xs rounded">{t('common_status_warning')}</span></span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-20 text-xs text-textSec flex items-center gap-1.5 flex-shrink-0"><i class="fa-solid fa-location-dot text-[#ef4444] text-xs"></i>S. America</div>
					<div class="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden"><div class="h-full bg-[#ef4444] rounded-full" style="width:74%"></div></div>
					<span class="text-xs text-textMain font-medium w-12 text-right flex-shrink-0">152 ms</span>
					<span class="w-14 text-right flex-shrink-0"><span class="px-1.5 py-0.5 bg-error/10 text-error text-xs rounded">{t('common_status_slow')}</span></span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-20 text-xs text-textSec flex items-center gap-1.5 flex-shrink-0"><i class="fa-solid fa-location-dot text-[#3b82f6] text-xs"></i>Mid. East</div>
					<div class="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden"><div class="h-full bg-[#3b82f6]/60 rounded-full" style="width:48%"></div></div>
					<span class="text-xs text-textMain font-medium w-12 text-right flex-shrink-0">98 ms</span>
					<span class="w-14 text-right flex-shrink-0"><span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_ok')}</span></span>
				</div>
			</div>
			<div id="chart-ttfb-region-m" class="h-[130px] w-full mt-4"></div>
		</section>

		<!-- Cache Rules -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				onclick={() => (cacheRulesOpen = !cacheRulesOpen)}
				class="w-full flex items-center justify-between p-4 text-left"
			>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-[#3ecf8e]/15 flex items-center justify-center">
						<i class="fa-solid fa-image text-[#3ecf8e] text-xs"></i>
					</div>
					<div>
						<p class="text-sm font-semibold text-textMain">{t('edge_cacheRules_title')}</p>
						<p class="text-[10px] text-textSec">{t('edge_cacheRules_subtitleMobile')}</p>
					</div>
				</div>
				<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {cacheRulesOpen ? 'rotate-180' : ''}"></i>
			</button>
			{#if cacheRulesOpen}
				<div class="px-4 pb-4 space-y-2.5">
					<div class="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="w-8 h-8 rounded-lg bg-[#3ecf8e]/15 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-image text-[#3ecf8e] text-xs"></i></div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-xs font-medium font-mono truncate">/assets/images/*</p>
							<p class="text-xs text-textSec mt-0.5">TTL: 30 dní · Static files</p>
						</div>
						<div class="text-right flex-shrink-0">
							<div class="text-success font-bold text-sm">99.1%</div>
							<div class="text-xs text-textSec">{t('edge_cacheRules_hitRate')}</div>
						</div>
					</div>
					<div class="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="w-8 h-8 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-code text-[#3b82f6] text-xs"></i></div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-xs font-medium font-mono truncate">/static/js/*.bundle.js</p>
							<p class="text-xs text-textSec mt-0.5">TTL: 7 dní · JS bundles</p>
						</div>
						<div class="text-right flex-shrink-0">
							<div class="text-[#3b82f6] font-bold text-sm">98.4%</div>
							<div class="text-xs text-textSec">{t('edge_cacheRules_hitRate')}</div>
						</div>
					</div>
					<div class="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="w-8 h-8 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-database text-[#8b5cf6] text-xs"></i></div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-xs font-medium font-mono truncate">/api/v1/products*</p>
							<p class="text-xs text-textSec mt-0.5">TTL: 5 min · API cache</p>
						</div>
						<div class="text-right flex-shrink-0">
							<div class="text-[#8b5cf6] font-bold text-sm">72.3%</div>
							<div class="text-xs text-textSec">{t('edge_cacheRules_hitRate')}</div>
						</div>
					</div>
					<div class="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="w-8 h-8 rounded-lg bg-[#f6821f]/15 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-file text-[#f6821f] text-xs"></i></div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-xs font-medium font-mono truncate">/api/v1/user/profile</p>
							<p class="text-xs text-textSec mt-0.5">TTL: Bypass · Auth required</p>
						</div>
						<div class="text-right flex-shrink-0">
							<div class="text-secondary font-bold text-sm">0%</div>
							<div class="text-xs text-textSec">{t('edge_cacheRules_hitRate')}</div>
						</div>
					</div>
					<div class="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="w-8 h-8 rounded-lg bg-[#3ecf8e]/15 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-globe text-[#3ecf8e] text-xs"></i></div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-xs font-medium font-mono truncate">/sitemap.xml</p>
							<p class="text-xs text-textSec mt-0.5">TTL: 1 den · SEO</p>
						</div>
						<div class="text-right flex-shrink-0">
							<div class="text-success font-bold text-sm">97.8%</div>
							<div class="text-xs text-textSec">hit rate</div>
						</div>
					</div>
				</div>
			{/if}
		</section>

		<!-- WAF & Security Logs -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<div class="mb-4">
				<div class="flex justify-between items-start mb-3">
					<div>
						<h3 class="text-sm font-semibold text-textMain">{t('edge_wafLog_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('edge_wafLog_subtitle')}</p>
					</div>
				</div>
				<div class="flex rounded-lg overflow-hidden border border-[#334155] mb-3">
					<button class="flex-1 px-2 py-2 bg-secondary/20 text-secondary text-xs font-medium">{t('common_status_all')}</button>
					<button class="flex-1 px-2 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">DDoS</button>
					<button class="flex-1 px-2 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">WAF</button>
					<button class="flex-1 px-2 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Bot</button>
				</div>
				<div class="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5">
					<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
					<input type="text" placeholder={t('edge_wafLog_searchPlaceholder')} class="bg-transparent text-sm text-textMain placeholder-textSec outline-none flex-1" />
				</div>
			</div>

			<div class="space-y-3">
				<div class="border-l-[3px] border-l-error bg-[#1e293b]/40 border border-[#334155]/40 rounded-lg p-3" style="border-left-color:#ef4444">
					<div class="flex justify-between items-start mb-2">
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">DDoS</span>
							<span class="text-xs text-textSec font-mono">14:51:22</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">{t('common_status_blocked')}</span>
							<span class="px-1.5 py-0.5 bg-error/10 text-error text-xs rounded">{t('common_status_active')}</span>
						</div>
					</div>
					<div class="flex items-center gap-2 mb-1.5">
						<span class="text-textMain font-mono text-xs">185.220.101.47</span>
						<span class="text-textSec text-xs">🇷🇺 RU</span>
					</div>
					<p class="text-xs text-textSec leading-relaxed">L7 HTTP flood – 8,400 req/s z jedné IP</p>
				</div>

				<div class="border-l-[3px] bg-[#1e293b]/40 border border-[#334155]/40 rounded-lg p-3" style="border-left-color:#8b5cf6">
					<div class="flex justify-between items-start mb-2">
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded font-medium">WAF</span>
							<span class="text-xs text-textSec font-mono">14:38:04</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">{t('common_status_blocked')}</span>
							<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span>
						</div>
					</div>
					<div class="flex items-center gap-2 mb-1.5">
						<span class="text-textMain font-mono text-xs">92.118.160.22</span>
						<span class="text-textSec text-xs">🇨🇳 CN</span>
					</div>
					<p class="text-xs text-textSec leading-relaxed">SQL Injection pokus – CF-WAF-SQLi-001</p>
				</div>

				<div class="border-l-[3px] bg-[#1e293b]/40 border border-[#334155]/40 rounded-lg p-3" style="border-left-color:#f97316">
					<div class="flex justify-between items-start mb-2">
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 bg-[#f97316]/15 text-[#f97316] text-xs rounded font-medium">Bot</span>
							<span class="text-xs text-textSec font-mono">13:55:18</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">{t('edge_status_challenge')}</span>
							<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span>
						</div>
					</div>
					<div class="flex items-center gap-2 mb-1.5">
						<span class="text-textMain font-mono text-xs">45.33.32.156</span>
						<span class="text-textSec text-xs">🇺🇸 US</span>
					</div>
					<p class="text-xs text-textSec leading-relaxed">Scraping bot – User-Agent: Scrapy/2.11</p>
				</div>

				<div class="border-l-[3px] bg-[#1e293b]/40 border border-[#334155]/40 rounded-lg p-3" style="border-left-color:#8b5cf6">
					<div class="flex justify-between items-start mb-2">
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded font-medium">WAF</span>
							<span class="text-xs text-textSec font-mono">13:12:40</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">{t('common_status_blocked')}</span>
							<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span>
						</div>
					</div>
					<div class="flex items-center gap-2 mb-1.5">
						<span class="text-textMain font-mono text-xs">103.21.244.0</span>
						<span class="text-textSec text-xs">🇮🇳 IN</span>
					</div>
					<p class="text-xs text-textSec leading-relaxed">XSS pokus – pravidlo CF-WAF-XSS-012</p>
				</div>

				<div class="border-l-[3px] border-l-error bg-[#1e293b]/40 border border-[#334155]/40 rounded-lg p-3" style="border-left-color:#ef4444">
					<div class="flex justify-between items-start mb-2">
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">DDoS</span>
							<span class="text-xs text-textSec font-mono">12:04:09</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">{t('common_status_blocked')}</span>
							<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span>
						</div>
					</div>
					<div class="flex items-center gap-2 mb-1.5">
						<span class="text-textMain font-mono text-xs">195.178.110.33</span>
						<span class="text-textSec text-xs">🇩🇪 DE</span>
					</div>
					<p class="text-xs text-textSec leading-relaxed">SYN flood útok – 12,000 req/s z botnet sítě</p>
				</div>

				<div class="border-l-[3px] bg-[#1e293b]/40 border border-[#334155]/40 rounded-lg p-3" style="border-left-color:#3b82f6">
					<div class="flex justify-between items-start mb-2">
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Rate Limit</span>
							<span class="text-xs text-textSec font-mono">10:28:55</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">{t('edge_status_throttle')}</span>
							<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span>
						</div>
					</div>
					<div class="flex items-center gap-2 mb-1.5">
						<span class="text-textMain font-mono text-xs">82.102.17.84</span>
						<span class="text-textSec text-xs">🇬🇧 GB</span>
					</div>
					<p class="text-xs text-textSec leading-relaxed">Rate limit překročen – /api/v1/login (200 req/min)</p>
				</div>
			</div>
		</section>

	</div>
</div>

<!-- Mobile Bottom Navigation -->
<nav class="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-[#1e293b] px-2 py-2 lg:hidden">
	<div class="flex justify-around items-center max-w-2xl mx-auto">
		<a href="{base}/" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-gauge-high text-base"></i>
			<span class="text-xs">{t('layout_nav_dashboard')}</span>
		</a>
		<a href="{base}/dostupnost" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-server text-base"></i>
			<span class="text-xs">{t('layout_nav_availability')}</span>
		</a>
		<a href="{base}/edge" class="flex flex-col items-center gap-1 px-3 py-1.5 text-[#f6821f] min-w-[44px]">
			<i class="fa-solid fa-cloud text-base"></i>
			<span class="text-xs font-medium">{t('layout_nav_edge')}</span>
		</a>
		<a href="{base}/security" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-shield-halved text-base"></i>
			<span class="text-xs">{t('layout_nav_security')}</span>
		</a>
		<a href="{base}/business" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-chart-line text-base"></i>
			<span class="text-xs">{t('layout_nav_business')}</span>
		</a>
	</div>
</nav>
