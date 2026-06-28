<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import { getRuntimeHttpStatusDistribution } from '$lib/repositories/runtimeRepository';

	const httpStatus = getRuntimeHttpStatusDistribution();

	onMount(() => {
		const Plotly = (window as any).Plotly;
		if (!Plotly) return;

		const bgCard = chartColors.card;
		const textSec = chartColors.textSec;
		const greenColor = chartColors.greenMuted;
		const blueColor = chartColors.blue;
		const secondaryColor = chartColors.secondary;
		const errorColor = chartColors.error;
		const purpleColor = chartColors.purpleLight;
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
			margin: { t: 8, r: 8, b: 32, l: 38 },
			xaxis: { ...commonLayout.xaxis, tickfont: { color: textSec, size: 9 }, nticks: 6 },
			yaxis: { ...commonLayout.yaxis, tickfont: { color: textSec, size: 9 } }
		};

		const hours = ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];
		const rpm = [280, 240, 310, 420, 740, 1120, 1480, 1640, 1390, 1180, 920, 660];

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

		const rpmLayout = {
			...commonLayout,
			bargap: 0.3,
			yaxis: { ...commonLayout.yaxis, title: { text: 'req/min', font: { size: 10, color: textSec } } }
		};

		// Desktop charts
		const elHttpStatus = document.getElementById('chart-rt-http-status');
		if (elHttpStatus) Plotly.newPlot('chart-rt-http-status', dataHttpPie, pieLayout, chartConfig);

		const elRpm = document.getElementById('chart-rt-rpm');
		if (elRpm) Plotly.newPlot('chart-rt-rpm', dataRpm, rpmLayout, chartConfig);

		// Mobile charts
		const elHttpStatusM = document.getElementById('chart-rt-http-status-m');
		if (elHttpStatusM) Plotly.newPlot('chart-rt-http-status-m', dataHttpPie, {
			...pieLayout,
			margin: { t: 4, r: 4, b: 4, l: 4 },
			annotations: [{
				text: `<b style="font-size:14px;color:${chartColors.textMain}">94.2%</b>`,
				x: 0.5, y: 0.5, xanchor: 'center', yanchor: 'middle',
				showarrow: false, font: { size: 11, color: chartColors.textMain }
			}]
		}, chartConfig);

		const elRpmM = document.getElementById('chart-rt-rpm-m');
		if (elRpmM) Plotly.newPlot('chart-rt-rpm-m', dataRpm, {
			...mobileLayout,
			bargap: 0.35
		}, chartConfig);

		const handleResize = () => {
			['chart-rt-http-status','chart-rt-rpm','chart-rt-http-status-m','chart-rt-rpm-m'].forEach(id => {
				const el = document.getElementById(id);
				if (el) Plotly.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- Desktop: 2-col HTTP status pie + RPM bar -->
<section class="hidden lg:grid grid-cols-2 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_httpStatus')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('runtime_charts_httpStatusSubtitle')}</p>
			</div>
		</div>
		<div id="chart-rt-http-status" class="h-[200px] w-full"></div>
		<div class="mt-4 grid grid-cols-2 gap-3">
			{#each httpStatus as item}
				<div class="flex items-center justify-between text-sm">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full {item.color} inline-block"></span>
						<span class="text-textSec">{item.label}</span>
					</div>
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
		<div id="chart-rt-rpm" class="h-[240px] w-full"></div>
	</div>
</section>

<!-- Mobile: 2x2 grid with pie + bar side by side -->
<section class="lg:hidden grid grid-cols-2 gap-3">
	<div class="bg-card border border-surface rounded-xl p-4">
		<p class="text-sm font-semibold text-textMain mb-1">{t('runtime_charts_httpStatusMobile')}</p>
		<p class="text-xs text-textSec mb-3">{t('runtime_charts_httpStatusSubtitleMobile')}</p>
		<div id="chart-rt-http-status-m" class="h-[150px] w-full"></div>
		<div class="mt-3 space-y-1.5">
			{#each httpStatus as item}
				<div class="flex items-center justify-between text-xs">
					<div class="flex items-center gap-1.5">
						<span class="w-2 h-2 rounded-full {item.color} inline-block"></span>
						<span class="text-textSec">{item.label.slice(0, 3)}</span>
					</div>
					<span class="text-textMain font-medium">{item.percent}%</span>
				</div>
			{/each}
		</div>
	</div>
	<div class="bg-card border border-surface rounded-xl p-4">
		<p class="text-sm font-semibold text-textMain mb-1">{t('runtime_charts_rpmMobile')}</p>
		<p class="text-xs text-textSec mb-3">{t('runtime_charts_rpmSubtitleMobile')}</p>
		<div id="chart-rt-rpm-m" class="h-[150px] w-full"></div>
		<div class="mt-3 p-2 bg-surface/50 rounded-lg text-center">
			<p class="text-xs text-textSec">{t('runtime_charts_rpmPeak')}</p>
			<p class="text-base font-bold text-purple-light">1,640</p>
			<p class="text-xs text-textSec">req/min</p>
		</div>
	</div>
</section>
