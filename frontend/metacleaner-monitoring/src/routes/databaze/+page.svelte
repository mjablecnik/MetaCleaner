<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { base } from '$app/paths';

	let latencyOpen = $state(true);
	let connectionsOpen = $state(false);
	let qpsOpen = $state(false);
	let queryTypesOpen = $state(false);
	let slowQueriesOpen = $state(true);
	let tableSizesOpen = $state(false);

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
			margin: { t: 8, r: 8, b: 36, l: 38 },
			xaxis: { ...commonLayout.xaxis, tickfont: { color: textSec, size: 9 } },
			yaxis: { ...commonLayout.yaxis, tickfont: { color: textSec, size: 9 } }
		};

		const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

		const avgLatency = [18, 16, 20, 22, 28, 35, 42, 55, 38, 30, 26, 22];
		const p95Latency = [80, 70, 90, 100, 130, 160, 200, 280, 175, 140, 115, 95];
		const conns = [32, 28, 35, 42, 58, 72, 81, 87, 76, 68, 59, 50];
		const qps = [420, 380, 510, 640, 980, 1420, 1840, 2100, 1780, 1540, 1200, 860];

		const dataLatency = [
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy', name: 'P95',
				x: hours, y: p95Latency,
				line: { color: purpleColor, width: 2, shape: 'spline' },
				fillcolor: 'rgba(139,92,246,0.08)',
				hovertemplate: '<b>%{x}</b><br>P95: %{y}ms<extra></extra>'
			},
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy', name: 'Avg',
				x: hours, y: avgLatency,
				line: { color: greenColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(62,207,142,0.10)',
				hovertemplate: '<b>%{x}</b><br>Avg: %{y}ms<extra></extra>'
			}
		];

		const dataConnections = [
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy',
				x: hours, y: conns,
				line: { color: secondaryColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(249,115,22,0.10)',
				hovertemplate: '<b>%{x}</b><br>Spojení: %{y}<extra></extra>'
			},
			{
				type: 'scatter', mode: 'lines',
				x: hours, y: Array(hours.length).fill(100),
				line: { color: errorColor, width: 1.5, dash: 'dot' },
				hovertemplate: 'Limit: 100<extra></extra>'
			}
		];

		const dataPie = [
			{
				type: 'pie',
				labels: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
				values: [68, 18, 11, 3],
				hole: 0.60,
				marker: { colors: [blueColor, greenColor, secondaryColor, errorColor], line: { color: bgCard, width: 2 } },
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
			annotations: [
				{
					text: '<b style="font-size:18px;color:#fff">68%</b><br><span style="font-size:10px;color:#94a3b8">SELECT</span>',
					x: 0.5, y: 0.5,
					xanchor: 'center', yanchor: 'middle',
					showarrow: false,
					font: { size: 13, color: '#ffffff' }
				}
			]
		};

		const dataQps = [
			{
				type: 'bar', x: hours, y: qps,
				marker: { color: qps.map((v) => (v > 1800 ? secondaryColor : blueColor)), opacity: 0.85 },
				hovertemplate: '<b>%{x}</b><br>%{y} queries/min<extra></extra>'
			}
		];

		// Desktop charts
		const dLatency = document.getElementById('chart-latency');
		if (dLatency)
			Plotly.newPlot('chart-latency', dataLatency,
				{ ...commonLayout, yaxis: { ...commonLayout.yaxis, title: { text: 'ms', font: { size: 10, color: textSec } } } },
				chartConfig);

		const dConns = document.getElementById('chart-connections');
		if (dConns)
			Plotly.newPlot('chart-connections', dataConnections,
				{ ...commonLayout, yaxis: { ...commonLayout.yaxis, range: [0, 115] } },
				chartConfig);

		const dPie = document.getElementById('chart-query-pie');
		if (dPie) Plotly.newPlot('chart-query-pie', dataPie, pieLayout, chartConfig);

		const dQps = document.getElementById('chart-qps');
		if (dQps)
			Plotly.newPlot('chart-qps', dataQps,
				{ ...commonLayout, bargap: 0.3, yaxis: { ...commonLayout.yaxis, title: { text: 'q/min', font: { size: 10, color: textSec } } } },
				chartConfig);

		// Mobile charts
		const mLatency = document.getElementById('chart-latency-m');
		if (mLatency)
			Plotly.newPlot('chart-latency-m', dataLatency, { ...mobileLayout }, chartConfig);

		const mConns = document.getElementById('chart-connections-m');
		if (mConns)
			Plotly.newPlot('chart-connections-m', dataConnections,
				{ ...mobileLayout, yaxis: { ...mobileLayout.yaxis, range: [0, 115] } },
				chartConfig);

		const mPie = document.getElementById('chart-query-pie-m');
		if (mPie)
			Plotly.newPlot('chart-query-pie-m', dataPie, {
				...pieLayout,
				font: { ...pieLayout.font, size: 10 },
				margin: { t: 5, r: 5, b: 5, l: 5 },
				annotations: [{
					text: '<b style="font-size:16px;color:#fff">68%</b><br><span style="font-size:9px;color:#94a3b8">SELECT</span>',
					x: 0.5, y: 0.5, xanchor: 'center', yanchor: 'middle',
					showarrow: false, font: { size: 12, color: '#ffffff' }
				}]
			}, chartConfig);

		const mQps = document.getElementById('chart-qps-m');
		if (mQps)
			Plotly.newPlot('chart-qps-m', dataQps, { ...mobileLayout, bargap: 0.3 }, chartConfig);

		const handleResize = () => {
			['chart-latency', 'chart-connections', 'chart-query-pie', 'chart-qps',
			 'chart-latency-m', 'chart-connections-m', 'chart-query-pie-m', 'chart-qps-m'].forEach((id) => {
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
	<header
		class="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-[#1e293b] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
	>
		<div class="flex items-center gap-4">
			<div class="w-9 h-9 rounded-lg bg-[#3ecf8e]/15 border border-[#3ecf8e]/30 flex items-center justify-center">
				<i class="fa-solid fa-database text-[#3ecf8e] text-sm"></i>
			</div>
			<div>
				<h1 class="text-2xl font-bold text-textMain">{t('database_header_title')}</h1>
				<p class="text-sm text-textSec mt-0.5">{t('database_header_subtitle')}</p>
			</div>
		</div>
		<div class="flex items-center gap-3 flex-wrap">
			<div class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium">
				<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
				{t('database_status_online')}
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
					<h3 class="text-textSec text-sm font-medium">{t('database_kpi_activeConnections')}</h3>
					<span class="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full font-medium">{t('common_status_warning')}</span>
				</div>
				<div class="flex items-end gap-2 mb-3">
					<span class="text-3xl font-bold text-textMain">87</span>
					<span class="text-sm text-textSec mb-1">/ 100</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full bg-secondary rounded-full" style="width:87%"></div>
				</div>
				<p class="text-xs text-textSec mt-2">Pool utilization: 87%</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t('database_kpi_queryLatency')}</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">{t('common_status_ok')}</span>
				</div>
				<div class="flex items-end gap-2">
					<span class="text-3xl font-bold text-textMain">24</span>
					<span class="text-sm text-textSec mb-1">ms</span>
					<span class="text-sm text-success mb-1 flex items-center gap-1 ml-1"><i class="fa-solid fa-arrow-down text-xs"></i>-3ms</span>
				</div>
				<p class="text-xs text-textSec mt-2">P95: 142ms · P99: 380ms</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t('database_kpi_storage')}</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">{t('common_status_ok')}</span>
				</div>
				<div class="flex items-end gap-2 mb-3">
					<span class="text-3xl font-bold text-textMain">6.2</span>
					<span class="text-sm text-textSec mb-1">/ 8 GB</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full bg-[#3b82f6] rounded-full" style="width:77%"></div>
				</div>
				<p class="text-xs text-textSec mt-2">77.5% kapacity využito</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t('database_kpi_errors')}</h3>
					<span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded-full font-medium">{t('common_status_critical')}</span>
				</div>
				<div class="flex items-end gap-2">
					<span class="text-3xl font-bold text-error">12</span>
					<span class="text-sm text-error mb-1 flex items-center gap-1"><i class="fa-solid fa-arrow-up text-xs"></i>+7</span>
				</div>
				<p class="text-xs text-textSec mt-2">Timeout, deadlock, conn reset</p>
			</div>
		</section>

		<!-- KPI Stats Row 2 -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center">
						<i class="fa-solid fa-arrow-right-to-bracket text-[#3b82f6] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">{t('database_kpi_queriesPerMin')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">1,842</div>
				<p class="text-xs text-textSec mt-1">Peak: 3,210 qps (10:42)</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#3ecf8e]/15 flex items-center justify-center">
						<i class="fa-solid fa-copy text-[#3ecf8e] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">{t('database_kpi_replicationLag')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">18 <span class="text-sm font-normal text-textSec">ms</span></div>
				<p class="text-xs text-textSec mt-1">Replika: eu-west-1b · OK</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center">
						<i class="fa-solid fa-lock text-[#8b5cf6] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">{t('database_kpi_locks')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">3</div>
				<p class="text-xs text-textSec mt-1">Deadlocks dnes: 1</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
						<i class="fa-solid fa-shield-halved text-success text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">{t('database_kpi_backups')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">{t('database_kpi_backupStatus')}</div>
				<p class="text-xs text-textSec mt-1">Poslední: dnes 03:00 · 4.8 GB</p>
			</div>
		</section>

		<!-- Charts Row -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('database_charts_queryLatency')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('database_charts_queryLatencySubtitle')}</p>
					</div>
					<div class="flex gap-2">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5">
							<span class="w-2 h-2 rounded-full bg-[#3ecf8e] inline-block"></span>Avg
						</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5">
							<span class="w-2 h-2 rounded-full bg-[#8b5cf6] inline-block"></span>P95
						</span>
					</div>
				</div>
				<div id="chart-latency" class="h-[220px] w-full"></div>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('database_charts_connections')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('database_charts_connectionsSubtitle')}</p>
					</div>
					<div class="flex items-center gap-1.5 px-2 py-1 bg-secondary/10 border border-secondary/20 rounded text-xs text-secondary">
						<i class="fa-solid fa-triangle-exclamation text-xs"></i>
						Limit: 100
					</div>
				</div>
				<div id="chart-connections" class="h-[220px] w-full"></div>
			</div>
		</section>

		<!-- Query Distribution + Slow Queries -->
		<section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<h3 class="text-lg font-semibold text-textMain mb-1">{t('database_charts_queryTypes')}</h3>
				<p class="text-xs text-textSec mb-4">{t('database_charts_queryTypesSubtitle')}</p>
				<div id="chart-query-pie" class="h-[200px] w-full"></div>
				<div class="mt-4 space-y-2">
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block"></span><span class="text-textSec">SELECT</span></div>
						<span class="text-textMain font-medium">68%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#3ecf8e] inline-block"></span><span class="text-textSec">INSERT</span></div>
						<span class="text-textMain font-medium">18%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span><span class="text-textSec">UPDATE</span></div>
						<span class="text-textMain font-medium">11%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-error inline-block"></span><span class="text-textSec">DELETE</span></div>
						<span class="text-textMain font-medium">3%</span>
					</div>
				</div>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-5 lg:col-span-2">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('database_slowQueries_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('database_slowQueries_subtitle')}</p>
					</div>
					<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('common_timeRange_last24h')}</span>
				</div>
				<div class="space-y-3">
					<div class="flex items-start gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex-shrink-0 mt-0.5">
							<span class="px-2 py-0.5 bg-error/20 text-error text-xs font-mono rounded font-semibold">SELECT</span>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-medium font-mono truncate">SELECT * FROM orders JOIN users ON...</p>
							<p class="text-xs text-textSec mt-0.5">Tabulka: orders · Volání: 842x</p>
						</div>
						<div class="flex-shrink-0 text-right">
							<div class="text-error font-bold text-sm">1,240 ms</div>
							<div class="text-xs text-textSec">avg</div>
						</div>
					</div>
					<div class="flex items-start gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex-shrink-0 mt-0.5">
							<span class="px-2 py-0.5 bg-secondary/20 text-secondary text-xs font-mono rounded font-semibold">UPDATE</span>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-medium font-mono truncate">UPDATE products SET stock = stock - 1 WHERE...</p>
							<p class="text-xs text-textSec mt-0.5">Tabulka: products · Volání: 1,203x</p>
						</div>
						<div class="flex-shrink-0 text-right">
							<div class="text-secondary font-bold text-sm">620 ms</div>
							<div class="text-xs text-textSec">avg</div>
						</div>
					</div>
					<div class="flex items-start gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex-shrink-0 mt-0.5">
							<span class="px-2 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-mono rounded font-semibold">SELECT</span>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-medium font-mono truncate">SELECT COUNT(*) FROM analytics WHERE date &gt;</p>
							<p class="text-xs text-textSec mt-0.5">Tabulka: analytics · Volání: 312x</p>
						</div>
						<div class="flex-shrink-0 text-right">
							<div class="text-[#3b82f6] font-bold text-sm">390 ms</div>
							<div class="text-xs text-textSec">avg</div>
						</div>
					</div>
					<div class="flex items-start gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex-shrink-0 mt-0.5">
							<span class="px-2 py-0.5 bg-[#3ecf8e]/20 text-[#3ecf8e] text-xs font-mono rounded font-semibold">INSERT</span>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-medium font-mono truncate">INSERT INTO events (user_id, type, meta) VALUES...</p>
							<p class="text-xs text-textSec mt-0.5">Tabulka: events · Volání: 5,841x</p>
						</div>
						<div class="flex-shrink-0 text-right">
							<div class="text-textMain font-bold text-sm">84 ms</div>
							<div class="text-xs text-textSec">avg</div>
						</div>
					</div>
					<div class="flex items-start gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex-shrink-0 mt-0.5">
							<span class="px-2 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-mono rounded font-semibold">SELECT</span>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-medium font-mono truncate">SELECT * FROM sessions WHERE expires_at &gt; NOW()</p>
							<p class="text-xs text-textSec mt-0.5">Tabulka: sessions · Volání: 22,100x</p>
						</div>
						<div class="flex-shrink-0 text-right">
							<div class="text-textMain font-bold text-sm">31 ms</div>
							<div class="text-xs text-textSec">avg</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Table Sizes + QPS Chart -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('database_tableSizes_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('database_tableSizes_subtitle')}</p>
					</div>
				</div>
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<div class="w-24 text-xs text-textSec font-mono truncate">events</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-[#3b82f6] rounded-full" style="width:82%"></div>
						</div>
						<span class="text-xs text-textMain font-medium w-12 text-right">2.1 GB</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-24 text-xs text-textSec font-mono truncate">orders</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-[#3ecf8e] rounded-full" style="width:60%"></div>
						</div>
						<span class="text-xs text-textMain font-medium w-12 text-right">1.5 GB</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-24 text-xs text-textSec font-mono truncate">analytics</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-[#8b5cf6] rounded-full" style="width:48%"></div>
						</div>
						<span class="text-xs text-textMain font-medium w-12 text-right">1.2 GB</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-24 text-xs text-textSec font-mono truncate">users</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-secondary rounded-full" style="width:30%"></div>
						</div>
						<span class="text-xs text-textMain font-medium w-12 text-right">780 MB</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-24 text-xs text-textSec font-mono truncate">sessions</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-[#3b82f6]/60 rounded-full" style="width:18%"></div>
						</div>
						<span class="text-xs text-textMain font-medium w-12 text-right">460 MB</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-24 text-xs text-textSec font-mono truncate">products</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-[#3b82f6]/40 rounded-full" style="width:8%"></div>
						</div>
						<span class="text-xs text-textMain font-medium w-12 text-right">210 MB</span>
					</div>
				</div>
				<div class="mt-5 pt-4 border-t border-[#1e293b]">
					<div class="flex justify-between text-xs text-textSec mb-2">
						<span>{t('database_tableSizes_totalStorage')}</span>
						<span class="text-textMain font-semibold">6.2 GB / 8 GB</span>
					</div>
					<div class="w-full h-2.5 bg-[#1e293b] rounded-full overflow-hidden">
						<div class="h-full rounded-full" style="width:77%; background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)"></div>
					</div>
					<p class="text-xs text-textSec mt-2">Odhadované zaplnění při současném tempu: <span class="text-secondary font-medium">~14 dní</span></p>
				</div>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('database_charts_queriesPerMin')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('database_charts_queriesPerMinSubtitle')}</p>
					</div>
				</div>
				<div id="chart-qps" class="h-[220px] w-full"></div>
			</div>
		</section>

		<!-- DB Error Log -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-5">
			<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('database_errorLog_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('common_timeRange_last24h')} · 12 záznamů</p>
				</div>
				<div class="flex gap-3 flex-wrap">
					<div class="flex rounded-lg overflow-hidden border border-[#334155]">
						<button class="px-3 py-1.5 bg-error/20 text-error text-xs font-medium">{t('common_status_all')}</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Timeout</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Deadlock</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Conn</button>
					</div>
					<div class="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-1.5">
						<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
						<input type="text" placeholder={t('common_actions_search')} class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-32" />
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
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('database_table_columnTable')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_duration')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3">{t('common_table_status')}</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[#1e293b]/60">
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">14:32:11</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">Timeout</span></td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Connection pool exhausted – max 100 connections reached</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">orders</td>
							<td class="py-3 pr-4 text-error text-xs font-mono">30,000 ms</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded">{t('common_status_active')}</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">13:58:04</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded font-medium">Deadlock</span></td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Deadlock detected between transactions T1 and T2</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">products</td>
							<td class="py-3 pr-4 text-textSec text-xs font-mono">—</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">13:21:39</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Conn</span></td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Connection reset by peer during large SELECT query</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">analytics</td>
							<td class="py-3 pr-4 text-secondary text-xs font-mono">8,200 ms</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">12:44:17</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">Timeout</span></td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Query timeout on full table scan – missing index on user_id</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">events</td>
							<td class="py-3 pr-4 text-error text-xs font-mono">30,000 ms</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">11:05:52</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded font-medium">Lock</span></td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Row-level lock wait exceeded 10s on UPDATE statement</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">orders</td>
							<td class="py-3 pr-4 text-textSec text-xs font-mono">10,140 ms</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">{t('common_status_resolved')}</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">09:30:08</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Repl</span></td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Replication lag spike to 480ms detected on standby replica</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">—</td>
							<td class="py-3 pr-4 text-textSec text-xs font-mono">480 ms lag</td>
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

	<!-- Mobile header is rendered by +layout.svelte; just show title row here -->
	<div class="px-4 pt-3 pb-2">
		<div class="flex items-center gap-2.5">
			<div class="w-7 h-7 rounded-md bg-[#3ecf8e]/15 border border-[#3ecf8e]/30 flex items-center justify-center">
				<i class="fa-solid fa-database text-[#3ecf8e] text-xs"></i>
			</div>
			<div>
				<h1 class="text-sm font-bold text-textMain leading-tight">{t('database_header_title')}</h1>
				<p class="text-xs text-textSec">eu-west-1 · Prod</p>
			</div>
		</div>
	</div>

	<!-- Online status -->
	<div class="px-4 pb-3">
		<div class="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/20 rounded-lg text-success text-xs font-medium w-fit">
			<div class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
			{t('database_status_online')}
		</div>
	</div>

	<!-- Time range selector -->
	<div class="px-4 pb-4">
		<select class="w-full bg-card border border-[#334155] text-sm text-textMain rounded-xl px-4 py-3 focus:outline-none">
			<option>{t('common_timeRange_last24h')}</option>
			<option>{t('common_timeRange_last7d')}</option>
			<option>{t('common_timeRange_last30d')}</option>
		</select>
	</div>

	<div class="px-4 space-y-4">

		<!-- KPI Primary Stats 2×2 -->
		<section class="grid grid-cols-2 gap-3">
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-textSec text-xs font-medium">{t('database_kpi_activeConnections')}</h3>
					<span class="px-1.5 py-0.5 bg-secondary/10 text-secondary text-[10px] rounded-full font-medium">!</span>
				</div>
				<div class="flex items-end gap-1 mb-2">
					<span class="text-2xl font-bold text-textMain">87</span>
					<span class="text-xs text-textSec mb-0.5">/ 100</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden mb-1">
					<div class="h-full bg-secondary rounded-full" style="width:87%"></div>
				</div>
				<p class="text-[10px] text-secondary font-medium">Varování · 87%</p>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-textSec text-xs font-medium">{t('database_kpi_queryLatency')}</h3>
					<span class="px-1.5 py-0.5 bg-success/10 text-success text-[10px] rounded-full font-medium">OK</span>
				</div>
				<div class="flex items-end gap-1 mb-1">
					<span class="text-2xl font-bold text-textMain">24</span>
					<span class="text-xs text-textSec mb-0.5">ms</span>
					<span class="text-xs text-success mb-0.5 flex items-center gap-0.5 ml-1"><i class="fa-solid fa-arrow-down text-[9px]"></i>-3ms</span>
				</div>
				<p class="text-[10px] text-textSec">P95: 142ms · P99: 380ms</p>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-textSec text-xs font-medium">{t('database_kpi_storage')}</h3>
					<span class="px-1.5 py-0.5 bg-success/10 text-success text-[10px] rounded-full font-medium">OK</span>
				</div>
				<div class="flex items-end gap-1 mb-2">
					<span class="text-2xl font-bold text-textMain">6.2</span>
					<span class="text-xs text-textSec mb-0.5">/ 8 GB</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden mb-1">
					<div class="h-full bg-[#3b82f6] rounded-full" style="width:77%"></div>
				</div>
				<p class="text-[10px] text-textSec">77.5% využito</p>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-textSec text-xs font-medium">{t('database_kpi_errors')}</h3>
					<span class="px-1.5 py-0.5 bg-error/10 text-error text-[10px] rounded-full font-medium">{t('common_status_critical')}</span>
				</div>
				<div class="flex items-end gap-1 mb-1">
					<span class="text-2xl font-bold text-error">12</span>
					<span class="text-xs text-error mb-0.5 flex items-center gap-0.5"><i class="fa-solid fa-arrow-up text-[9px]"></i>+7</span>
				</div>
				<p class="text-[10px] text-textSec">Timeout, deadlock</p>
			</div>
		</section>

		<!-- Secondary Stats horizontal scroll -->
		<section class="flex gap-3 overflow-x-auto pb-1">
			<div class="bg-card border border-[#1e293b] rounded-xl p-4 flex-shrink-0 w-36">
				<div class="w-7 h-7 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center mb-2">
					<i class="fa-solid fa-arrow-right-to-bracket text-[#3b82f6] text-xs"></i>
				</div>
				<div class="text-lg font-bold text-textMain">1,842</div>
				<p class="text-[10px] text-textSec mt-0.5">{t('database_kpi_queriesPerMin')}</p>
				<p class="text-[10px] text-textSec">Peak: 3,210 qps</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-4 flex-shrink-0 w-36">
				<div class="w-7 h-7 rounded-lg bg-[#3ecf8e]/15 flex items-center justify-center mb-2">
					<i class="fa-solid fa-copy text-[#3ecf8e] text-xs"></i>
				</div>
				<div class="text-lg font-bold text-textMain">18 <span class="text-xs font-normal text-textSec">ms</span></div>
				<p class="text-[10px] text-textSec mt-0.5">{t('database_kpi_replicationLag')}</p>
				<p class="text-[10px] text-textSec">eu-west-1b · OK</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-4 flex-shrink-0 w-36">
				<div class="w-7 h-7 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center mb-2">
					<i class="fa-solid fa-lock text-[#8b5cf6] text-xs"></i>
				</div>
				<div class="text-lg font-bold text-textMain">3</div>
				<p class="text-[10px] text-textSec mt-0.5">{t('database_kpi_locks')}</p>
				<p class="text-[10px] text-textSec">Deadlocks: 1</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-4 flex-shrink-0 w-36">
				<div class="w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center mb-2">
					<i class="fa-solid fa-shield-halved text-success text-xs"></i>
				</div>
				<div class="text-base font-bold text-textMain">{t('database_kpi_backupStatus')}</div>
				<p class="text-[10px] text-textSec mt-0.5">{t('database_kpi_backups')}</p>
				<p class="text-[10px] text-textSec">03:00 · 4.8 GB</p>
			</div>
		</section>

		<!-- Charts Accordions -->
		<section class="space-y-3">

			<!-- Query Latency -->
			<div class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
				<button
					onclick={() => (latencyOpen = !latencyOpen)}
					class="w-full flex items-center justify-between px-4 py-4 text-left"
				>
					<div>
						<h3 class="text-sm font-semibold text-textMain">{t('database_charts_queryLatency')}</h3>
						<p class="text-[10px] text-textSec mt-0.5">{t('database_charts_queryLatencySubtitle')}</p>
					</div>
					<div class="flex items-center gap-3">
						<div class="flex gap-1.5">
							<span class="flex items-center gap-1 text-[10px] text-textSec"><span class="w-1.5 h-1.5 rounded-full bg-[#3ecf8e] inline-block"></span>Avg</span>
							<span class="flex items-center gap-1 text-[10px] text-textSec"><span class="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] inline-block"></span>P95</span>
						</div>
						<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {latencyOpen ? 'rotate-180' : ''}"></i>
					</div>
				</button>
				{#if latencyOpen}
					<div class="px-4 pb-4">
						<div id="chart-latency-m" class="w-full" style="height:200px;"></div>
					</div>
				{/if}
			</div>

			<!-- Active Connections -->
			<div class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
				<button
					onclick={() => (connectionsOpen = !connectionsOpen)}
					class="w-full flex items-center justify-between px-4 py-4 text-left"
				>
					<div>
						<h3 class="text-sm font-semibold text-textMain">{t('database_charts_connections')}</h3>
						<p class="text-[10px] text-textSec mt-0.5">{t('database_charts_connectionsSubtitle')}</p>
					</div>
					<div class="flex items-center gap-3">
						<div class="flex items-center gap-1 px-2 py-1 bg-secondary/10 border border-secondary/20 rounded text-[10px] text-secondary">
							<i class="fa-solid fa-triangle-exclamation text-[9px]"></i> Limit: 100
						</div>
						<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {connectionsOpen ? 'rotate-180' : ''}"></i>
					</div>
				</button>
				{#if connectionsOpen}
					<div class="px-4 pb-4">
						<div id="chart-connections-m" class="w-full" style="height:200px;"></div>
					</div>
				{/if}
			</div>

			<!-- QPS -->
			<div class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
				<button
					onclick={() => (qpsOpen = !qpsOpen)}
					class="w-full flex items-center justify-between px-4 py-4 text-left"
				>
					<div>
						<h3 class="text-sm font-semibold text-textMain">{t('database_charts_queriesPerMin')}</h3>
						<p class="text-[10px] text-textSec mt-0.5">{t('database_charts_queriesPerMinSubtitle')}</p>
					</div>
					<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {qpsOpen ? 'rotate-180' : ''}"></i>
				</button>
				{#if qpsOpen}
					<div class="px-4 pb-4">
						<div id="chart-qps-m" class="w-full" style="height:200px;"></div>
					</div>
				{/if}
			</div>
		</section>

		<!-- Query Types Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				onclick={() => (queryTypesOpen = !queryTypesOpen)}
				class="w-full flex items-center justify-between px-4 py-4 text-left"
			>
				<div>
					<h3 class="text-sm font-semibold text-textMain">{t('database_charts_queryTypes')}</h3>
					<p class="text-[10px] text-textSec mt-0.5">{t('database_charts_queryTypesSubtitle')}</p>
				</div>
				<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {queryTypesOpen ? 'rotate-180' : ''}"></i>
			</button>
			{#if queryTypesOpen}
				<div class="px-4 pb-5">
					<div id="chart-query-pie-m" class="w-full" style="height:180px;"></div>
					<div class="mt-3 grid grid-cols-2 gap-2">
						<div class="flex items-center justify-between bg-[#1e293b]/40 rounded-lg px-3 py-2">
							<div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#3b82f6] inline-block"></span><span class="text-textSec text-xs">SELECT</span></div>
							<span class="text-textMain text-xs font-semibold">68%</span>
						</div>
						<div class="flex items-center justify-between bg-[#1e293b]/40 rounded-lg px-3 py-2">
							<div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#3ecf8e] inline-block"></span><span class="text-textSec text-xs">INSERT</span></div>
							<span class="text-textMain text-xs font-semibold">18%</span>
						</div>
						<div class="flex items-center justify-between bg-[#1e293b]/40 rounded-lg px-3 py-2">
							<div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-secondary inline-block"></span><span class="text-textSec text-xs">UPDATE</span></div>
							<span class="text-textMain text-xs font-semibold">11%</span>
						</div>
						<div class="flex items-center justify-between bg-[#1e293b]/40 rounded-lg px-3 py-2">
							<div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-error inline-block"></span><span class="text-textSec text-xs">DELETE</span></div>
							<span class="text-textMain text-xs font-semibold">3%</span>
						</div>
					</div>
				</div>
			{/if}
		</section>

		<!-- Slow Queries Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				onclick={() => (slowQueriesOpen = !slowQueriesOpen)}
				class="w-full flex items-center justify-between px-4 py-4 text-left"
			>
				<div>
					<h3 class="text-sm font-semibold text-textMain">{t('database_slowQueries_title')}</h3>
					<p class="text-[10px] text-textSec mt-0.5">Top 5 · {t('common_timeRange_last24h')}</p>
				</div>
				<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {slowQueriesOpen ? 'rotate-180' : ''}"></i>
			</button>
			{#if slowQueriesOpen}
				<div class="px-4 pb-4 space-y-2">
					<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex items-start justify-between gap-2 mb-1.5">
							<span class="px-2 py-0.5 bg-error/20 text-error text-[10px] font-mono rounded font-semibold flex-shrink-0">SELECT</span>
							<span class="text-error font-bold text-sm">1,240 ms</span>
						</div>
						<p class="text-textMain text-xs font-mono truncate">SELECT * FROM orders JOIN users ON...</p>
						<p class="text-[10px] text-textSec mt-1">orders · 842 volání</p>
					</div>
					<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex items-start justify-between gap-2 mb-1.5">
							<span class="px-2 py-0.5 bg-secondary/20 text-secondary text-[10px] font-mono rounded font-semibold flex-shrink-0">UPDATE</span>
							<span class="text-secondary font-bold text-sm">620 ms</span>
						</div>
						<p class="text-textMain text-xs font-mono truncate">UPDATE products SET stock = stock - 1 WHERE...</p>
						<p class="text-[10px] text-textSec mt-1">products · 1,203 volání</p>
					</div>
					<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex items-start justify-between gap-2 mb-1.5">
							<span class="px-2 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] text-[10px] font-mono rounded font-semibold flex-shrink-0">SELECT</span>
							<span class="text-[#3b82f6] font-bold text-sm">390 ms</span>
						</div>
						<p class="text-textMain text-xs font-mono truncate">SELECT COUNT(*) FROM analytics WHERE date &gt;</p>
						<p class="text-[10px] text-textSec mt-1">analytics · 312 volání</p>
					</div>
					<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex items-start justify-between gap-2 mb-1.5">
							<span class="px-2 py-0.5 bg-[#3ecf8e]/20 text-[#3ecf8e] text-[10px] font-mono rounded font-semibold flex-shrink-0">INSERT</span>
							<span class="text-textMain font-bold text-sm">84 ms</span>
						</div>
						<p class="text-textMain text-xs font-mono truncate">INSERT INTO events (user_id, type, meta) VALUES...</p>
						<p class="text-[10px] text-textSec mt-1">events · 5,841 volání</p>
					</div>
					<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex items-start justify-between gap-2 mb-1.5">
							<span class="px-2 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] text-[10px] font-mono rounded font-semibold flex-shrink-0">SELECT</span>
							<span class="text-textMain font-bold text-sm">31 ms</span>
						</div>
						<p class="text-textMain text-xs font-mono truncate">SELECT * FROM sessions WHERE expires_at &gt; NOW()</p>
						<p class="text-[10px] text-textSec mt-1">sessions · 22,100 volání</p>
					</div>
				</div>
			{/if}
		</section>

		<!-- Table Sizes Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				onclick={() => (tableSizesOpen = !tableSizesOpen)}
				class="w-full flex items-center justify-between px-4 py-4 text-left"
			>
				<div>
					<h3 class="text-sm font-semibold text-textMain">{t('database_tableSizes_title')}</h3>
					<p class="text-[10px] text-textSec mt-0.5">{t('database_tableSizes_subtitle')}</p>
				</div>
				<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {tableSizesOpen ? 'rotate-180' : ''}"></i>
			</button>
			{#if tableSizesOpen}
				<div class="px-4 pb-5 space-y-3">
					<div class="flex items-center gap-3">
						<div class="w-16 text-xs text-textSec font-mono">events</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-[#3b82f6] rounded-full" style="width:82%"></div>
						</div>
						<span class="text-xs text-textMain font-medium w-14 text-right">2.1 GB</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-16 text-xs text-textSec font-mono">orders</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-[#3ecf8e] rounded-full" style="width:60%"></div>
						</div>
						<span class="text-xs text-textMain font-medium w-14 text-right">1.5 GB</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-16 text-xs text-textSec font-mono">analytics</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-[#8b5cf6] rounded-full" style="width:48%"></div>
						</div>
						<span class="text-xs text-textMain font-medium w-14 text-right">1.2 GB</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-16 text-xs text-textSec font-mono">users</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-secondary rounded-full" style="width:30%"></div>
						</div>
						<span class="text-xs text-textMain font-medium w-14 text-right">780 MB</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-16 text-xs text-textSec font-mono">sessions</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-[#3b82f6]/60 rounded-full" style="width:18%"></div>
						</div>
						<span class="text-xs text-textMain font-medium w-14 text-right">460 MB</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="w-16 text-xs text-textSec font-mono">products</div>
						<div class="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-[#3b82f6]/40 rounded-full" style="width:8%"></div>
						</div>
						<span class="text-xs text-textMain font-medium w-14 text-right">210 MB</span>
					</div>
					<div class="mt-2 pt-4 border-t border-[#1e293b]">
						<div class="flex justify-between text-xs text-textSec mb-2">
							<span>{t('database_tableSizes_totalStorage')}</span>
							<span class="text-textMain font-semibold">6.2 GB / 8 GB</span>
						</div>
						<div class="w-full h-2.5 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full rounded-full" style="width:77%; background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)"></div>
						</div>
						<p class="text-xs text-textSec mt-2">Odhadované zaplnění: <span class="text-secondary font-medium">~14 dní</span></p>
					</div>
				</div>
			{/if}
		</section>

		<!-- Error Log -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<div class="px-4 pt-4 pb-3 border-b border-[#1e293b]">
				<div class="flex items-center justify-between mb-3">
					<div>
						<h3 class="text-sm font-semibold text-textMain">{t('database_errorLog_title')}</h3>
						<p class="text-[10px] text-textSec mt-0.5">{t('common_timeRange_last24h')} · 12 záznamů</p>
					</div>
				</div>
				<div class="flex gap-2 mb-3 overflow-x-auto pb-1">
					<button class="px-3 py-1.5 bg-error/20 text-error text-xs font-medium rounded-lg whitespace-nowrap flex-shrink-0">{t('common_status_all')}</button>
					<button class="px-3 py-1.5 bg-[#1e293b] text-textSec text-xs font-medium rounded-lg whitespace-nowrap flex-shrink-0 hover:text-white transition-colors">Timeout</button>
					<button class="px-3 py-1.5 bg-[#1e293b] text-textSec text-xs font-medium rounded-lg whitespace-nowrap flex-shrink-0 hover:text-white transition-colors">Deadlock</button>
					<button class="px-3 py-1.5 bg-[#1e293b] text-textSec text-xs font-medium rounded-lg whitespace-nowrap flex-shrink-0 hover:text-white transition-colors">Conn</button>
				</div>
				<div class="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-2.5">
					<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
					<input type="text" placeholder={t('common_actions_search')} class="bg-transparent text-sm text-textMain placeholder-textSec outline-none flex-1" />
				</div>
			</div>

			<div class="divide-y divide-[#1e293b]/60">
				<div class="px-4 py-3">
					<div class="flex items-start justify-between gap-2 mb-1">
						<div class="flex items-center gap-2 flex-wrap">
							<span class="px-2 py-0.5 bg-error/15 text-error text-[10px] rounded font-medium">Timeout</span>
							<span class="px-2 py-0.5 bg-error/10 text-error text-[10px] rounded">{t('common_status_active')}</span>
						</div>
						<span class="text-[10px] text-textSec font-mono flex-shrink-0">14:32:11</span>
					</div>
					<p class="text-xs text-textMain mt-1 leading-relaxed">Connection pool exhausted – max 100 connections reached</p>
					<div class="flex items-center gap-3 mt-1.5">
						<span class="text-[10px] text-textSec font-mono">orders</span>
						<span class="text-error text-[10px] font-mono font-semibold">30,000 ms</span>
					</div>
				</div>

				<div class="px-4 py-3">
					<div class="flex items-start justify-between gap-2 mb-1">
						<div class="flex items-center gap-2 flex-wrap">
							<span class="px-2 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-[10px] rounded font-medium">Deadlock</span>
							<span class="px-2 py-0.5 bg-success/10 text-success text-[10px] rounded">{t('common_status_resolved')}</span>
						</div>
						<span class="text-[10px] text-textSec font-mono flex-shrink-0">13:58:04</span>
					</div>
					<p class="text-xs text-textMain mt-1 leading-relaxed">Deadlock detected between transactions T1 and T2</p>
					<div class="flex items-center gap-3 mt-1.5">
						<span class="text-[10px] text-textSec font-mono">products</span>
						<span class="text-textSec text-[10px] font-mono">—</span>
					</div>
				</div>

				<div class="px-4 py-3">
					<div class="flex items-start justify-between gap-2 mb-1">
						<div class="flex items-center gap-2 flex-wrap">
							<span class="px-2 py-0.5 bg-secondary/15 text-secondary text-[10px] rounded font-medium">Conn</span>
							<span class="px-2 py-0.5 bg-success/10 text-success text-[10px] rounded">{t('common_status_resolved')}</span>
						</div>
						<span class="text-[10px] text-textSec font-mono flex-shrink-0">13:21:39</span>
					</div>
					<p class="text-xs text-textMain mt-1 leading-relaxed">Connection reset by peer during large SELECT query</p>
					<div class="flex items-center gap-3 mt-1.5">
						<span class="text-[10px] text-textSec font-mono">analytics</span>
						<span class="text-secondary text-[10px] font-mono font-semibold">8,200 ms</span>
					</div>
				</div>

				<div class="px-4 py-3">
					<div class="flex items-start justify-between gap-2 mb-1">
						<div class="flex items-center gap-2 flex-wrap">
							<span class="px-2 py-0.5 bg-error/15 text-error text-[10px] rounded font-medium">Timeout</span>
							<span class="px-2 py-0.5 bg-success/10 text-success text-[10px] rounded">{t('common_status_resolved')}</span>
						</div>
						<span class="text-[10px] text-textSec font-mono flex-shrink-0">12:44:17</span>
					</div>
					<p class="text-xs text-textMain mt-1 leading-relaxed">Query timeout on full table scan – missing index on user_id</p>
					<div class="flex items-center gap-3 mt-1.5">
						<span class="text-[10px] text-textSec font-mono">events</span>
						<span class="text-error text-[10px] font-mono font-semibold">30,000 ms</span>
					</div>
				</div>

				<div class="px-4 py-3">
					<div class="flex items-start justify-between gap-2 mb-1">
						<div class="flex items-center gap-2 flex-wrap">
							<span class="px-2 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-[10px] rounded font-medium">Lock</span>
							<span class="px-2 py-0.5 bg-success/10 text-success text-[10px] rounded">{t('common_status_resolved')}</span>
						</div>
						<span class="text-[10px] text-textSec font-mono flex-shrink-0">11:05:52</span>
					</div>
					<p class="text-xs text-textMain mt-1 leading-relaxed">Row-level lock wait exceeded 10s on UPDATE statement</p>
					<div class="flex items-center gap-3 mt-1.5">
						<span class="text-[10px] text-textSec font-mono">orders</span>
						<span class="text-textSec text-[10px] font-mono">10,140 ms</span>
					</div>
				</div>

				<div class="px-4 py-3">
					<div class="flex items-start justify-between gap-2 mb-1">
						<div class="flex items-center gap-2 flex-wrap">
							<span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-[10px] rounded font-medium">Repl</span>
							<span class="px-2 py-0.5 bg-success/10 text-success text-[10px] rounded">{t('common_status_resolved')}</span>
						</div>
						<span class="text-[10px] text-textSec font-mono flex-shrink-0">09:30:08</span>
					</div>
					<p class="text-xs text-textMain mt-1 leading-relaxed">Replication lag spike to 480ms detected on standby replica</p>
					<div class="flex items-center gap-3 mt-1.5">
						<span class="text-[10px] text-textSec font-mono">—</span>
						<span class="text-textSec text-[10px] font-mono">480 ms lag</span>
					</div>
				</div>
			</div>
		</section>

	</div>

	<!-- Bottom Navigation -->
	<nav class="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-[#1e293b] flex items-center justify-around px-2 py-2">
		<a href="{base}/" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-white transition-colors min-w-[44px]">
			<i class="fa-solid fa-gauge-high text-base"></i>
			<span class="text-[9px] font-medium">{t('layout_nav_dashboard')}</span>
		</a>
		<a href="{base}/dostupnost" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-white transition-colors min-w-[44px]">
			<i class="fa-solid fa-server text-base"></i>
			<span class="text-[9px] font-medium">{t('layout_nav_availability')}</span>
		</a>
		<a href="{base}/databaze" class="flex flex-col items-center gap-1 px-3 py-2 text-[#3ecf8e] min-w-[44px]">
			<i class="fa-solid fa-database text-base"></i>
			<span class="text-[9px] font-semibold">{t('layout_nav_database')}</span>
		</a>
		<a href="{base}/performance" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-white transition-colors min-w-[44px]">
			<i class="fa-solid fa-bolt text-base"></i>
			<span class="text-[9px] font-medium">{t('layout_nav_performance')}</span>
		</a>
		<a href="{base}/nastaveni" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-white transition-colors min-w-[44px]">
			<i class="fa-solid fa-gear text-base"></i>
			<span class="text-[9px] font-medium">{t('layout_nav_settings')}</span>
		</a>
	</nav>

</div>
