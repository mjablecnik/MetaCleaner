<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let activeChart = $state<'cpu' | 'ram' | 'response' | 'network'>('cpu');
	let instancesOpen = $state(true);
	let deploysOpen = $state(false);
	let errorsOpen = $state(true);

	onMount(() => {
		const Plotly = (window as any).Plotly;
		if (!Plotly) return;

		const bgCard = '#111d33';
		const textSec = '#94a3b8';
		const errorColor = '#ef4444';
		const secondaryColor = '#f97316';
		const purpleColor = '#a78bfa';
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
				text: '<b style="font-size:18px;color:#fff">94.2%</b><br><span style="font-size:10px;color:#94a3b8">2xx OK</span>',
				x: 0.5, y: 0.5,
				xanchor: 'center', yanchor: 'middle',
				showarrow: false,
				font: { size: 13, color: '#ffffff' }
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
				text: '<b style="font-size:14px;color:#fff">94.2%</b>',
				x: 0.5, y: 0.5, xanchor: 'center', yanchor: 'middle',
				showarrow: false, font: { size: 11, color: '#ffffff' }
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
	<header class="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-[#1e293b] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<div class="w-9 h-9 rounded-lg bg-[#a78bfa]/15 border border-[#a78bfa]/30 flex items-center justify-center">
				<i class="fa-solid fa-microchip text-[#a78bfa] text-sm"></i>
			</div>
			<div>
				<h1 class="text-2xl font-bold text-textMain">Runtime (Fly.io)</h1>
				<p class="text-sm text-textSec mt-0.5">Produkční prostředí • Region: fra (Frankfurt) • Posledních 24 hodin</p>
			</div>
		</div>
		<div class="flex items-center gap-3 flex-wrap">
			<div class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium">
				<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
				3 / 3 Mašiny online
			</div>
			<select class="bg-[#1e293b] border border-[#334155] text-sm text-textMain rounded-lg px-3 py-2 focus:outline-none">
				<option>Posledních 24 hodin</option>
				<option>Posledních 7 dní</option>
				<option>Posledních 30 dní</option>
			</select>
			<button class="px-4 py-2 bg-[#1e293b] hover:bg-[#2d3748] text-white rounded-lg text-sm font-medium transition-colors border border-[#334155]">
				<i class="fa-solid fa-download mr-2"></i>Export
			</button>
		</div>
	</header>

	<div class="p-6 max-w-7xl mx-auto space-y-6">

		<!-- KPI Stats Row 1 -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">CPU Využití</h3>
					<span class="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full font-medium">Varování</span>
				</div>
				<div class="flex items-end gap-2 mb-3">
					<span class="text-3xl font-bold text-textMain">74</span>
					<span class="text-sm text-textSec mb-1">%</span>
					<span class="text-sm text-secondary mb-1 flex items-center gap-1 ml-1"><i class="fa-solid fa-arrow-up text-xs"></i>+12%</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full bg-secondary rounded-full" style="width:74%"></div>
				</div>
				<p class="text-xs text-textSec mt-2">Peak: 91% · avg 3 strojů</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">RAM Využití</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">OK</span>
				</div>
				<div class="flex items-end gap-2 mb-3">
					<span class="text-3xl font-bold text-textMain">1.8</span>
					<span class="text-sm text-textSec mb-1">/ 4 GB</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full bg-[#3b82f6] rounded-full" style="width:45%"></div>
				</div>
				<p class="text-xs text-textSec mt-2">45% · bez memory leaků</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">Uptime (30 dní)</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">OK</span>
				</div>
				<div class="flex items-end gap-2">
					<span class="text-3xl font-bold text-success">99.97</span>
					<span class="text-sm text-textSec mb-1">%</span>
				</div>
				<p class="text-xs text-textSec mt-2">Výpadek: 8 min · 1 incident</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">Restarty (24h)</h3>
					<span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded-full font-medium">Kritické</span>
				</div>
				<div class="flex items-end gap-2">
					<span class="text-3xl font-bold text-error">5</span>
					<span class="text-sm text-error mb-1 flex items-center gap-1"><i class="fa-solid fa-arrow-up text-xs"></i>+3</span>
				</div>
				<p class="text-xs text-textSec mt-2">OOM kill: 2 · Crash: 3</p>
			</div>
		</section>

		<!-- KPI Stats Row 2 -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#a78bfa]/15 flex items-center justify-center">
						<i class="fa-solid fa-network-wired text-[#a78bfa] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">Aktivní instance</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">3 <span class="text-sm font-normal text-textSec">/ 5 max</span></div>
				<p class="text-xs text-textSec mt-1">Autoscale: OFF · fra region</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#3ecf8e]/15 flex items-center justify-center">
						<i class="fa-solid fa-arrows-left-right text-[#3ecf8e] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">Síťový provoz</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">2.4 <span class="text-sm font-normal text-textSec">GB/h</span></div>
				<p class="text-xs text-textSec mt-1">IN: 840 MB · OUT: 1.56 GB</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center">
						<i class="fa-solid fa-clock text-[#3b82f6] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">Avg. Response Time</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">112 <span class="text-sm font-normal text-textSec">ms</span></div>
				<p class="text-xs text-textSec mt-1">P99: 840ms · P95: 420ms</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center">
						<i class="fa-solid fa-rocket text-secondary text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">Posl. deploy</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">v2.14.1</div>
				<p class="text-xs text-textSec mt-1">Dnes 11:04 · 38s deploy time</p>
			</div>
		</section>

		<!-- Charts Row: CPU + RAM -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">CPU využití v čase</h3>
						<p class="text-xs text-textSec mt-0.5">Průměr přes všechny instance</p>
					</div>
					<div class="flex gap-2">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#a78bfa] inline-block"></span>CPU %</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#f97316] inline-block"></span>Peak</span>
					</div>
				</div>
				<div id="chart-cpu" class="h-[220px] w-full"></div>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">RAM využití v čase</h3>
						<p class="text-xs text-textSec mt-0.5">Heap & RSS paměť aplikace</p>
					</div>
					<div class="flex items-center gap-1.5 px-2 py-1 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded text-xs text-[#3b82f6]">
						<i class="fa-solid fa-memory text-xs"></i>
						Limit: 4 GB
					</div>
				</div>
				<div id="chart-ram" class="h-[220px] w-full"></div>
			</div>
		</section>

		<!-- Instances + Response Time / Network -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Instances -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-5">
					<div>
						<h3 class="text-lg font-semibold text-textMain">Stav instancí (Machines)</h3>
						<p class="text-xs text-textSec mt-0.5">Fly.io · region: fra · 3 aktivní</p>
					</div>
					<button class="flex items-center gap-2 px-3 py-1.5 bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded-lg text-[#a78bfa] text-xs font-medium hover:bg-[#a78bfa]/20 transition-colors">
						<i class="fa-solid fa-plus text-xs"></i>Škálovat
					</button>
				</div>
				<div class="space-y-3">
					<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-3">
								<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
								<span class="text-textMain font-medium text-sm font-mono">fra-01 · 4d4e555f</span>
								<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">running</span>
							</div>
							<span class="text-xs text-textSec">shared-cpu-2x · 2 GB RAM</span>
						</div>
						<div class="grid grid-cols-3 gap-3">
							<div>
								<div class="text-xs text-textSec mb-1">CPU</div>
								<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
									<div class="h-full bg-[#a78bfa] rounded-full" style="width:68%"></div>
								</div>
								<div class="text-xs text-textMain mt-1">68%</div>
							</div>
							<div>
								<div class="text-xs text-textSec mb-1">RAM</div>
								<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
									<div class="h-full bg-[#3b82f6] rounded-full" style="width:44%"></div>
								</div>
								<div class="text-xs text-textMain mt-1">880 MB</div>
							</div>
							<div>
								<div class="text-xs text-textSec mb-1">Uptime</div>
								<div class="text-xs text-textMain mt-1 font-mono">18h 42m</div>
							</div>
						</div>
					</div>
					<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-3">
								<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
								<span class="text-textMain font-medium text-sm font-mono">fra-02 · 7f8a992b</span>
								<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">running</span>
							</div>
							<span class="text-xs text-textSec">shared-cpu-2x · 2 GB RAM</span>
						</div>
						<div class="grid grid-cols-3 gap-3">
							<div>
								<div class="text-xs text-textSec mb-1">CPU</div>
								<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
									<div class="h-full bg-secondary rounded-full" style="width:91%"></div>
								</div>
								<div class="text-xs text-secondary mt-1">91% ⚠</div>
							</div>
							<div>
								<div class="text-xs text-textSec mb-1">RAM</div>
								<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
									<div class="h-full bg-[#3b82f6] rounded-full" style="width:52%"></div>
								</div>
								<div class="text-xs text-textMain mt-1">1.04 GB</div>
							</div>
							<div>
								<div class="text-xs text-textSec mb-1">Uptime</div>
								<div class="text-xs text-textMain mt-1 font-mono">3h 18m</div>
							</div>
						</div>
					</div>
					<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-3">
								<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
								<span class="text-textMain font-medium text-sm font-mono">fra-03 · b1c2d3e4</span>
								<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">running</span>
							</div>
							<span class="text-xs text-textSec">shared-cpu-2x · 2 GB RAM</span>
						</div>
						<div class="grid grid-cols-3 gap-3">
							<div>
								<div class="text-xs text-textSec mb-1">CPU</div>
								<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
									<div class="h-full bg-[#a78bfa] rounded-full" style="width:62%"></div>
								</div>
								<div class="text-xs text-textMain mt-1">62%</div>
							</div>
							<div>
								<div class="text-xs text-textSec mb-1">RAM</div>
								<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
									<div class="h-full bg-[#3b82f6] rounded-full" style="width:38%"></div>
								</div>
								<div class="text-xs text-textMain mt-1">760 MB</div>
							</div>
							<div>
								<div class="text-xs text-textSec mb-1">Uptime</div>
								<div class="text-xs text-textMain mt-1 font-mono">18h 42m</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Response Time + Network stacked -->
			<div class="flex flex-col gap-6">
				<div class="bg-card border border-[#1e293b] rounded-xl p-5">
					<div class="flex justify-between items-center mb-4">
						<div>
							<h3 class="text-lg font-semibold text-textMain">Response time</h3>
							<p class="text-xs text-textSec mt-0.5">HTTP odpovědi aplikace v čase</p>
						</div>
						<div class="flex gap-2">
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3ecf8e] inline-block"></span>P50</span>
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#f97316] inline-block"></span>P99</span>
						</div>
					</div>
					<div id="chart-response" class="h-[160px] w-full"></div>
				</div>
				<div class="bg-card border border-[#1e293b] rounded-xl p-5">
					<div class="flex justify-between items-center mb-4">
						<div>
							<h3 class="text-lg font-semibold text-textMain">Síťový provoz</h3>
							<p class="text-xs text-textSec mt-0.5">Ingress / Egress za hodinu</p>
						</div>
						<div class="flex gap-2">
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3b82f6] inline-block"></span>IN</span>
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3ecf8e] inline-block"></span>OUT</span>
						</div>
					</div>
					<div id="chart-network" class="h-[160px] w-full"></div>
				</div>
			</div>
		</section>

		<!-- Deploy History + Error Log -->
		<section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Deploy History -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">Historie deployů</h3>
						<p class="text-xs text-textSec mt-0.5">Posledních 7 dní</p>
					</div>
					<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">7 dní</span>
				</div>
				<div class="space-y-3">
					<div class="flex items-start gap-3">
						<div class="mt-1 w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-check text-success text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<span class="text-textMain text-sm font-semibold">v2.14.1</span>
								<span class="text-xs text-textSec">Dnes 11:04</span>
							</div>
							<p class="text-xs text-textSec mt-0.5 truncate">Fix: memory leak in session handler</p>
							<p class="text-xs text-textSec mt-0.5">38s · 3 stroje ✓</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="mt-1 w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-check text-success text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<span class="text-textMain text-sm font-semibold">v2.14.0</span>
								<span class="text-xs text-textSec">Včera 16:32</span>
							</div>
							<p class="text-xs text-textSec mt-0.5 truncate">feat: nový API endpoint /v2/orders</p>
							<p class="text-xs text-textSec mt-0.5">44s · 3 stroje ✓</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="mt-1 w-7 h-7 rounded-lg bg-error/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-xmark text-error text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<span class="text-textMain text-sm font-semibold">v2.13.9</span>
								<span class="text-xs text-textSec">2 dny 09:15</span>
							</div>
							<p class="text-xs text-error mt-0.5 truncate">Failed: health check timeout</p>
							<p class="text-xs text-textSec mt-0.5">Rollback → v2.13.8</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="mt-1 w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-check text-success text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<span class="text-textMain text-sm font-semibold">v2.13.8</span>
								<span class="text-xs text-textSec">3 dny 14:00</span>
							</div>
							<p class="text-xs text-textSec mt-0.5 truncate">chore: deps update, perf patches</p>
							<p class="text-xs text-textSec mt-0.5">41s · 3 stroje ✓</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="mt-1 w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-check text-success text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<span class="text-textMain text-sm font-semibold">v2.13.7</span>
								<span class="text-xs text-textSec">5 dní 08:22</span>
							</div>
							<p class="text-xs text-textSec mt-0.5 truncate">fix: rate limiter edge case</p>
							<p class="text-xs text-textSec mt-0.5">36s · 3 stroje ✓</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Runtime Error Log -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-5 lg:col-span-2">
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
					<div>
						<h3 class="text-lg font-semibold text-textMain">Runtime error log</h3>
						<p class="text-xs text-textSec mt-0.5">Posledních 24 hodin · 8 záznamů</p>
					</div>
					<div class="flex gap-3 flex-wrap">
						<div class="flex rounded-lg overflow-hidden border border-[#334155]">
							<button class="px-3 py-1.5 bg-error/20 text-error text-xs font-medium">Všechny</button>
							<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">OOM</button>
							<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Crash</button>
							<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Health</button>
						</div>
						<div class="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-1.5">
							<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
							<input type="text" placeholder="Hledat..." class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-28" />
						</div>
					</div>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-[#1e293b]">
								<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">Čas</th>
								<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">Instance</th>
								<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">Typ</th>
								<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">Zpráva</th>
								<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3">Status</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-[#1e293b]/60">
							<tr class="hover:bg-[#1e293b]/30 transition-colors">
								<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">14:51:02</td>
								<td class="py-3 pr-4 text-textSec font-mono text-xs">fra-02</td>
								<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">OOM Kill</span></td>
								<td class="py-3 pr-4 text-textMain max-w-xs truncate text-xs">Process killed – exceeded 2 GB memory limit</td>
								<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Restartováno</span></td>
							</tr>
							<tr class="hover:bg-[#1e293b]/30 transition-colors">
								<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">13:22:44</td>
								<td class="py-3 pr-4 text-textSec font-mono text-xs">fra-02</td>
								<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Crash</span></td>
								<td class="py-3 pr-4 text-textMain max-w-xs truncate text-xs">Unhandled exception in /api/v2/orders handler</td>
								<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Restartováno</span></td>
							</tr>
							<tr class="hover:bg-[#1e293b]/30 transition-colors">
								<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">11:08:31</td>
								<td class="py-3 pr-4 text-textSec font-mono text-xs">fra-01</td>
								<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Health</span></td>
								<td class="py-3 pr-4 text-textMain max-w-xs truncate text-xs">Health check failed 3x – /health returned 503</td>
								<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span></td>
							</tr>
							<tr class="hover:bg-[#1e293b]/30 transition-colors">
								<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">10:44:19</td>
								<td class="py-3 pr-4 text-textSec font-mono text-xs">fra-02</td>
								<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Crash</span></td>
								<td class="py-3 pr-4 text-textMain max-w-xs truncate text-xs">SIGKILL received after 30s startup timeout</td>
								<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span></td>
							</tr>
							<tr class="hover:bg-[#1e293b]/30 transition-colors">
								<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">08:17:55</td>
								<td class="py-3 pr-4 text-textSec font-mono text-xs">fra-03</td>
								<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">OOM Kill</span></td>
								<td class="py-3 pr-4 text-textMain max-w-xs truncate text-xs">RSS memory exceeded limit during batch job</td>
								<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Restartováno</span></td>
							</tr>
							<tr class="hover:bg-[#1e293b]/30 transition-colors">
								<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">06:03:12</td>
								<td class="py-3 pr-4 text-textSec font-mono text-xs">fra-01</td>
								<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded font-medium">Timeout</span></td>
								<td class="py-3 pr-4 text-textMain max-w-xs truncate text-xs">Request timeout 30s exceeded on POST /webhooks</td>
								<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span></td>
							</tr>
							<tr class="hover:bg-[#1e293b]/30 transition-colors">
								<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">03:40:08</td>
								<td class="py-3 pr-4 text-textSec font-mono text-xs">fra-02</td>
								<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Crash</span></td>
								<td class="py-3 pr-4 text-textMain max-w-xs truncate text-xs">Segfault in native addon – node-canvas v2.11.2</td>
								<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Restartováno</span></td>
							</tr>
							<tr class="hover:bg-[#1e293b]/30 transition-colors">
								<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">01:14:33</td>
								<td class="py-3 pr-4 text-textSec font-mono text-xs">fra-01</td>
								<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Health</span></td>
								<td class="py-3 pr-4 text-textMain max-w-xs truncate text-xs">Readiness probe failed – DB connection not ready</td>
								<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</section>

		<!-- HTTP Status + RPM -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">HTTP Status kódy</h3>
						<p class="text-xs text-textSec mt-0.5">Distribuce odpovědí serveru (24h)</p>
					</div>
				</div>
				<div id="chart-http-status" class="h-[200px] w-full"></div>
				<div class="mt-4 grid grid-cols-2 gap-3">
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#3ecf8e] inline-block"></span><span class="text-textSec">2xx OK</span></div>
						<span class="text-textMain font-medium">94.2%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block"></span><span class="text-textSec">3xx Redirect</span></div>
						<span class="text-textMain font-medium">2.8%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block"></span><span class="text-textSec">4xx Client</span></div>
						<span class="text-textMain font-medium">2.1%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-error inline-block"></span><span class="text-textSec">5xx Server</span></div>
						<span class="text-textMain font-medium">0.9%</span>
					</div>
				</div>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">Requesty za minutu</h3>
						<p class="text-xs text-textSec mt-0.5">HTTP požadavky na aplikaci</p>
					</div>
					<div class="flex gap-2">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#a78bfa] inline-block"></span>rpm</span>
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
			<div class="w-7 h-7 rounded-md bg-[#a78bfa]/15 border border-[#a78bfa]/30 flex items-center justify-center">
				<i class="fa-solid fa-microchip text-[#a78bfa] text-xs"></i>
			</div>
			<div>
				<h1 class="text-sm font-bold text-textMain leading-tight">Runtime (Fly.io)</h1>
				<p class="text-xs text-textSec">fra · Produkce</p>
			</div>
		</div>
	</div>

	<!-- Online status -->
	<div class="px-4 pb-3">
		<div class="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/20 rounded-lg text-success text-xs font-medium w-fit">
			<div class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
			3 / 3 Mašiny online
		</div>
	</div>

	<!-- Time range + region selector -->
	<div class="px-4 pb-4">
		<div class="flex items-center gap-2">
			<select class="flex-1 bg-card border border-[#334155] text-sm text-textMain rounded-xl px-4 py-3 focus:outline-none">
				<option>Posledních 24 hodin</option>
				<option>Posledních 7 dní</option>
				<option>Posledních 30 dní</option>
			</select>
			<div class="flex items-center gap-1.5 px-3 py-3 bg-card border border-[#1e293b] rounded-xl text-textSec text-xs">
				<i class="fa-solid fa-server text-xs"></i>
				<span>fra</span>
			</div>
		</div>
	</div>

	<div class="px-4 space-y-4">

		<!-- KPI Primary Stats 2×2 -->
		<section class="grid grid-cols-2 gap-3">
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-start justify-between mb-2">
					<p class="text-textSec text-xs font-medium">CPU Využití</p>
					<span class="px-1.5 py-0.5 bg-secondary/10 text-secondary text-[10px] rounded-full font-medium">⚠</span>
				</div>
				<div class="flex items-end gap-1 mb-2">
					<span class="text-2xl font-bold text-textMain">74</span>
					<span class="text-xs text-textSec mb-0.5">%</span>
					<span class="text-xs text-secondary mb-0.5 ml-1"><i class="fa-solid fa-arrow-up text-xs"></i>+12%</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden mb-1">
					<div class="h-full bg-secondary rounded-full" style="width:74%"></div>
				</div>
				<p class="text-[10px] text-textSec">Peak: 91%</p>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-start justify-between mb-2">
					<p class="text-textSec text-xs font-medium">RAM Využití</p>
					<span class="px-1.5 py-0.5 bg-success/10 text-success text-[10px] rounded-full font-medium">OK</span>
				</div>
				<div class="flex items-end gap-1 mb-2">
					<span class="text-2xl font-bold text-textMain">1.8</span>
					<span class="text-xs text-textSec mb-0.5">GB</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden mb-1">
					<div class="h-full bg-[#3b82f6] rounded-full" style="width:45%"></div>
				</div>
				<p class="text-[10px] text-textSec">45% / 4 GB</p>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-start justify-between mb-2">
					<p class="text-textSec text-xs font-medium">Uptime 30d</p>
					<span class="px-1.5 py-0.5 bg-success/10 text-success text-[10px] rounded-full font-medium">OK</span>
				</div>
				<div class="flex items-end gap-1">
					<span class="text-2xl font-bold text-success">99.97</span>
					<span class="text-xs text-textSec mb-0.5">%</span>
				</div>
				<p class="text-[10px] text-textSec mt-1">Výpadek: 8 min</p>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-start justify-between mb-2">
					<p class="text-textSec text-xs font-medium">Restarty 24h</p>
					<span class="px-1.5 py-0.5 bg-error/10 text-error text-[10px] rounded-full font-medium">!</span>
				</div>
				<div class="flex items-end gap-1">
					<span class="text-2xl font-bold text-error">5</span>
					<span class="text-xs text-error mb-0.5"><i class="fa-solid fa-arrow-up text-xs"></i>+3</span>
				</div>
				<p class="text-[10px] text-textSec mt-1">OOM:2 · Crash:3</p>
			</div>
		</section>

		<!-- KPI Secondary 2×2 -->
		<section class="grid grid-cols-2 gap-3">
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-7 h-7 rounded-lg bg-[#a78bfa]/15 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid fa-network-wired text-[#a78bfa] text-xs"></i>
					</div>
					<p class="text-textSec text-xs font-medium">Aktivní instance</p>
				</div>
				<div class="text-2xl font-bold text-textMain">3 <span class="text-sm font-normal text-textSec">/ 5</span></div>
				<p class="text-[10px] text-textSec mt-1">Autoscale: OFF</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-7 h-7 rounded-lg bg-[#3ecf8e]/15 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid fa-arrows-left-right text-[#3ecf8e] text-xs"></i>
					</div>
					<p class="text-textSec text-xs font-medium">Síťový provoz</p>
				</div>
				<div class="text-2xl font-bold text-textMain">2.4 <span class="text-sm font-normal text-textSec">GB/h</span></div>
				<p class="text-[10px] text-textSec mt-1">IN:840 · OUT:1.56GB</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-7 h-7 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid fa-clock text-[#3b82f6] text-xs"></i>
					</div>
					<p class="text-textSec text-xs font-medium">Response Time</p>
				</div>
				<div class="text-2xl font-bold text-textMain">112 <span class="text-sm font-normal text-textSec">ms</span></div>
				<p class="text-[10px] text-textSec mt-1">P99: 840ms</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-center gap-2 mb-2">
					<div class="w-7 h-7 rounded-lg bg-secondary/15 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid fa-rocket text-secondary text-xs"></i>
					</div>
					<p class="text-textSec text-xs font-medium">Posl. deploy</p>
				</div>
				<div class="text-2xl font-bold text-textMain">v2.14.1</div>
				<p class="text-[10px] text-textSec mt-1">Dnes 11:04 · 38s</p>
			</div>
		</section>

		<!-- Charts Tabs -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<div class="flex items-center gap-1 mb-4 bg-[#0a1628] rounded-lg p-1">
				<button
					onclick={() => switchChart('cpu')}
					class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'cpu' ? 'bg-[#1e293b] text-white' : 'text-textSec'}"
				>CPU</button>
				<button
					onclick={() => switchChart('ram')}
					class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'ram' ? 'bg-[#1e293b] text-white' : 'text-textSec'}"
				>RAM</button>
				<button
					onclick={() => switchChart('response')}
					class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'response' ? 'bg-[#1e293b] text-white' : 'text-textSec'}"
				>Response</button>
				<button
					onclick={() => switchChart('network')}
					class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'network' ? 'bg-[#1e293b] text-white' : 'text-textSec'}"
				>Network</button>
			</div>

				<!-- CPU panel -->
			<div class="{activeChart === 'cpu' ? '' : 'hidden'}">
				<div class="flex items-center justify-between mb-3">
					<div>
						<p class="text-sm font-semibold text-textMain">CPU využití v čase</p>
						<p class="text-xs text-textSec">Průměr přes všechny instance</p>
					</div>
					<div class="flex gap-1.5">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#a78bfa] inline-block"></span>CPU</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#f97316] inline-block"></span>Peak</span>
					</div>
				</div>
				<div id="chart-cpu-m" class="h-[200px] w-full"></div>
			</div>
			<!-- RAM panel -->
			<div class="{activeChart === 'ram' ? '' : 'hidden'}">
				<div class="flex items-center justify-between mb-3">
					<div>
						<p class="text-sm font-semibold text-textMain">RAM využití v čase</p>
						<p class="text-xs text-textSec">Heap & RSS paměť aplikace</p>
					</div>
					<div class="flex items-center gap-1 px-2 py-1 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded text-xs text-[#3b82f6]">
						<i class="fa-solid fa-memory text-xs"></i>4 GB limit
					</div>
				</div>
				<div id="chart-ram-m" class="h-[200px] w-full"></div>
			</div>
			<!-- Response panel -->
			<div class="{activeChart === 'response' ? '' : 'hidden'}">
				<div class="flex items-center justify-between mb-3">
					<div>
						<p class="text-sm font-semibold text-textMain">Response time</p>
						<p class="text-xs text-textSec">HTTP odpovědi aplikace v čase</p>
					</div>
					<div class="flex gap-1.5">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#3ecf8e] inline-block"></span>P50</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#f97316] inline-block"></span>P99</span>
					</div>
				</div>
				<div id="chart-response-m" class="h-[200px] w-full"></div>
			</div>
			<!-- Network panel -->
			<div class="{activeChart === 'network' ? '' : 'hidden'}">
				<div class="flex items-center justify-between mb-3">
					<div>
						<p class="text-sm font-semibold text-textMain">Síťový provoz</p>
						<p class="text-xs text-textSec">Ingress / Egress za hodinu</p>
					</div>
					<div class="flex gap-1.5">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#3b82f6] inline-block"></span>IN</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#3ecf8e] inline-block"></span>OUT</span>
					</div>
				</div>
				<div id="chart-network-m" class="h-[200px] w-full"></div>
			</div>
		</section>

		<!-- HTTP Status + RPM side by side -->
		<section class="grid grid-cols-2 gap-3">
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<p class="text-sm font-semibold text-textMain mb-1">HTTP Status</p>
				<p class="text-xs text-textSec mb-3">Distribuce (24h)</p>
				<div id="chart-http-status-m" class="h-[150px] w-full"></div>
				<div class="mt-3 space-y-1.5">
					<div class="flex items-center justify-between text-xs">
						<div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3ecf8e] inline-block"></span><span class="text-textSec">2xx</span></div>
						<span class="text-textMain font-medium">94.2%</span>
					</div>
					<div class="flex items-center justify-between text-xs">
						<div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3b82f6] inline-block"></span><span class="text-textSec">3xx</span></div>
						<span class="text-textMain font-medium">2.8%</span>
					</div>
					<div class="flex items-center justify-between text-xs">
						<div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#f97316] inline-block"></span><span class="text-textSec">4xx</span></div>
						<span class="text-textMain font-medium">2.1%</span>
					</div>
					<div class="flex items-center justify-between text-xs">
						<div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-error inline-block"></span><span class="text-textSec">5xx</span></div>
						<span class="text-textMain font-medium">0.9%</span>
					</div>
				</div>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<p class="text-sm font-semibold text-textMain mb-1">Req/min</p>
				<p class="text-xs text-textSec mb-3">HTTP požadavky</p>
				<div id="chart-rpm-m" class="h-[150px] w-full"></div>
				<div class="mt-3 p-2 bg-[#1e293b]/50 rounded-lg text-center">
					<p class="text-xs text-textSec">Peak</p>
					<p class="text-base font-bold text-[#a78bfa]">1,640</p>
					<p class="text-xs text-textSec">req/min</p>
				</div>
			</div>
		</section>

		<!-- Instances Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				onclick={() => (instancesOpen = !instancesOpen)}
				class="w-full flex items-center justify-between p-4 text-left"
			>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-[#a78bfa]/15 flex items-center justify-center">
						<i class="fa-solid fa-microchip text-[#a78bfa] text-xs"></i>
					</div>
					<div>
						<p class="text-sm font-semibold text-textMain">Stav instancí</p>
						<p class="text-[10px] text-textSec">3 aktivní · fra region</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">3/3</span>
					<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {instancesOpen ? 'rotate-180' : ''}"></i>
				</div>
			</button>
			{#if instancesOpen}
				<div class="px-4 pb-4 space-y-3">
					<div class="flex justify-end">
						<button class="flex items-center gap-2 px-3 py-2 bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded-lg text-[#a78bfa] text-xs font-medium">
							<i class="fa-solid fa-plus text-xs"></i>Škálovat
						</button>
					</div>
					<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-2">
								<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
								<span class="text-textMain font-medium text-xs font-mono">fra-01 · 4d4e555f</span>
							</div>
							<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">running</span>
						</div>
						<p class="text-xs text-textSec mb-3">shared-cpu-2x · 2 GB RAM</p>
						<div class="grid grid-cols-3 gap-3">
							<div>
								<div class="text-xs text-textSec mb-1">CPU</div>
								<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
									<div class="h-full bg-[#a78bfa] rounded-full" style="width:68%"></div>
								</div>
								<div class="text-xs text-textMain mt-1">68%</div>
							</div>
							<div>
								<div class="text-xs text-textSec mb-1">RAM</div>
								<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
									<div class="h-full bg-[#3b82f6] rounded-full" style="width:44%"></div>
								</div>
								<div class="text-xs text-textMain mt-1">880 MB</div>
							</div>
							<div>
								<div class="text-xs text-textSec mb-1">Uptime</div>
								<div class="text-xs text-textMain mt-1 font-mono">18h 42m</div>
							</div>
						</div>
					</div>
					<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-secondary/20">
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-2">
								<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
								<span class="text-textMain font-medium text-xs font-mono">fra-02 · 7f8a992b</span>
							</div>
							<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">running</span>
						</div>
						<p class="text-xs text-textSec mb-3">shared-cpu-2x · 2 GB RAM</p>
						<div class="grid grid-cols-3 gap-3">
							<div>
								<div class="text-xs text-textSec mb-1">CPU</div>
								<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
									<div class="h-full bg-secondary rounded-full" style="width:91%"></div>
								</div>
								<div class="text-xs text-secondary mt-1">91% ⚠</div>
							</div>
							<div>
								<div class="text-xs text-textSec mb-1">RAM</div>
								<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
									<div class="h-full bg-[#3b82f6] rounded-full" style="width:52%"></div>
								</div>
								<div class="text-xs text-textMain mt-1">1.04 GB</div>
							</div>
							<div>
								<div class="text-xs text-textSec mb-1">Uptime</div>
								<div class="text-xs text-textMain mt-1 font-mono">3h 18m</div>
							</div>
						</div>
					</div>
					<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-2">
								<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
								<span class="text-textMain font-medium text-xs font-mono">fra-03 · b1c2d3e4</span>
							</div>
							<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">running</span>
						</div>
						<p class="text-xs text-textSec mb-3">shared-cpu-2x · 2 GB RAM</p>
						<div class="grid grid-cols-3 gap-3">
							<div>
								<div class="text-xs text-textSec mb-1">CPU</div>
								<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
									<div class="h-full bg-[#a78bfa] rounded-full" style="width:62%"></div>
								</div>
								<div class="text-xs text-textMain mt-1">62%</div>
							</div>
							<div>
								<div class="text-xs text-textSec mb-1">RAM</div>
								<div class="w-full h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
									<div class="h-full bg-[#3b82f6] rounded-full" style="width:38%"></div>
								</div>
								<div class="text-xs text-textMain mt-1">760 MB</div>
							</div>
							<div>
								<div class="text-xs text-textSec mb-1">Uptime</div>
								<div class="text-xs text-textMain mt-1 font-mono">18h 42m</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</section>

		<!-- Deploy History Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				onclick={() => (deploysOpen = !deploysOpen)}
				class="w-full flex items-center justify-between p-4 text-left"
			>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center">
						<i class="fa-solid fa-rocket text-secondary text-xs"></i>
					</div>
					<div>
						<p class="text-sm font-semibold text-textMain">Historie deployů</p>
						<p class="text-[10px] text-textSec">Posledních 7 dní</p>
					</div>
				</div>
				<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {deploysOpen ? 'rotate-180' : ''}"></i>
			</button>
			{#if deploysOpen}
				<div class="px-4 pb-4 space-y-3">
					<div class="flex items-start gap-3 py-2 border-b border-[#1e293b]/60">
						<div class="mt-0.5 w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-check text-success text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<span class="text-textMain text-sm font-semibold">v2.14.1</span>
								<span class="text-xs text-textSec">Dnes 11:04</span>
							</div>
							<p class="text-xs text-textSec mt-0.5 truncate">Fix: memory leak in session handler</p>
							<p class="text-xs text-textSec mt-0.5">38s · 3 stroje ✓</p>
						</div>
					</div>
					<div class="flex items-start gap-3 py-2 border-b border-[#1e293b]/60">
						<div class="mt-0.5 w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-check text-success text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<span class="text-textMain text-sm font-semibold">v2.14.0</span>
								<span class="text-xs text-textSec">Včera 16:32</span>
							</div>
							<p class="text-xs text-textSec mt-0.5 truncate">feat: nový API endpoint /v2/orders</p>
							<p class="text-xs text-textSec mt-0.5">44s · 3 stroje ✓</p>
						</div>
					</div>
					<div class="flex items-start gap-3 py-2 border-b border-[#1e293b]/60">
						<div class="mt-0.5 w-7 h-7 rounded-lg bg-error/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-xmark text-error text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<span class="text-textMain text-sm font-semibold">v2.13.9</span>
								<span class="text-xs text-textSec">2 dny 09:15</span>
							</div>
							<p class="text-xs text-error mt-0.5 truncate">Failed: health check timeout</p>
							<p class="text-xs text-textSec mt-0.5">Rollback → v2.13.8</p>
						</div>
					</div>
					<div class="flex items-start gap-3 py-2 border-b border-[#1e293b]/60">
						<div class="mt-0.5 w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-check text-success text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<span class="text-textMain text-sm font-semibold">v2.13.8</span>
								<span class="text-xs text-textSec">3 dny 14:00</span>
							</div>
							<p class="text-xs text-textSec mt-0.5 truncate">chore: deps update, perf patches</p>
							<p class="text-xs text-textSec mt-0.5">41s · 3 stroje ✓</p>
						</div>
					</div>
					<div class="flex items-start gap-3 py-2">
						<div class="mt-0.5 w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-check text-success text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<span class="text-textMain text-sm font-semibold">v2.13.7</span>
								<span class="text-xs text-textSec">5 dní 08:22</span>
							</div>
							<p class="text-xs text-textSec mt-0.5 truncate">fix: rate limiter edge case</p>
							<p class="text-xs text-textSec mt-0.5">36s · 3 stroje ✓</p>
						</div>
					</div>
				</div>
			{/if}
		</section>

		<!-- Error Log Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				onclick={() => (errorsOpen = !errorsOpen)}
				class="w-full flex items-center justify-between p-4 text-left"
			>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-error/15 flex items-center justify-center">
						<i class="fa-solid fa-triangle-exclamation text-error text-xs"></i>
					</div>
					<div>
						<p class="text-sm font-semibold text-textMain">Runtime error log</p>
						<p class="text-[10px] text-textSec">24h · 8 záznamů</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded-full font-bold">8</span>
					<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {errorsOpen ? 'rotate-180' : ''}"></i>
				</div>
			</button>
			{#if errorsOpen}
				<div class="px-4 pb-4">
					<div class="flex gap-2 mb-4">
						<div class="flex rounded-lg overflow-hidden border border-[#334155] flex-1">
							<button class="flex-1 py-2 bg-error/20 text-error text-xs font-medium">Vše</button>
							<button class="flex-1 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">OOM</button>
							<button class="flex-1 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Crash</button>
							<button class="flex-1 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Health</button>
						</div>
					</div>
					<div class="space-y-2">
						<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-error/20">
							<div class="flex items-center justify-between mb-1.5">
								<div class="flex items-center gap-2">
									<span class="px-1.5 py-0.5 bg-error/15 text-error text-xs rounded font-medium">OOM Kill</span>
									<span class="text-xs text-textSec font-mono">fra-02</span>
								</div>
								<span class="text-xs text-textSec font-mono">14:51:02</span>
							</div>
							<p class="text-xs text-textMain">Process killed – exceeded 2 GB memory limit</p>
							<div class="mt-1.5">
								<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">Restartováno</span>
							</div>
						</div>
						<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-secondary/20">
							<div class="flex items-center justify-between mb-1.5">
								<div class="flex items-center gap-2">
									<span class="px-1.5 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Crash</span>
									<span class="text-xs text-textSec font-mono">fra-02</span>
								</div>
								<span class="text-xs text-textSec font-mono">13:22:44</span>
							</div>
							<p class="text-xs text-textMain">Unhandled exception in /api/v2/orders handler</p>
							<div class="mt-1.5">
								<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">Restartováno</span>
							</div>
						</div>
						<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
							<div class="flex items-center justify-between mb-1.5">
								<div class="flex items-center gap-2">
									<span class="px-1.5 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Health</span>
									<span class="text-xs text-textSec font-mono">fra-01</span>
								</div>
								<span class="text-xs text-textSec font-mono">11:08:31</span>
							</div>
							<p class="text-xs text-textMain">Health check failed 3x – /health returned 503</p>
							<div class="mt-1.5">
								<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span>
							</div>
						</div>
						<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-secondary/20">
							<div class="flex items-center justify-between mb-1.5">
								<div class="flex items-center gap-2">
									<span class="px-1.5 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Crash</span>
									<span class="text-xs text-textSec font-mono">fra-02</span>
								</div>
								<span class="text-xs text-textSec font-mono">10:44:19</span>
							</div>
							<p class="text-xs text-textMain">SIGKILL received after 30s startup timeout</p>
							<div class="mt-1.5">
								<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span>
							</div>
						</div>
						<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-error/20">
							<div class="flex items-center justify-between mb-1.5">
								<div class="flex items-center gap-2">
									<span class="px-1.5 py-0.5 bg-error/15 text-error text-xs rounded font-medium">OOM Kill</span>
									<span class="text-xs text-textSec font-mono">fra-03</span>
								</div>
								<span class="text-xs text-textSec font-mono">08:17:55</span>
							</div>
							<p class="text-xs text-textMain">RSS memory exceeded limit during batch job</p>
							<div class="mt-1.5">
								<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">Restartováno</span>
							</div>
						</div>
						<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-[#8b5cf6]/20">
							<div class="flex items-center justify-between mb-1.5">
								<div class="flex items-center gap-2">
									<span class="px-1.5 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded font-medium">Timeout</span>
									<span class="text-xs text-textSec font-mono">fra-01</span>
								</div>
								<span class="text-xs text-textSec font-mono">06:03:12</span>
							</div>
							<p class="text-xs text-textMain">Request timeout 30s exceeded on POST /webhooks</p>
							<div class="mt-1.5">
								<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span>
							</div>
						</div>
						<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-secondary/20">
							<div class="flex items-center justify-between mb-1.5">
								<div class="flex items-center gap-2">
									<span class="px-1.5 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Crash</span>
									<span class="text-xs text-textSec font-mono">fra-02</span>
								</div>
								<span class="text-xs text-textSec font-mono">03:40:08</span>
							</div>
							<p class="text-xs text-textMain">Segfault in native addon – node-canvas v2.11.2</p>
							<div class="mt-1.5">
								<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">Restartováno</span>
							</div>
						</div>
						<div class="p-3 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
							<div class="flex items-center justify-between mb-1.5">
								<div class="flex items-center gap-2">
									<span class="px-1.5 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Health</span>
									<span class="text-xs text-textSec font-mono">fra-01</span>
								</div>
								<span class="text-xs text-textSec font-mono">01:14:33</span>
							</div>
							<p class="text-xs text-textMain">Readiness probe failed – DB connection not ready</p>
							<div class="mt-1.5">
								<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</section>

	</div>

	<!-- Bottom Navigation -->
	<nav class="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-[#1e293b] flex items-center justify-around px-2 py-2">
		<a href="{base}/" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-white transition-colors min-w-[44px]">
			<i class="fa-solid fa-gauge-high text-base"></i>
			<span class="text-[9px] font-medium">Dashboard</span>
		</a>
		<a href="{base}/dostupnost" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-white transition-colors min-w-[44px]">
			<i class="fa-solid fa-server text-base"></i>
			<span class="text-[9px] font-medium">Dostupnost</span>
		</a>
		<a href="{base}/runtime" class="flex flex-col items-center gap-1 px-3 py-2 text-[#a78bfa] min-w-[44px]">
			<i class="fa-solid fa-microchip text-base"></i>
			<span class="text-[9px] font-semibold">Runtime</span>
		</a>
		<a href="{base}/performance" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-white transition-colors min-w-[44px]">
			<i class="fa-solid fa-bolt text-base"></i>
			<span class="text-[9px] font-medium">Perf.</span>
		</a>
		<a href="{base}/nastaveni" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-white transition-colors min-w-[44px]">
			<i class="fa-solid fa-gear text-base"></i>
			<span class="text-[9px] font-medium">Nastavení</span>
		</a>
	</nav>

</div>
