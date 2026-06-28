<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import { getTtfbRegions, getThreatTypes } from '$lib/repositories/edgeRepository';
	import TtfbRegionBar from '../components/TtfbRegionBar.svelte';

	const ttfbRegions = getTtfbRegions();
	const threatTypes = getThreatTypes();

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
		const gridColor = 'rgba(30,41,59,0.8)';
		const chartConfig = { responsive: true, displayModeBar: false, displaylogo: false };

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
			text: `<b style="font-size:18px;color:${chartColors.textMain}">1,247</b><br><span style="font-size:10px;color:${chartColors.textSec}">Hrozeb</span>`,
			x: 0.5, y: 0.5,
			xanchor: 'center', yanchor: 'middle',
			showarrow: false,
			font: { size: 13, color: chartColors.textMain }
		};

		const regions = ['EU West', 'US East', 'US West', 'Middle East', 'Asia Pac.', 'S. America'];
		const ttfbVals = [38, 61, 78, 98, 114, 152];
		const ttfbColors = ttfbVals.map((v: number) => v < 80 ? greenColor : v < 120 ? secondaryColor : errorColor);

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

		const elThreatPie = document.getElementById('chart-threat-pie');
		if (elThreatPie) Plotly.newPlot('chart-threat-pie', dataThreatPie, pieLayout, chartConfig);

		const elTtfb = document.getElementById('chart-ttfb-region');
		if (elTtfb) Plotly.newPlot('chart-ttfb-region', [{ type: 'bar', x: regions, y: ttfbVals, marker: { color: ttfbColors, opacity: 0.85 }, hovertemplate: '<b>%{x}</b><br>TTFB: %{y}ms<extra></extra>' }], ttfbLayout, chartConfig);

		// Mobile charts
		const elThreatPieM = document.getElementById('chart-threat-pie-m');
		if (elThreatPieM) Plotly.newPlot('chart-threat-pie-m', dataThreatPie, {
			...pieLayout,
			margin: { t: 4, r: 4, b: 4, l: 4 },
			annotations: [{ text: `<b style="font-size:14px;color:${chartColors.textMain}">1,247</b><br><span style="font-size:9px;color:${chartColors.textSec}">Hrozeb</span>`, x: 0.5, y: 0.5, xanchor: 'center', yanchor: 'middle', showarrow: false, font: { size: 11, color: chartColors.textMain } }]
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
			['chart-threat-pie', 'chart-ttfb-region', 'chart-threat-pie-m', 'chart-ttfb-region-m'].forEach(id => {
				const el = document.getElementById(id);
				if (el) Plotly.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- Desktop: Threat Types + TTFB by Region -->
<section class="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5">
		<h3 class="text-lg font-semibold text-textMain mb-1">{t('edge_threats_title')}</h3>
		<p class="text-xs text-textSec mb-4">{t('edge_threats_subtitle')}</p>
		<div id="chart-threat-pie" class="h-[200px] w-full"></div>
		<div class="mt-4 space-y-2">
			{#each threatTypes as threat (threat.id)}
				<div class="flex items-center justify-between text-sm">
					<div class="flex items-center gap-2">
						<span
							class="w-2.5 h-2.5 rounded-full inline-block"
							style="background-color:{threat.color}"
						></span>
						<span class="text-textSec">{threat.label}</span>
					</div>
					<span class="text-textMain font-medium">{threat.percent}%</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="bg-card border border-surface rounded-xl p-5 lg:col-span-2">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('edge_ttfb_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('edge_ttfb_subtitle')}</p>
			</div>
			<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('edge_ttfb_badge')}</span>
		</div>
		<div class="space-y-3.5">
			{#each ttfbRegions as region (region.id)}
				<TtfbRegionBar {region} variant="desktop" />
			{/each}
		</div>
		<div id="chart-ttfb-region" class="h-[140px] w-full mt-5"></div>
	</div>
</section>

<!-- Mobile: Threat Types -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<h3 class="text-sm font-semibold text-textMain mb-1">{t('edge_threats_title')}</h3>
	<p class="text-xs text-textSec mb-3">{t('edge_threats_subtitle')}</p>
	<div class="flex gap-4">
		<div id="chart-threat-pie-m" class="h-[160px] flex-shrink-0" style="width:160px;"></div>
		<div class="flex-1 space-y-2.5 flex flex-col justify-center">
			{#each threatTypes as threat (threat.id)}
				<div class="flex items-center justify-between text-xs">
					<div class="flex items-center gap-2">
						<span
							class="w-2.5 h-2.5 rounded-full inline-block"
							style="background-color:{threat.color}"
						></span>
						<span class="text-textSec">{threat.label}</span>
					</div>
					<span class="text-textMain font-semibold">{threat.percent}%</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Mobile: TTFB by Region -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<div class="flex justify-between items-center mb-3">
		<div>
			<h3 class="text-sm font-semibold text-textMain">{t('edge_ttfb_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('edge_ttfb_subtitle')}</p>
		</div>
		<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('edge_ttfb_badgeMobile')}</span>
	</div>
	<div class="space-y-3">
		{#each ttfbRegions as region (region.id)}
			<TtfbRegionBar {region} variant="mobile" />
		{/each}
	</div>
	<div id="chart-ttfb-region-m" class="h-[130px] w-full mt-4"></div>
</section>
