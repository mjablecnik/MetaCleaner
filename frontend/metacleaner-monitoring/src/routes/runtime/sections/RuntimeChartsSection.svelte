<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';

	let activeChart = $state<'cpu' | 'ram' | 'response' | 'network'>('cpu');

	function switchChart(tab: 'cpu' | 'ram' | 'response' | 'network') {
		activeChart = tab;
		setTimeout(() => {
			const Plotly = window.Plotly;
			if (!Plotly) return;
			const el = document.getElementById(`chart-rt-${tab}-m`);
			if (el) Plotly.Plots.resize(el);
		}, 50);
	}

	onMount(() => {
		const Plotly = window.Plotly;
		if (!Plotly) return;

		const bgCard = chartColors.card;
		const textSec = chartColors.textSec;
		const secondaryColor = chartColors.secondary;
		const purpleColor = chartColors.purpleLight;
		const blueColor = chartColors.blue;
		const greenColor = chartColors.greenMuted;
		const errorColor = chartColors.error;
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

		const hours = [
			'00:00',
			'02:00',
			'04:00',
			'06:00',
			'08:00',
			'10:00',
			'12:00',
			'14:00',
			'16:00',
			'18:00',
			'20:00',
			'22:00'
		];
		const avgCpu = [28, 24, 30, 38, 52, 64, 71, 74, 68, 62, 55, 48];
		const peakCpu = [45, 38, 51, 62, 78, 88, 91, 91, 84, 78, 70, 61];
		const ramData = [0.9, 0.85, 1.0, 1.1, 1.4, 1.7, 1.85, 1.8, 1.75, 1.65, 1.55, 1.4];
		const p50 = [88, 80, 95, 105, 112, 118, 122, 115, 108, 102, 96, 90];
		const p99 = [320, 290, 380, 440, 600, 780, 840, 790, 660, 540, 420, 360];
		const netIn = [180, 150, 200, 260, 420, 680, 840, 900, 780, 650, 520, 380];
		const netOut = [320, 280, 360, 480, 780, 1200, 1560, 1620, 1380, 1100, 880, 620];

		const dataCpu = [
			{
				type: 'scatter',
				mode: 'lines',
				fill: 'tozeroy',
				x: hours,
				y: peakCpu,
				line: { color: secondaryColor, width: 2, shape: 'spline', dash: 'dot' },
				fillcolor: 'rgba(249,115,22,0.06)',
				hovertemplate: '<b>%{x}</b><br>Peak: %{y}%<extra></extra>'
			},
			{
				type: 'scatter',
				mode: 'lines',
				fill: 'tozeroy',
				x: hours,
				y: avgCpu,
				line: { color: purpleColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(167,139,250,0.10)',
				hovertemplate: '<b>%{x}</b><br>CPU: %{y}%<extra></extra>'
			}
		];

		const dataRam = [
			{
				type: 'scatter',
				mode: 'lines',
				fill: 'tozeroy',
				x: hours,
				y: ramData,
				line: { color: blueColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(59,130,246,0.10)',
				hovertemplate: '<b>%{x}</b><br>RAM: %{y} GB<extra></extra>'
			},
			{
				type: 'scatter',
				mode: 'lines',
				x: hours,
				y: Array(hours.length).fill(4),
				line: { color: errorColor, width: 1.5, dash: 'dot' },
				hovertemplate: 'Limit: 4 GB<extra></extra>'
			}
		];

		const dataResponse = [
			{
				type: 'scatter',
				mode: 'lines',
				fill: 'tozeroy',
				x: hours,
				y: p99,
				line: { color: secondaryColor, width: 2, shape: 'spline' },
				fillcolor: 'rgba(249,115,22,0.07)',
				hovertemplate: '<b>%{x}</b><br>P99: %{y}ms<extra></extra>'
			},
			{
				type: 'scatter',
				mode: 'lines',
				fill: 'tozeroy',
				x: hours,
				y: p50,
				line: { color: greenColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(62,207,142,0.10)',
				hovertemplate: '<b>%{x}</b><br>P50: %{y}ms<extra></extra>'
			}
		];

		const dataNetwork = [
			{
				type: 'scatter',
				mode: 'lines',
				fill: 'tozeroy',
				x: hours,
				y: netOut,
				line: { color: greenColor, width: 2, shape: 'spline' },
				fillcolor: 'rgba(62,207,142,0.08)',
				hovertemplate: '<b>%{x}</b><br>OUT: %{y} MB<extra></extra>'
			},
			{
				type: 'scatter',
				mode: 'lines',
				fill: 'tozeroy',
				x: hours,
				y: netIn,
				line: { color: blueColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(59,130,246,0.10)',
				hovertemplate: '<b>%{x}</b><br>IN: %{y} MB<extra></extra>'
			}
		];

		const cpuLayout = {
			...commonLayout,
			yaxis: {
				...commonLayout.yaxis,
				title: { text: '%', font: { size: 10, color: textSec } },
				range: [0, 100]
			}
		};

		const ramLayout = {
			...commonLayout,
			yaxis: {
				...commonLayout.yaxis,
				title: { text: 'GB', font: { size: 10, color: textSec } },
				range: [0, 4.5]
			}
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

		// Desktop charts
		const elCpu = document.getElementById('chart-rt-cpu');
		if (elCpu) Plotly.newPlot('chart-rt-cpu', dataCpu, cpuLayout, chartConfig);

		const elRam = document.getElementById('chart-rt-ram');
		if (elRam) Plotly.newPlot('chart-rt-ram', dataRam, ramLayout, chartConfig);

		const elResponse = document.getElementById('chart-rt-response');
		if (elResponse) Plotly.newPlot('chart-rt-response', dataResponse, responseLayout, chartConfig);

		const elNetwork = document.getElementById('chart-rt-network');
		if (elNetwork) Plotly.newPlot('chart-rt-network', dataNetwork, networkLayout, chartConfig);

		// Mobile charts
		const elCpuM = document.getElementById('chart-rt-cpu-m');
		if (elCpuM)
			Plotly.newPlot(
				'chart-rt-cpu-m',
				dataCpu,
				{ ...mobileLayout, yaxis: { ...mobileLayout.yaxis, range: [0, 100] } },
				chartConfig
			);

		const elRamM = document.getElementById('chart-rt-ram-m');
		if (elRamM)
			Plotly.newPlot(
				'chart-rt-ram-m',
				dataRam,
				{ ...mobileLayout, yaxis: { ...mobileLayout.yaxis, range: [0, 4.5] } },
				chartConfig
			);

		const elResponseM = document.getElementById('chart-rt-response-m');
		if (elResponseM) Plotly.newPlot('chart-rt-response-m', dataResponse, mobileLayout, chartConfig);

		const elNetworkM = document.getElementById('chart-rt-network-m');
		if (elNetworkM) Plotly.newPlot('chart-rt-network-m', dataNetwork, mobileLayout, chartConfig);

		const handleResize = () => {
			[
				'chart-rt-cpu',
				'chart-rt-ram',
				'chart-rt-response',
				'chart-rt-network',
				'chart-rt-cpu-m',
				'chart-rt-ram-m',
				'chart-rt-response-m',
				'chart-rt-network-m'
			].forEach((id) => {
				const el = document.getElementById(id);
				if (el) Plotly.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- Desktop: 2×2 chart grid -->
<div class="hidden lg:block space-y-6">
	<!-- Row 1: CPU + RAM -->
	<section class="grid grid-cols-2 gap-6">
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_cpuOverTime')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('runtime_charts_cpuSubtitle')}</p>
				</div>
				<div class="flex gap-2">
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-purple-light inline-block"></span>CPU %</span
					>
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-secondary inline-block"></span>Peak</span
					>
				</div>
			</div>
			<div id="chart-rt-cpu" class="h-[220px] w-full"></div>
		</div>
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_ramOverTime')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('runtime_charts_ramSubtitle')}</p>
				</div>
				<div
					class="flex items-center gap-1.5 px-2 py-1 bg-blue/10 border border-blue/20 rounded text-xs text-blue"
				>
					<i class="fa-solid fa-memory text-xs"></i>
					{t('runtime_charts_ramLimit')}
				</div>
			</div>
			<div id="chart-rt-ram" class="h-[220px] w-full"></div>
		</div>
	</section>

	<!-- Row 2: Response Time + Network -->
	<section class="grid grid-cols-2 gap-6">
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_responseTime')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('runtime_charts_responseSubtitle')}</p>
				</div>
				<div class="flex gap-2">
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-green-muted inline-block"></span>P50</span
					>
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-secondary inline-block"></span>P99</span
					>
				</div>
			</div>
			<div id="chart-rt-response" class="h-[220px] w-full"></div>
		</div>
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_networkTraffic')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('runtime_charts_networkSubtitle')}</p>
				</div>
				<div class="flex gap-2">
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-blue inline-block"></span>IN</span
					>
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-green-muted inline-block"></span>OUT</span
					>
				</div>
			</div>
			<div id="chart-rt-network" class="h-[220px] w-full"></div>
		</div>
	</section>
</div>

<!-- Mobile: 4-tab chart switcher -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<div class="flex items-center gap-1 mb-4 bg-surface-deep rounded-lg p-1">
		<button
			onclick={() => switchChart('cpu')}
			class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'cpu'
				? 'bg-surface text-white'
				: 'text-textSec'}">CPU</button
		>
		<button
			onclick={() => switchChart('ram')}
			class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'ram'
				? 'bg-surface text-white'
				: 'text-textSec'}">RAM</button
		>
		<button
			onclick={() => switchChart('response')}
			class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'response'
				? 'bg-surface text-white'
				: 'text-textSec'}">Response</button
		>
		<button
			onclick={() => switchChart('network')}
			class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'network'
				? 'bg-surface text-white'
				: 'text-textSec'}">Network</button
		>
	</div>

	<!-- CPU panel -->
	<div class={activeChart === 'cpu' ? '' : 'hidden'}>
		<div class="flex items-center justify-between mb-3">
			<div>
				<p class="text-sm font-semibold text-textMain">{t('runtime_charts_cpuOverTime')}</p>
				<p class="text-xs text-textSec">{t('runtime_charts_cpuSubtitle')}</p>
			</div>
			<div class="flex gap-1.5">
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"
					><span class="w-1.5 h-1.5 rounded-full bg-purple-light inline-block"></span>CPU</span
				>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"
					><span class="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>Peak</span
				>
			</div>
		</div>
		<div id="chart-rt-cpu-m" class="h-[200px] w-full"></div>
	</div>

	<!-- RAM panel -->
	<div class={activeChart === 'ram' ? '' : 'hidden'}>
		<div class="flex items-center justify-between mb-3">
			<div>
				<p class="text-sm font-semibold text-textMain">{t('runtime_charts_ramOverTime')}</p>
				<p class="text-xs text-textSec">{t('runtime_charts_ramSubtitle')}</p>
			</div>
			<div
				class="flex items-center gap-1 px-2 py-1 bg-blue/10 border border-blue/20 rounded text-xs text-blue"
			>
				<i class="fa-solid fa-memory text-xs"></i>{t('runtime_charts_ramLimit')}
			</div>
		</div>
		<div id="chart-rt-ram-m" class="h-[200px] w-full"></div>
	</div>

	<!-- Response panel -->
	<div class={activeChart === 'response' ? '' : 'hidden'}>
		<div class="flex items-center justify-between mb-3">
			<div>
				<p class="text-sm font-semibold text-textMain">{t('runtime_charts_responseTime')}</p>
				<p class="text-xs text-textSec">{t('runtime_charts_responseSubtitle')}</p>
			</div>
			<div class="flex gap-1.5">
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"
					><span class="w-1.5 h-1.5 rounded-full bg-green-muted inline-block"></span>P50</span
				>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"
					><span class="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>P99</span
				>
			</div>
		</div>
		<div id="chart-rt-response-m" class="h-[200px] w-full"></div>
	</div>

	<!-- Network panel -->
	<div class={activeChart === 'network' ? '' : 'hidden'}>
		<div class="flex items-center justify-between mb-3">
			<div>
				<p class="text-sm font-semibold text-textMain">{t('runtime_charts_networkTraffic')}</p>
				<p class="text-xs text-textSec">{t('runtime_charts_networkSubtitle')}</p>
			</div>
			<div class="flex gap-1.5">
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"
					><span class="w-1.5 h-1.5 rounded-full bg-blue inline-block"></span>IN</span
				>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"
					><span class="w-1.5 h-1.5 rounded-full bg-green-muted inline-block"></span>OUT</span
				>
			</div>
		</div>
		<div id="chart-rt-network-m" class="h-[200px] w-full"></div>
	</div>
</section>
