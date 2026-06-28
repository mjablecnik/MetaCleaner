<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import { getHttpStatusDistribution } from '$lib/repositories/edgeRepository';

	const httpStatus = getHttpStatusDistribution();

	let activeChart = $state<'requests' | 'bandwidth' | 'http'>('requests');

	function switchChart(tab: 'requests' | 'bandwidth' | 'http') {
		activeChart = tab;
		setTimeout(() => {
			const Plotly = window.Plotly;
			if (!Plotly) return;
			const el = document.getElementById(`chart-${tab}-m`);
			if (el) Plotly.Plots.resize(el);
		}, 50);
	}

	onMount(() => {
		const Plotly = window.Plotly;
		if (!Plotly) return;

		const bgCard = chartColors.card;
		const textSec = chartColors.textSec;
		const secondaryColor = chartColors.secondary;
		const blueColor = chartColors.blue;
		const greenColor = chartColors.greenMuted;
		const errorColor = chartColors.error;
		const cfOrange = chartColors.cfOrange;
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
		const hoursShort = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];

		const cacheHit = [820, 680, 940, 1120, 1800, 2200, 2050, 2400, 2100, 1760, 1440, 1100];
		const cacheMiss = [180, 140, 210, 280, 420, 480, 430, 520, 440, 380, 310, 240];
		const bw = [48, 38, 62, 82, 148, 192, 168, 210, 185, 158, 124, 88];

		const dataRequests = [
			{
				type: 'scatter',
				mode: 'lines',
				fill: 'tozeroy',
				name: 'Cache HIT',
				x: hours,
				y: cacheHit,
				line: { color: greenColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(62,207,142,0.10)',
				hovertemplate: '<b>%{x}</b><br>Cache HIT: %{y}k req<extra></extra>'
			},
			{
				type: 'scatter',
				mode: 'lines',
				fill: 'tozeroy',
				name: 'Cache MISS',
				x: hours,
				y: cacheMiss,
				line: { color: cfOrange, width: 2, shape: 'spline' },
				fillcolor: 'rgba(246,130,31,0.10)',
				hovertemplate: '<b>%{x}</b><br>Cache MISS: %{y}k req<extra></extra>'
			}
		];

		const dataBandwidth = [
			{
				type: 'bar',
				x: hours,
				y: bw,
				marker: {
					color: bw.map((v: number) => (v > 180 ? cfOrange : blueColor)),
					opacity: 0.85
				},
				hovertemplate: '<b>%{x}</b><br>%{y} GB/h<extra></extra>'
			}
		];

		const dataHttpStatus = [
			{
				type: 'bar',
				name: '2xx',
				x: hoursShort,
				y: [960, 940, 975, 950, 948, 952, 960, 945, 970, 958, 965, 972],
				marker: { color: greenColor, opacity: 0.85 },
				hovertemplate: '<b>%{x}:00</b><br>2xx: %{y}‰<extra></extra>'
			},
			{
				type: 'bar',
				name: '3xx',
				x: hoursShort,
				y: [22, 28, 14, 26, 28, 24, 20, 30, 18, 24, 20, 18],
				marker: { color: blueColor, opacity: 0.85 },
				hovertemplate: '<b>%{x}:00</b><br>3xx: %{y}‰<extra></extra>'
			},
			{
				type: 'bar',
				name: '4xx',
				x: hoursShort,
				y: [12, 20, 8, 16, 16, 14, 14, 16, 8, 12, 10, 8],
				marker: { color: secondaryColor, opacity: 0.85 },
				hovertemplate: '<b>%{x}:00</b><br>4xx: %{y}‰<extra></extra>'
			},
			{
				type: 'bar',
				name: '5xx',
				x: hoursShort,
				y: [6, 12, 3, 8, 8, 10, 6, 9, 4, 6, 5, 2],
				marker: { color: errorColor, opacity: 0.85 },
				hovertemplate: '<b>%{x}:00</b><br>5xx: %{y}‰<extra></extra>'
			}
		];

		const requestsLayout = {
			...commonLayout,
			yaxis: {
				...commonLayout.yaxis,
				title: { text: 'req/tis.', font: { size: 10, color: textSec } }
			}
		};
		const bandwidthLayout = {
			...commonLayout,
			bargap: 0.3,
			yaxis: { ...commonLayout.yaxis, title: { text: 'GB/h', font: { size: 10, color: textSec } } }
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

		const elHttp = document.getElementById('chart-http-status');
		if (elHttp) Plotly.newPlot('chart-http-status', dataHttpStatus, httpLayout, chartConfig);

		// Mobile charts
		const elRequestsM = document.getElementById('chart-requests-m');
		if (elRequestsM)
			Plotly.newPlot(
				'chart-requests-m',
				dataRequests,
				{
					...mobileLayout,
					yaxis: {
						...mobileLayout.yaxis,
						title: { text: 'req/tis.', font: { size: 9, color: textSec } }
					}
				},
				chartConfig
			);

		const elBandwidthM = document.getElementById('chart-bandwidth-m');
		if (elBandwidthM)
			Plotly.newPlot(
				'chart-bandwidth-m',
				dataBandwidth,
				{ ...mobileLayout, bargap: 0.3 },
				chartConfig
			);

		const elHttpM = document.getElementById('chart-http-status-m');
		if (elHttpM)
			Plotly.newPlot(
				'chart-http-status-m',
				dataHttpStatus,
				{ ...mobileLayout, barmode: 'stack', bargap: 0.3 },
				chartConfig
			);

		const handleResize = () => {
			[
				'chart-requests',
				'chart-bandwidth',
				'chart-http-status',
				'chart-requests-m',
				'chart-bandwidth-m',
				'chart-http-status-m'
			].forEach((id) => {
				const el = document.getElementById(id);
				if (el) Plotly.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- Desktop: Requests + Bandwidth charts -->
<section class="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('edge_charts_requestsOverTime')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('edge_charts_requestsSubtitle')}</p>
			</div>
			<div class="flex gap-2">
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
					><span class="w-2 h-2 rounded-full bg-green-muted inline-block"></span>{t(
						'edge_charts_cacheHit'
					)}</span
				>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
					><span class="w-2 h-2 rounded-full bg-cf-orange inline-block"></span>{t(
						'edge_charts_cacheMiss'
					)}</span
				>
			</div>
		</div>
		<div id="chart-requests" class="h-[220px] w-full"></div>
	</div>
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('edge_charts_bandwidth')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('edge_charts_bandwidthSubtitle')}</p>
			</div>
			<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">Celkem: 13.2 GB</span>
		</div>
		<div id="chart-bandwidth" class="h-[220px] w-full"></div>
	</div>
</section>

<!-- Desktop: HTTP Status chart -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex justify-between items-center mb-4">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('edge_charts_httpStatus')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('edge_charts_httpStatusSubtitle')}</p>
		</div>
	</div>
	<div id="chart-http-status" class="h-[220px] w-full"></div>
	<div class="mt-3 grid grid-cols-2 gap-2">
		{#each httpStatus as item (item.code)}
			<div class="flex items-center gap-2 text-xs">
				<span
					class="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
					style="background-color:{item.color}"
				></span>
				<span class="text-textSec">{t(item.labelKey)}</span>
				<span class="ml-auto text-textMain font-semibold">{item.percent}</span>
			</div>
		{/each}
	</div>
</section>

<!-- Mobile: 3-tab chart switcher -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<div class="flex items-center gap-1 mb-4 bg-background rounded-lg p-1">
		<button
			onclick={() => switchChart('requests')}
			class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'requests'
				? 'bg-surface text-white'
				: 'text-textSec'}">{t('edge_tabs_requests')}</button
		>
		<button
			onclick={() => switchChart('bandwidth')}
			class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'bandwidth'
				? 'bg-surface text-white'
				: 'text-textSec'}">{t('edge_tabs_bandwidth')}</button
		>
		<button
			onclick={() => switchChart('http')}
			class="flex-1 py-2 text-xs font-medium rounded-md transition-all {activeChart === 'http'
				? 'bg-surface text-white'
				: 'text-textSec'}">{t('edge_tabs_httpStatus')}</button
		>
	</div>

	<div class={activeChart === 'requests' ? '' : 'hidden'}>
		<div class="flex items-center justify-between mb-3">
			<div>
				<p class="text-sm font-semibold text-textMain">{t('edge_charts_requestsOverTime')}</p>
				<p class="text-xs text-textSec">{t('edge_charts_requestsSubtitle')}</p>
			</div>
			<div class="flex gap-1.5">
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"
					><span class="w-1.5 h-1.5 rounded-full bg-green-muted inline-block"></span>{t(
						'edge_charts_cacheHit'
					)}</span
				>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1"
					><span class="w-1.5 h-1.5 rounded-full bg-cf-orange inline-block"></span>{t(
						'edge_charts_cacheMiss'
					)}</span
				>
			</div>
		</div>
		<div id="chart-requests-m" class="h-[200px] w-full"></div>
	</div>

	<div class={activeChart === 'bandwidth' ? '' : 'hidden'}>
		<div class="flex items-center justify-between mb-3">
			<div>
				<p class="text-sm font-semibold text-textMain">{t('edge_charts_bandwidth')}</p>
				<p class="text-xs text-textSec">{t('edge_charts_bandwidthSubtitle')}</p>
			</div>
		</div>
		<div id="chart-bandwidth-m" class="h-[200px] w-full"></div>
	</div>

	<div class={activeChart === 'http' ? '' : 'hidden'}>
		<div class="flex items-center justify-between mb-3">
			<div>
				<p class="text-sm font-semibold text-textMain">{t('edge_charts_httpStatus')}</p>
				<p class="text-xs text-textSec">{t('edge_charts_httpStatusSubtitle')}</p>
			</div>
		</div>
		<div id="chart-http-status-m" class="h-[200px] w-full"></div>
		<div class="mt-3 grid grid-cols-2 gap-2">
			{#each httpStatus as item (item.code)}
				<div class="flex items-center gap-2 text-xs">
					<span
						class="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
						style="background-color:{item.color}"
					></span>
					<span class="text-textSec">{t(item.labelKey)}</span>
					<span class="ml-auto text-textMain font-semibold">{item.percent}</span>
				</div>
			{/each}
		</div>
	</div>
</section>
