<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import { getErrorCodeDistribution } from '$lib/repositories/performanceRepository';

	type AccordionKey = 'response' | 'throughput' | 'cpu' | 'errors';

	const errorDistribution = getErrorCodeDistribution();

	let accordionOpen = $state<Record<AccordionKey, boolean>>({
		response: true,
		throughput: false,
		cpu: false,
		errors: false
	});

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

		const bgCard = chartColors.card;
		const textSec = chartColors.textSec;
		const errorColor = chartColors.error;
		const secondaryColor = chartColors.secondary;
		const purpleColor = chartColors.purple;
		const blueColor = chartColors.blue;
		const greenColor = chartColors.greenMuted;
		const amberColor = chartColors.amber;
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
				text: `<b>68</b><br><span style="font-size:10px;color:${chartColors.textSec}">chyb / 24h</span>`,
				x: 0.5, y: 0.5,
				xanchor: 'center', yanchor: 'middle',
				showarrow: false,
				font: { size: 14, color: chartColors.textMain }
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
				text: `<b>68</b><br><span style="font-size:9px;color:${chartColors.textSec}">chyb/24h</span>`,
				x: 0.5, y: 0.5,
				xanchor: 'center', yanchor: 'middle',
				showarrow: false,
				font: { size: 14, color: chartColors.textMain }
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

<!-- Desktop: Charts Row 1 - Response Time + Throughput -->
<section class="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('performance_charts_responseTime')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('performance_charts_responseSubtitle')}</p>
			</div>
			<div class="flex gap-2">
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
					><span class="w-2 h-2 rounded-full bg-green-muted inline-block"></span>Avg</span
				>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
					><span class="w-2 h-2 rounded-full bg-purple inline-block"></span>P95</span
				>
			</div>
		</div>
		<div id="chart-response-time" class="h-[220px] w-full"></div>
	</div>
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('performance_charts_throughput')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('performance_charts_throughputSubtitle')}</p>
			</div>
			<div class="flex gap-2">
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
					><span class="w-2 h-2 rounded-full bg-blue inline-block"></span>req/min</span
				>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
					><span class="w-2 h-2 rounded-full bg-error inline-block"></span>Chyby</span
				>
			</div>
		</div>
		<div id="chart-throughput" class="h-[220px] w-full"></div>
	</div>
</section>

<!-- Desktop: Charts Row 2 - CPU/RAM + Error Distribution -->
<section class="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5 lg:col-span-2">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('performance_charts_cpuRam')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('performance_charts_cpuRamSubtitle')}</p>
			</div>
			<div class="flex gap-2">
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
					><span class="w-2 h-2 rounded-full bg-green-muted inline-block"></span>CPU</span
				>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
					><span class="w-2 h-2 rounded-full bg-amber inline-block"></span>RAM</span
				>
			</div>
		</div>
		<div id="chart-cpu-ram" class="h-[220px] w-full"></div>
	</div>
	<div class="bg-card border border-surface rounded-xl p-5">
		<h3 class="text-lg font-semibold text-textMain mb-1">{t('performance_charts_errorTypes')}</h3>
		<p class="text-xs text-textSec mb-4">{t('performance_charts_errorTypesSubtitle')}</p>
		<div id="chart-error-donut" class="h-[180px] w-full"></div>
		<div class="mt-4 space-y-2">
			{#each errorDistribution as dist (dist.code)}
				<div class="flex items-center justify-between text-sm">
					<div class="flex items-center gap-2">
						<span
							class="w-2.5 h-2.5 rounded-full inline-block"
							style="background-color:{dist.color}"
						></span>
						<span class="text-textSec">{dist.label}</span>
					</div>
					<span class="text-textMain font-medium">{dist.percent}%</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Mobile: Charts (Accordions) -->
<section class="lg:hidden space-y-3">
	<!-- Response Time -->
	<div class="bg-card border border-surface rounded-xl overflow-hidden">
		<button
			onclick={() => toggleAccordion('response')}
			class="w-full flex items-center justify-between p-4 text-left"
		>
			<div class="flex items-center gap-3">
				<div class="w-7 h-7 rounded-lg bg-green-muted/15 flex items-center justify-center">
					<i class="fa-solid fa-wave-square text-green-muted text-xs"></i>
				</div>
				<div>
					<p class="text-sm font-semibold text-textMain">
						{t('performance_charts_responseTimeMobile')}
					</p>
					<p class="text-xs text-textSec">{t('performance_charts_responseSubtitleMobile')}</p>
				</div>
			</div>
			<i
				class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {accordionOpen.response
					? 'rotate-180'
					: ''}"
			></i>
		</button>
		{#if accordionOpen.response}
			<div class="px-4 pb-4">
				<div class="flex gap-2 mb-3">
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-green-muted inline-block"></span>Avg</span
					>
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-purple inline-block"></span>P95</span
					>
				</div>
				<div id="chart-response-time-m" class="h-[180px] w-full"></div>
			</div>
		{/if}
	</div>

	<!-- Throughput -->
	<div class="bg-card border border-surface rounded-xl overflow-hidden">
		<button
			onclick={() => toggleAccordion('throughput')}
			class="w-full flex items-center justify-between p-4 text-left"
		>
			<div class="flex items-center gap-3">
				<div class="w-7 h-7 rounded-lg bg-blue/15 flex items-center justify-center">
					<i class="fa-solid fa-chart-bar text-blue text-xs"></i>
				</div>
				<div>
					<p class="text-sm font-semibold text-textMain">
						{t('performance_charts_throughputMobile')}
					</p>
					<p class="text-xs text-textSec">{t('performance_charts_throughputSubtitleMobile')}</p>
				</div>
			</div>
			<i
				class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {accordionOpen.throughput
					? 'rotate-180'
					: ''}"
			></i>
		</button>
		{#if accordionOpen.throughput}
			<div class="px-4 pb-4">
				<div class="flex gap-2 mb-3">
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-blue inline-block"></span>req/min</span
					>
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-error inline-block"></span>Chyby</span
					>
				</div>
				<div id="chart-throughput-m" class="h-[180px] w-full"></div>
			</div>
		{/if}
	</div>

	<!-- CPU & RAM -->
	<div class="bg-card border border-surface rounded-xl overflow-hidden">
		<button
			onclick={() => toggleAccordion('cpu')}
			class="w-full flex items-center justify-between p-4 text-left"
		>
			<div class="flex items-center gap-3">
				<div class="w-7 h-7 rounded-lg bg-amber/15 flex items-center justify-center">
					<i class="fa-solid fa-server text-amber text-xs"></i>
				</div>
				<div>
					<p class="text-sm font-semibold text-textMain">{t('performance_charts_cpuRamMobile')}</p>
					<p class="text-xs text-textSec">{t('performance_charts_cpuRamSubtitleMobile')}</p>
				</div>
			</div>
			<i
				class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {accordionOpen.cpu
					? 'rotate-180'
					: ''}"
			></i>
		</button>
		{#if accordionOpen.cpu}
			<div class="px-4 pb-4">
				<div class="flex gap-2 mb-3">
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-green-muted inline-block"></span>CPU</span
					>
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-amber inline-block"></span>RAM</span
					>
				</div>
				<div id="chart-cpu-ram-m" class="h-[180px] w-full"></div>
			</div>
		{/if}
	</div>

	<!-- Error Distribution -->
	<div class="bg-card border border-surface rounded-xl overflow-hidden">
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
			<i
				class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {accordionOpen.errors
					? 'rotate-180'
					: ''}"
			></i>
		</button>
		{#if accordionOpen.errors}
			<div class="px-4 pb-4">
				<div id="chart-error-donut-m" class="h-[180px] w-full"></div>
				<div class="mt-3 space-y-2.5">
					{#each errorDistribution as dist (dist.code)}
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span
									class="w-2.5 h-2.5 rounded-full inline-block"
									style="background-color:{dist.color}"
								></span>
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
