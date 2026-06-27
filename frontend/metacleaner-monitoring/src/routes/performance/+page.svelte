<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	type AccordionKey = 'response' | 'throughput' | 'cpu' | 'errors';
	type EventFilter = 'all' | 'critical' | 'warning' | 'info';

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
				<h1 class="text-2xl font-bold text-textMain">Performance</h1>
				<p class="text-sm text-textSec mt-0.5">Celková infrastruktura • Všechny regiony • Posledních 24 hodin</p>
			</div>
		</div>
		<div class="flex items-center gap-3 flex-wrap">
			<div class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium">
				<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
				Systém OK
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
					<h3 class="text-textSec text-sm font-medium">Apdex Score</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">Výborný</span>
				</div>
				<div class="flex items-end gap-2 mb-3">
					<span class="text-3xl font-bold text-textMain">0.94</span>
					<span class="text-sm text-success mb-1 flex items-center gap-1"><i class="fa-solid fa-arrow-up text-xs"></i>+0.02</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full bg-success rounded-full" style="width:94%"></div>
				</div>
				<p class="text-xs text-textSec mt-2">Cíl: ≥ 0.90 · Threshold: 500ms</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">Avg. Response Time</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">OK</span>
				</div>
				<div class="flex items-end gap-2">
					<span class="text-3xl font-bold text-textMain">187</span>
					<span class="text-sm text-textSec mb-1">ms</span>
					<span class="text-sm text-success mb-1 flex items-center gap-1 ml-1"><i class="fa-solid fa-arrow-down text-xs"></i>-14ms</span>
				</div>
				<p class="text-xs text-textSec mt-2">P95: 480ms · P99: 1,240ms</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">Throughput</h3>
					<span class="px-2 py-0.5 bg-[#3b82f6]/10 text-[#3b82f6] text-xs rounded-full font-medium">Normal</span>
				</div>
				<div class="flex items-end gap-2">
					<span class="text-3xl font-bold text-textMain">3,841</span>
					<span class="text-sm text-textSec mb-1">req/min</span>
				</div>
				<p class="text-xs text-textSec mt-2">Peak: 6,210 rpm (10:42)</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">Chybovost</h3>
					<span class="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full font-medium">Varování</span>
				</div>
				<div class="flex items-end gap-2">
					<span class="text-3xl font-bold text-secondary">1.8</span>
					<span class="text-sm text-textSec mb-1">%</span>
					<span class="text-sm text-error mb-1 flex items-center gap-1"><i class="fa-solid fa-arrow-up text-xs"></i>+0.4%</span>
				</div>
				<p class="text-xs text-textSec mt-2">Cíl: &lt; 1% · 5xx: 68 za 24h</p>
			</div>
		</section>

		<!-- KPI Stats Row 2 -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#f59e0b]/15 flex items-center justify-center">
						<i class="fa-solid fa-memory text-[#f59e0b] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">RAM Utilizace</h3>
				</div>
				<div class="flex items-end gap-2 mb-2">
					<span class="text-2xl font-bold text-textMain">72</span>
					<span class="text-sm text-textSec mb-0.5">%</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full bg-[#f59e0b] rounded-full" style="width:72%"></div>
				</div>
				<p class="text-xs text-textSec mt-2">5.8 GB / 8 GB</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#3ecf8e]/15 flex items-center justify-center">
						<i class="fa-solid fa-microchip text-[#3ecf8e] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">CPU Utilizace</h3>
				</div>
				<div class="flex items-end gap-2 mb-2">
					<span class="text-2xl font-bold text-textMain">38</span>
					<span class="text-sm text-textSec mb-0.5">%</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full bg-[#3ecf8e] rounded-full" style="width:38%"></div>
				</div>
				<p class="text-xs text-textSec mt-2">Peak: 84% (10:38)</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center">
						<i class="fa-solid fa-network-wired text-[#3b82f6] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">Síťová latence</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">12 <span class="text-sm font-normal text-textSec">ms</span></div>
				<p class="text-xs text-textSec mt-1">CDN cache hit: 91.4%</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
						<i class="fa-solid fa-arrow-up-right-dots text-success text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">Uptime (30d)</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">99.97 <span class="text-sm font-normal text-textSec">%</span></div>
				<p class="text-xs text-textSec mt-1">Výpadky: 2 × 4 min celkem</p>
			</div>
		</section>

		<!-- Charts Row 1 -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">Response Time v čase</h3>
						<p class="text-xs text-textSec mt-0.5">Průměrná a P95 latence odpovědí</p>
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
						<h3 class="text-lg font-semibold text-textMain">Throughput v čase</h3>
						<p class="text-xs text-textSec mt-0.5">Počet požadavků za minutu</p>
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
						<h3 class="text-lg font-semibold text-textMain">CPU &amp; RAM Utilizace</h3>
						<p class="text-xs text-textSec mt-0.5">Systémové zdroje v průběhu dne</p>
					</div>
					<div class="flex gap-2">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3ecf8e] inline-block"></span>CPU</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#f59e0b] inline-block"></span>RAM</span>
					</div>
				</div>
				<div id="chart-cpu-ram" class="h-[220px] w-full"></div>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<h3 class="text-lg font-semibold text-textMain mb-1">Typy chyb</h3>
				<p class="text-xs text-textSec mb-4">Distribuce HTTP chybových kódů</p>
				<div id="chart-error-donut" class="h-[180px] w-full"></div>
				<div class="mt-4 space-y-2">
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block"></span><span class="text-textSec">500 Internal</span></div>
						<span class="text-textMain font-medium">42%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block"></span><span class="text-textSec">503 Timeout</span></div>
						<span class="text-textMain font-medium">31%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block"></span><span class="text-textSec">502 Bad GW</span></div>
						<span class="text-textMain font-medium">18%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] inline-block"></span><span class="text-textSec">Ostatní</span></div>
						<span class="text-textMain font-medium">9%</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Endpoints + Web Vitals -->
		<section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5 lg:col-span-2">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">Nejpomalejší endpointy</h3>
						<p class="text-xs text-textSec mt-0.5">Top 6 podle průměrné doby odpovědi</p>
					</div>
					<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">Posledních 24h</span>
				</div>
				<div class="space-y-3">
					<div class="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<span class="px-2 py-0.5 bg-error/20 text-error text-xs font-mono rounded font-semibold flex-shrink-0">POST</span>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-mono truncate">/api/v1/orders/checkout</p>
							<p class="text-xs text-textSec mt-0.5">Volání: 2,841x · Chyby: 4.2%</p>
						</div>
						<div class="flex-shrink-0 w-28">
							<div class="flex items-center justify-between mb-1">
								<span class="text-error font-bold text-sm">1,840 ms</span>
							</div>
							<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full bg-error rounded-full" style="width:100%"></div>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<span class="px-2 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-mono rounded font-semibold flex-shrink-0">GET</span>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-mono truncate">/api/v1/analytics/report</p>
							<p class="text-xs text-textSec mt-0.5">Volání: 184x · Chyby: 1.1%</p>
						</div>
						<div class="flex-shrink-0 w-28">
							<div class="flex items-center justify-between mb-1">
								<span class="text-secondary font-bold text-sm">940 ms</span>
							</div>
							<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full bg-secondary rounded-full" style="width:51%"></div>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<span class="px-2 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-mono rounded font-semibold flex-shrink-0">GET</span>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-mono truncate">/api/v1/users/search</p>
							<p class="text-xs text-textSec mt-0.5">Volání: 5,200x · Chyby: 0.8%</p>
						</div>
						<div class="flex-shrink-0 w-28">
							<div class="flex items-center justify-between mb-1">
								<span class="text-[#f59e0b] font-bold text-sm">620 ms</span>
							</div>
							<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full bg-[#f59e0b] rounded-full" style="width:34%"></div>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<span class="px-2 py-0.5 bg-error/20 text-error text-xs font-mono rounded font-semibold flex-shrink-0">PUT</span>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-mono truncate">/api/v1/products/:id</p>
							<p class="text-xs text-textSec mt-0.5">Volání: 1,024x · Chyby: 2.1%</p>
						</div>
						<div class="flex-shrink-0 w-28">
							<div class="flex items-center justify-between mb-1">
								<span class="text-[#3b82f6] font-bold text-sm">480 ms</span>
							</div>
							<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full bg-[#3b82f6] rounded-full" style="width:26%"></div>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<span class="px-2 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-mono rounded font-semibold flex-shrink-0">GET</span>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-mono truncate">/api/v1/events/stream</p>
							<p class="text-xs text-textSec mt-0.5">Volání: 18,400x · Chyby: 0.2%</p>
						</div>
						<div class="flex-shrink-0 w-28">
							<div class="flex items-center justify-between mb-1">
								<span class="text-textMain font-bold text-sm">210 ms</span>
							</div>
							<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full bg-[#3ecf8e] rounded-full" style="width:11%"></div>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-4 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40">
						<span class="px-2 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-mono rounded font-semibold flex-shrink-0">GET</span>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-mono truncate">/api/v1/auth/session</p>
							<p class="text-xs text-textSec mt-0.5">Volání: 42,100x · Chyby: 0.1%</p>
						</div>
						<div class="flex-shrink-0 w-28">
							<div class="flex items-center justify-between mb-1">
								<span class="text-textMain font-bold text-sm">48 ms</span>
							</div>
							<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full bg-[#3ecf8e] rounded-full" style="width:3%"></div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<h3 class="text-lg font-semibold text-textMain mb-1">Core Web Vitals</h3>
				<p class="text-xs text-textSec mb-5">Frontend výkonnostní metriky</p>
				<div class="space-y-5">
					<div>
						<div class="flex justify-between items-center mb-1.5">
							<div>
								<span class="text-sm text-textMain font-medium">LCP</span>
								<span class="text-xs text-textSec ml-1">Largest Contentful Paint</span>
							</div>
							<span class="text-success font-bold text-sm">1.8s</span>
						</div>
						<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-success rounded-full" style="width:60%"></div>
						</div>
						<div class="flex justify-between text-xs text-textSec mt-1">
							<span>Dobrý (&lt;2.5s)</span>
							<span class="text-success font-medium">✓ OK</span>
						</div>
					</div>
					<div>
						<div class="flex justify-between items-center mb-1.5">
							<div>
								<span class="text-sm text-textMain font-medium">FID</span>
								<span class="text-xs text-textSec ml-1">First Input Delay</span>
							</div>
							<span class="text-success font-bold text-sm">48ms</span>
						</div>
						<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-success rounded-full" style="width:32%"></div>
						</div>
						<div class="flex justify-between text-xs text-textSec mt-1">
							<span>Dobrý (&lt;100ms)</span>
							<span class="text-success font-medium">✓ OK</span>
						</div>
					</div>
					<div>
						<div class="flex justify-between items-center mb-1.5">
							<div>
								<span class="text-sm text-textMain font-medium">CLS</span>
								<span class="text-xs text-textSec ml-1">Cumulative Layout Shift</span>
							</div>
							<span class="text-secondary font-bold text-sm">0.18</span>
						</div>
						<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-secondary rounded-full" style="width:72%"></div>
						</div>
						<div class="flex justify-between text-xs text-textSec mt-1">
							<span>Zlepšit (&lt;0.1)</span>
							<span class="text-secondary font-medium">⚠ Varování</span>
						</div>
					</div>
					<div>
						<div class="flex justify-between items-center mb-1.5">
							<div>
								<span class="text-sm text-textMain font-medium">TTFB</span>
								<span class="text-xs text-textSec ml-1">Time To First Byte</span>
							</div>
							<span class="text-success font-bold text-sm">210ms</span>
						</div>
						<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-success rounded-full" style="width:42%"></div>
						</div>
						<div class="flex justify-between text-xs text-textSec mt-1">
							<span>Dobrý (&lt;800ms)</span>
							<span class="text-success font-medium">✓ OK</span>
						</div>
					</div>
					<div>
						<div class="flex justify-between items-center mb-1.5">
							<div>
								<span class="text-sm text-textMain font-medium">INP</span>
								<span class="text-xs text-textSec ml-1">Interaction to Next Paint</span>
							</div>
							<span class="text-success font-bold text-sm">84ms</span>
						</div>
						<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-success rounded-full" style="width:28%"></div>
						</div>
						<div class="flex justify-between text-xs text-textSec mt-1">
							<span>Dobrý (&lt;200ms)</span>
							<span class="text-success font-medium">✓ OK</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Performance Event Log -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-5">
			<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
				<div>
					<h3 class="text-lg font-semibold text-textMain">Performance události</h3>
					<p class="text-xs text-textSec mt-0.5">Anomálie a výkonnostní incidenty za posledních 24 hodin</p>
				</div>
				<div class="flex gap-3 flex-wrap">
					<div class="flex rounded-lg overflow-hidden border border-[#334155]">
						<button class="px-3 py-1.5 bg-[#f59e0b]/20 text-[#f59e0b] text-xs font-medium">Všechny</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Kritické</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Varování</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Info</button>
					</div>
					<div class="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-1.5">
						<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
						<input type="text" placeholder="Hledat..." class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-32" />
					</div>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-[#1e293b]">
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">Čas</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">Závažnost</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">Typ</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">Popis</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">Endpoint / Služba</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[#1e293b]/60">
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">14:32:11</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">Kritické</span></td>
							<td class="py-3 pr-4 text-textSec text-xs">Response Spike</td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">P99 latence překročila 5,000ms – možná DB blokáda</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">/api/v1/orders/checkout</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded">Aktivní</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">13:48:22</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Varování</span></td>
							<td class="py-3 pr-4 text-textSec text-xs">CPU Spike</td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">CPU vytížení přesáhlo 80% po dobu 4 minut</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">fly.io · fra · instance-02</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">12:15:08</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Varování</span></td>
							<td class="py-3 pr-4 text-textSec text-xs">Error Rate</td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Chybovost překročila 3% po dobu 8 minut (503 timeout)</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">/api/v1/analytics/report</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">10:42:55</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Info</span></td>
							<td class="py-3 pr-4 text-textSec text-xs">Traffic Spike</td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Throughput dosáhl peak 6,210 req/min – auto-scale spuštěn</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">Celá infrastruktura</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">09:12:34</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Varování</span></td>
							<td class="py-3 pr-4 text-textSec text-xs">Memory Pressure</td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">RAM využití přesáhlo 85% – možný memory leak v worker</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">fly.io · fra · instance-01</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">06:30:01</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Info</span></td>
							<td class="py-3 pr-4 text-textSec text-xs">Deploy</td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Nasazení verze v2.14.1 – rolling restart dokončen za 42s</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">Celá infrastruktura</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Dokončeno</span></td>
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
	<div class="px-4 pt-3 pb-2 bg-card border-b border-[#1e293b] flex items-center justify-between gap-3">
		<div class="flex items-center gap-2.5">
			<div class="w-7 h-7 rounded-md bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center">
				<i class="fa-solid fa-bolt text-[#f59e0b] text-xs"></i>
			</div>
			<p class="text-xs text-textSec truncate">Celá infrastruktura · Všechny regiony</p>
		</div>
		<select class="bg-[#1e293b] border border-[#334155] text-xs text-textMain rounded-lg px-2.5 py-1.5 focus:outline-none flex-shrink-0">
			<option>Posledních 24 hodin</option>
			<option>Posledních 7 dní</option>
			<option>Posledních 30 dní</option>
		</select>
	</div>

	<div class="px-4 py-4 space-y-4">

		<!-- KPI Primary Stats - 2x2 grid -->
		<section class="grid grid-cols-2 gap-3">
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-start justify-between mb-2">
					<h3 class="text-textSec text-xs font-medium leading-tight">Apdex Score</h3>
					<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium flex-shrink-0 ml-1">✓</span>
				</div>
				<div class="flex items-end gap-1 mb-2">
					<span class="text-2xl font-bold text-textMain">0.94</span>
					<span class="text-xs text-success mb-0.5 flex items-center gap-0.5"><i class="fa-solid fa-arrow-up text-xs"></i>+0.02</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full bg-success rounded-full" style="width:94%"></div>
				</div>
				<p class="text-xs text-textSec mt-1.5">Cíl: ≥ 0.90</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-start justify-between mb-2">
					<h3 class="text-textSec text-xs font-medium leading-tight">Avg. Response</h3>
					<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium flex-shrink-0 ml-1">OK</span>
				</div>
				<div class="flex items-end gap-1 mb-2">
					<span class="text-2xl font-bold text-textMain">187</span>
					<span class="text-xs text-textSec mb-0.5">ms</span>
					<span class="text-xs text-success mb-0.5 flex items-center gap-0.5"><i class="fa-solid fa-arrow-down text-xs"></i>-14</span>
				</div>
				<p class="text-xs text-textSec">P95: 480ms</p>
				<p class="text-xs text-textSec">P99: 1,240ms</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-start justify-between mb-2">
					<h3 class="text-textSec text-xs font-medium leading-tight">Throughput</h3>
					<span class="px-1.5 py-0.5 bg-[#3b82f6]/10 text-[#3b82f6] text-xs rounded-full font-medium flex-shrink-0 ml-1">N</span>
				</div>
				<div class="flex items-end gap-1 mb-2">
					<span class="text-2xl font-bold text-textMain">3,841</span>
				</div>
				<p class="text-xs text-textSec">req/min</p>
				<p class="text-xs text-textSec mt-0.5">Peak: 6,210</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<div class="flex items-start justify-between mb-2">
					<h3 class="text-textSec text-xs font-medium leading-tight">Chybovost</h3>
					<span class="px-1.5 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full font-medium flex-shrink-0 ml-1">⚠</span>
				</div>
				<div class="flex items-end gap-1 mb-2">
					<span class="text-2xl font-bold text-secondary">1.8</span>
					<span class="text-xs text-textSec mb-0.5">%</span>
					<span class="text-xs text-error mb-0.5 flex items-center gap-0.5"><i class="fa-solid fa-arrow-up text-xs"></i>+0.4%</span>
				</div>
				<p class="text-xs text-textSec">Cíl: &lt; 1%</p>
				<p class="text-xs text-textSec mt-0.5">5xx: 68 / 24h</p>
			</div>
		</section>

		<!-- System Resources -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<h3 class="text-sm font-semibold text-textMain mb-3">Systémové zdroje</h3>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<div class="flex items-center gap-2 mb-2">
						<div class="w-6 h-6 rounded-md bg-[#f59e0b]/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-memory text-[#f59e0b] text-xs"></i>
						</div>
						<span class="text-textSec text-xs">RAM</span>
					</div>
					<div class="flex items-end gap-1 mb-1.5">
						<span class="text-xl font-bold text-textMain">72</span>
						<span class="text-xs text-textSec mb-0.5">%</span>
					</div>
					<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
						<div class="h-full bg-[#f59e0b] rounded-full" style="width:72%"></div>
					</div>
					<p class="text-xs text-textSec mt-1">5.8 GB / 8 GB</p>
				</div>
				<div>
					<div class="flex items-center gap-2 mb-2">
						<div class="w-6 h-6 rounded-md bg-[#3ecf8e]/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-microchip text-[#3ecf8e] text-xs"></i>
						</div>
						<span class="text-textSec text-xs">CPU</span>
					</div>
					<div class="flex items-end gap-1 mb-1.5">
						<span class="text-xl font-bold text-textMain">38</span>
						<span class="text-xs text-textSec mb-0.5">%</span>
					</div>
					<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
						<div class="h-full bg-[#3ecf8e] rounded-full" style="width:38%"></div>
					</div>
					<p class="text-xs text-textSec mt-1">Peak: 84%</p>
				</div>
				<div>
					<div class="flex items-center gap-2 mb-2">
						<div class="w-6 h-6 rounded-md bg-[#3b82f6]/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-network-wired text-[#3b82f6] text-xs"></i>
						</div>
						<span class="text-textSec text-xs">Latence</span>
					</div>
					<div class="flex items-end gap-1">
						<span class="text-xl font-bold text-textMain">12</span>
						<span class="text-xs text-textSec mb-0.5">ms</span>
					</div>
					<p class="text-xs text-textSec mt-1">CDN hit: 91.4%</p>
				</div>
				<div>
					<div class="flex items-center gap-2 mb-2">
						<div class="w-6 h-6 rounded-md bg-success/15 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-arrow-up-right-dots text-success text-xs"></i>
						</div>
						<span class="text-textSec text-xs">Uptime</span>
					</div>
					<div class="flex items-end gap-1">
						<span class="text-xl font-bold text-textMain">99.97</span>
						<span class="text-xs text-textSec mb-0.5">%</span>
					</div>
					<p class="text-xs text-textSec mt-1">2 × 4 min výpadky</p>
				</div>
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
							<p class="text-sm font-semibold text-textMain">Response Time</p>
							<p class="text-xs text-textSec">Avg &amp; P95 v čase</p>
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
							<p class="text-sm font-semibold text-textMain">Throughput</p>
							<p class="text-xs text-textSec">Požadavky za minutu</p>
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
							<p class="text-sm font-semibold text-textMain">CPU &amp; RAM</p>
							<p class="text-xs text-textSec">Využití zdrojů</p>
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
							<p class="text-sm font-semibold text-textMain">Typy chyb</p>
							<p class="text-xs text-textSec">Distribuce HTTP kódů</p>
						</div>
					</div>
					<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {accordionOpen.errors ? 'rotate-180' : ''}"></i>
				</button>
				{#if accordionOpen.errors}
					<div class="px-4 pb-4">
						<div id="chart-error-donut-m" class="h-[180px] w-full"></div>
						<div class="mt-3 space-y-2.5">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block"></span><span class="text-textSec text-xs">500 Internal</span></div>
								<span class="text-textMain font-semibold text-xs">42%</span>
							</div>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block"></span><span class="text-textSec text-xs">503 Timeout</span></div>
								<span class="text-textMain font-semibold text-xs">31%</span>
							</div>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block"></span><span class="text-textSec text-xs">502 Bad GW</span></div>
								<span class="text-textMain font-semibold text-xs">18%</span>
							</div>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] inline-block"></span><span class="text-textSec text-xs">Ostatní</span></div>
								<span class="text-textMain font-semibold text-xs">9%</span>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</section>

		<!-- Slowest Endpoints -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<div class="p-4 border-b border-[#1e293b] flex items-center justify-between">
				<div>
					<h3 class="text-sm font-semibold text-textMain">Nejpomalejší endpointy</h3>
					<p class="text-xs text-textSec mt-0.5">Top 6 · posledních 24h</p>
				</div>
				<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">24h</span>
			</div>
			<div class="divide-y divide-[#1e293b]/60">
				<div class="p-4">
					<div class="flex items-center gap-2 mb-2">
						<span class="px-1.5 py-0.5 bg-error/20 text-error text-xs font-mono rounded font-semibold flex-shrink-0">POST</span>
						<p class="text-textMain text-xs font-mono truncate flex-1">/api/v1/orders/checkout</p>
						<span class="text-error font-bold text-sm flex-shrink-0">1,840 ms</span>
					</div>
					<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden mb-1.5">
						<div class="h-full bg-error rounded-full" style="width:100%"></div>
					</div>
					<p class="text-xs text-textSec">Volání: 2,841x · Chyby: 4.2%</p>
				</div>
				<div class="p-4">
					<div class="flex items-center gap-2 mb-2">
						<span class="px-1.5 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-mono rounded font-semibold flex-shrink-0">GET</span>
						<p class="text-textMain text-xs font-mono truncate flex-1">/api/v1/analytics/report</p>
						<span class="text-secondary font-bold text-sm flex-shrink-0">940 ms</span>
					</div>
					<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden mb-1.5">
						<div class="h-full bg-secondary rounded-full" style="width:51%"></div>
					</div>
					<p class="text-xs text-textSec">Volání: 184x · Chyby: 1.1%</p>
				</div>
				<div class="p-4">
					<div class="flex items-center gap-2 mb-2">
						<span class="px-1.5 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-mono rounded font-semibold flex-shrink-0">GET</span>
						<p class="text-textMain text-xs font-mono truncate flex-1">/api/v1/users/search</p>
						<span class="text-[#f59e0b] font-bold text-sm flex-shrink-0">620 ms</span>
					</div>
					<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden mb-1.5">
						<div class="h-full bg-[#f59e0b] rounded-full" style="width:34%"></div>
					</div>
					<p class="text-xs text-textSec">Volání: 5,200x · Chyby: 0.8%</p>
				</div>
				<div class="p-4">
					<div class="flex items-center gap-2 mb-2">
						<span class="px-1.5 py-0.5 bg-error/20 text-error text-xs font-mono rounded font-semibold flex-shrink-0">PUT</span>
						<p class="text-textMain text-xs font-mono truncate flex-1">/api/v1/products/:id</p>
						<span class="text-[#3b82f6] font-bold text-sm flex-shrink-0">480 ms</span>
					</div>
					<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden mb-1.5">
						<div class="h-full bg-[#3b82f6] rounded-full" style="width:26%"></div>
					</div>
					<p class="text-xs text-textSec">Volání: 1,024x · Chyby: 2.1%</p>
				</div>
				<div class="p-4">
					<div class="flex items-center gap-2 mb-2">
						<span class="px-1.5 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-mono rounded font-semibold flex-shrink-0">GET</span>
						<p class="text-textMain text-xs font-mono truncate flex-1">/api/v1/events/stream</p>
						<span class="text-textMain font-bold text-sm flex-shrink-0">210 ms</span>
					</div>
					<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden mb-1.5">
						<div class="h-full bg-[#3ecf8e] rounded-full" style="width:11%"></div>
					</div>
					<p class="text-xs text-textSec">Volání: 18,400x · Chyby: 0.2%</p>
				</div>
				<div class="p-4">
					<div class="flex items-center gap-2 mb-2">
						<span class="px-1.5 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-mono rounded font-semibold flex-shrink-0">GET</span>
						<p class="text-textMain text-xs font-mono truncate flex-1">/api/v1/auth/session</p>
						<span class="text-textMain font-bold text-sm flex-shrink-0">48 ms</span>
					</div>
					<div class="w-full h-1 bg-[#1e293b] rounded-full overflow-hidden mb-1.5">
						<div class="h-full bg-[#3ecf8e] rounded-full" style="width:3%"></div>
					</div>
					<p class="text-xs text-textSec">Volání: 42,100x · Chyby: 0.1%</p>
				</div>
			</div>
		</section>

		<!-- Core Web Vitals -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<h3 class="text-sm font-semibold text-textMain mb-1">Core Web Vitals</h3>
			<p class="text-xs text-textSec mb-4">Frontend výkonnostní metriky</p>
			<div class="space-y-4">
				<div>
					<div class="flex items-center justify-between mb-1.5">
						<div class="flex items-center gap-2">
							<span class="text-sm font-semibold text-textMain">LCP</span>
							<span class="text-xs text-textSec">Largest Contentful Paint</span>
						</div>
						<span class="text-success font-bold text-sm">1.8s</span>
					</div>
					<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
						<div class="h-full bg-success rounded-full" style="width:60%"></div>
					</div>
					<div class="flex justify-between text-xs text-textSec mt-1">
						<span>Dobrý (&lt;2.5s)</span>
						<span class="text-success font-medium">✓ OK</span>
					</div>
				</div>
				<div>
					<div class="flex items-center justify-between mb-1.5">
						<div class="flex items-center gap-2">
							<span class="text-sm font-semibold text-textMain">FID</span>
							<span class="text-xs text-textSec">First Input Delay</span>
						</div>
						<span class="text-success font-bold text-sm">48ms</span>
					</div>
					<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
						<div class="h-full bg-success rounded-full" style="width:32%"></div>
					</div>
					<div class="flex justify-between text-xs text-textSec mt-1">
						<span>Dobrý (&lt;100ms)</span>
						<span class="text-success font-medium">✓ OK</span>
					</div>
				</div>
				<div>
					<div class="flex items-center justify-between mb-1.5">
						<div class="flex items-center gap-2">
							<span class="text-sm font-semibold text-textMain">CLS</span>
							<span class="text-xs text-textSec">Cumulative Layout Shift</span>
						</div>
						<span class="text-secondary font-bold text-sm">0.18</span>
					</div>
					<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
						<div class="h-full bg-secondary rounded-full" style="width:72%"></div>
					</div>
					<div class="flex justify-between text-xs text-textSec mt-1">
						<span>Zlepšit (&lt;0.1)</span>
						<span class="text-secondary font-medium">⚠ Varování</span>
					</div>
				</div>
				<div>
					<div class="flex items-center justify-between mb-1.5">
						<div class="flex items-center gap-2">
							<span class="text-sm font-semibold text-textMain">TTFB</span>
							<span class="text-xs text-textSec">Time To First Byte</span>
						</div>
						<span class="text-success font-bold text-sm">210ms</span>
					</div>
					<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
						<div class="h-full bg-success rounded-full" style="width:42%"></div>
					</div>
					<div class="flex justify-between text-xs text-textSec mt-1">
						<span>Dobrý (&lt;800ms)</span>
						<span class="text-success font-medium">✓ OK</span>
					</div>
				</div>
				<div>
					<div class="flex items-center justify-between mb-1.5">
						<div class="flex items-center gap-2">
							<span class="text-sm font-semibold text-textMain">INP</span>
							<span class="text-xs text-textSec">Interaction to Next Paint</span>
						</div>
						<span class="text-success font-bold text-sm">84ms</span>
					</div>
					<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
						<div class="h-full bg-success rounded-full" style="width:28%"></div>
					</div>
					<div class="flex justify-between text-xs text-textSec mt-1">
						<span>Dobrý (&lt;200ms)</span>
						<span class="text-success font-medium">✓ OK</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Performance Event Log -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<div class="p-4 border-b border-[#1e293b]">
				<h3 class="text-sm font-semibold text-textMain">Performance události</h3>
				<p class="text-xs text-textSec mt-0.5">Anomálie za posledních 24 hodin</p>
				<div class="flex gap-0 mt-3 rounded-lg overflow-hidden border border-[#334155]">
					<button
						onclick={() => (activeEventFilter = 'all')}
						class="flex-1 px-2 py-2 text-xs font-medium transition-colors {activeEventFilter === 'all' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-transparent text-textSec hover:bg-[#1e293b]'}"
					>Všechny</button>
					<button
						onclick={() => (activeEventFilter = 'critical')}
						class="flex-1 px-2 py-2 text-xs font-medium transition-colors {activeEventFilter === 'critical' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-transparent text-textSec hover:bg-[#1e293b]'}"
					>Kritické</button>
					<button
						onclick={() => (activeEventFilter = 'warning')}
						class="flex-1 px-2 py-2 text-xs font-medium transition-colors {activeEventFilter === 'warning' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-transparent text-textSec hover:bg-[#1e293b]'}"
					>Varování</button>
					<button
						onclick={() => (activeEventFilter = 'info')}
						class="flex-1 px-2 py-2 text-xs font-medium transition-colors {activeEventFilter === 'info' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-transparent text-textSec hover:bg-[#1e293b]'}"
					>Info</button>
				</div>
			</div>
			<div class="divide-y divide-[#1e293b]/60">
				{#if activeEventFilter === 'all' || activeEventFilter === 'critical'}
					<div class="p-4">
						<div class="flex items-start justify-between gap-2 mb-2">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">Kritické</span>
								<span class="text-textSec text-xs">Response Spike</span>
							</div>
							<div class="flex items-center gap-2 flex-shrink-0">
								<span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded">Aktivní</span>
								<span class="text-textSec font-mono text-xs">14:32</span>
							</div>
						</div>
						<p class="text-textMain text-xs leading-relaxed mb-1.5">P99 latence překročila 5,000ms – možná DB blokáda</p>
						<p class="text-textSec font-mono text-xs">/api/v1/orders/checkout</p>
					</div>
				{/if}
				{#if activeEventFilter === 'all' || activeEventFilter === 'warning'}
					<div class="p-4">
						<div class="flex items-start justify-between gap-2 mb-2">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Varování</span>
								<span class="text-textSec text-xs">CPU Spike</span>
							</div>
							<div class="flex items-center gap-2 flex-shrink-0">
								<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span>
								<span class="text-textSec font-mono text-xs">13:48</span>
							</div>
						</div>
						<p class="text-textMain text-xs leading-relaxed mb-1.5">CPU vytížení přesáhlo 80% po dobu 4 minut</p>
						<p class="text-textSec font-mono text-xs">fly.io · fra · instance-02</p>
					</div>
					<div class="p-4">
						<div class="flex items-start justify-between gap-2 mb-2">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Varování</span>
								<span class="text-textSec text-xs">Error Rate</span>
							</div>
							<div class="flex items-center gap-2 flex-shrink-0">
								<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span>
								<span class="text-textSec font-mono text-xs">12:15</span>
							</div>
						</div>
						<p class="text-textMain text-xs leading-relaxed mb-1.5">Chybovost překročila 3% po dobu 8 minut (503 timeout)</p>
						<p class="text-textSec font-mono text-xs">/api/v1/analytics/report</p>
					</div>
					<div class="p-4">
						<div class="flex items-start justify-between gap-2 mb-2">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Varování</span>
								<span class="text-textSec text-xs">Memory Pressure</span>
							</div>
							<div class="flex items-center gap-2 flex-shrink-0">
								<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span>
								<span class="text-textSec font-mono text-xs">09:12</span>
							</div>
						</div>
						<p class="text-textMain text-xs leading-relaxed mb-1.5">RAM využití přesáhlo 85% – možný memory leak v worker</p>
						<p class="text-textSec font-mono text-xs">fly.io · fra · instance-01</p>
					</div>
				{/if}
				{#if activeEventFilter === 'all' || activeEventFilter === 'info'}
					<div class="p-4">
						<div class="flex items-start justify-between gap-2 mb-2">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Info</span>
								<span class="text-textSec text-xs">Traffic Spike</span>
							</div>
							<div class="flex items-center gap-2 flex-shrink-0">
								<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span>
								<span class="text-textSec font-mono text-xs">10:42</span>
							</div>
						</div>
						<p class="text-textMain text-xs leading-relaxed mb-1.5">Throughput dosáhl peak 6,210 req/min – auto-scale spuštěn</p>
						<p class="text-textSec font-mono text-xs">Celá infrastruktura</p>
					</div>
					<div class="p-4">
						<div class="flex items-start justify-between gap-2 mb-2">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Info</span>
								<span class="text-textSec text-xs">Deploy</span>
							</div>
							<div class="flex items-center gap-2 flex-shrink-0">
								<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Dokončeno</span>
								<span class="text-textSec font-mono text-xs">06:30</span>
							</div>
						</div>
						<p class="text-textMain text-xs leading-relaxed mb-1.5">Nasazení verze v2.14.1 – rolling restart dokončen za 42s</p>
						<p class="text-textSec font-mono text-xs">Celá infrastruktura</p>
					</div>
				{/if}
			</div>
		</section>

		<div class="h-4"></div>
	</div>

	<!-- Bottom Navigation -->
	<nav class="fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-[#1e293b] px-2 py-2 flex items-center justify-around lg:hidden">
		<a href="{base}/" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-gauge-high text-base"></i>
			<span class="text-xs">Přehled</span>
		</a>
		<a href="{base}/runtime" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-server text-base"></i>
			<span class="text-xs">Systém</span>
		</a>
		<a href="{base}/performance" class="flex flex-col items-center gap-1 px-3 py-1.5 text-[#f59e0b] min-w-[44px]">
			<i class="fa-solid fa-bolt text-base"></i>
			<span class="text-xs font-semibold">Perf</span>
		</a>
		<a href="{base}/chyby" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-triangle-exclamation text-base"></i>
			<span class="text-xs">Chyby</span>
		</a>
		<a href="{base}/nastaveni" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-gear text-base"></i>
			<span class="text-xs">Více</span>
		</a>
	</nav>
</div>
