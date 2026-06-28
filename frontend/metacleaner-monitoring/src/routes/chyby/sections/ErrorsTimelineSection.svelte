<script lang="ts">
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import PlotlyChart from '$lib/shared/components/PlotlyChart.svelte';

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
	const vals5xx = [1, 0, 2, 1, 3, 5, 7, 12, 6, 4, 3, 2];

	const data5xx = [
		{
			type: 'scatter',
			mode: 'lines',
			fill: 'tozeroy',
			x: hours,
			y: vals5xx,
			line: { color: chartColors.error, width: 2.5, shape: 'spline' },
			fillcolor: 'rgba(239,68,68,0.12)',
			hovertemplate: '<b>%{x}</b><br>Chyby: %{y}<extra></extra>'
		},
		{
			type: 'scatter',
			mode: 'markers',
			x: hours,
			y: vals5xx,
			marker: { color: chartColors.error, size: 5, line: { color: chartColors.card, width: 1.5 } },
			hoverinfo: 'skip'
		}
	];

	const commonLayout = {
		paper_bgcolor: chartColors.card,
		plot_bgcolor: chartColors.card,
		font: { family: 'Inter, sans-serif', color: chartColors.textSec, size: 11 },
		margin: { t: 10, r: 10, b: 40, l: 40 },
		showlegend: false,
		xaxis: {
			gridcolor: 'rgba(30,41,59,0.8)',
			linecolor: 'rgba(30,41,59,0.8)',
			tickcolor: 'transparent',
			tickfont: { color: chartColors.textSec, size: 10 },
			tickvals: hours.filter((_, i) => i % 2 === 0),
			zeroline: false
		},
		yaxis: {
			gridcolor: 'rgba(30,41,59,0.8)',
			linecolor: 'rgba(30,41,59,0.8)',
			tickcolor: 'transparent',
			tickfont: { color: chartColors.textSec, size: 10 },
			zeroline: false
		}
	};

	const mobileLayout = {
		...commonLayout,
		font: { ...commonLayout.font, size: 10 },
		margin: { t: 8, r: 8, b: 32, l: 32 },
		xaxis: {
			...commonLayout.xaxis,
			tickvals: hours.filter((_, i) => i % 3 === 0),
			tickfont: { color: chartColors.textSec, size: 9 }
		},
		yaxis: { ...commonLayout.yaxis, tickfont: { color: chartColors.textSec, size: 9 } }
	};
</script>

<!-- Desktop: 5xx timeline chart card -->
<div class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex justify-between items-center mb-4">
		<h3 class="text-lg font-semibold text-textMain">{t('errors_charts_5xxTimeline')}</h3>
		<span class="px-2 py-1 bg-badge rounded text-xs text-textSec">Backend API</span>
	</div>
	<PlotlyChart
		id="chart-errors-5xx"
		data={data5xx}
		layout={commonLayout}
		{mobileLayout}
		class="h-[220px]"
	/>
</div>

<!-- Mobile: 5xx timeline chart card -->
<div class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<div class="flex items-center justify-between mb-3">
		<h3 class="text-sm font-semibold text-textMain">{t('errors_charts_5xxTimeline')}</h3>
		<span class="px-2 py-1 bg-badge rounded text-[10px] text-textSec">Backend API</span>
	</div>
	<PlotlyChart
		id="chart-errors-5xx-mobile"
		data={data5xx}
		layout={mobileLayout}
		class="h-[180px]"
	/>
</div>
