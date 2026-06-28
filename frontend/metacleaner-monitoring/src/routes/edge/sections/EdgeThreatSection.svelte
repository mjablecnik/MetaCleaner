<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import { getThreatTypes } from '$lib/repositories/edgeRepository';

	const threatTypes = getThreatTypes();

	onMount(() => {
		const Plotly = window.Plotly;
		if (!Plotly) return;

		const bgCard = chartColors.card;
		const textSec = chartColors.textSec;
		const errorColor = chartColors.error;
		const secondaryColor = chartColors.secondary;
		const purpleColor = chartColors.purple;
		const blueColor = chartColors.blue;
		const chartConfig = { responsive: true, displayModeBar: false, displaylogo: false };

		const dataThreatPie = [
			{
				type: 'pie',
				labels: ['DDoS', 'Bad Bots', 'WAF Block', 'IP Block'],
				values: [54, 28, 13, 5],
				hole: 0.6,
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
			text: `<b style="font-size:18px;color:${chartColors.textMain}">83</b><br><span style="font-size:10px;color:${chartColors.textSec}">Hrozeb</span>`,
			x: 0.5,
			y: 0.5,
			xanchor: 'center',
			yanchor: 'middle',
			showarrow: false,
			font: { size: 13, color: chartColors.textMain }
		};

		const pieLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 5, r: 5, b: 5, l: 5 },
			showlegend: false,
			annotations: [pieCenterAnnotation]
		};

		const elThreatPie = document.getElementById('chart-threat-pie');
		if (elThreatPie) Plotly.newPlot('chart-threat-pie', dataThreatPie, pieLayout, chartConfig);

		// Mobile charts
		const elThreatPieM = document.getElementById('chart-threat-pie-m');
		if (elThreatPieM)
			Plotly.newPlot(
				'chart-threat-pie-m',
				dataThreatPie,
				{
					...pieLayout,
					margin: { t: 4, r: 4, b: 4, l: 4 },
					annotations: [
						{
							text: `<b style="font-size:14px;color:${chartColors.textMain}">83</b><br><span style="font-size:9px;color:${chartColors.textSec}">Hrozeb</span>`,
							x: 0.5,
							y: 0.5,
							xanchor: 'center',
							yanchor: 'middle',
							showarrow: false,
							font: { size: 11, color: chartColors.textMain }
						}
					]
				},
				chartConfig
			);

		const handleResize = () => {
			['chart-threat-pie', 'chart-threat-pie-m'].forEach((id) => {
				const el = document.getElementById(id);
				if (el) Plotly.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- Desktop: Threat Types -->
<section class="hidden lg:grid grid-cols-1 gap-6">
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
