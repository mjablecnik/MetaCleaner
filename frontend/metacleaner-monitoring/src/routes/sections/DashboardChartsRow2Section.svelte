<script lang="ts">
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import PlotlyChart from '$lib/shared/components/PlotlyChart.svelte';

	const chartLayout = {
		margin: { t: 10, r: 10, b: 30, l: 40 },
		plot_bgcolor: 'transparent',
		paper_bgcolor: 'transparent',
		font: { color: chartColors.textSec, family: 'Inter, sans-serif' },
		xaxis: {
			showgrid: true,
			gridcolor: chartColors.surface,
			zeroline: false,
			tickfont: { size: 10 }
		},
		yaxis: {
			showgrid: true,
			gridcolor: chartColors.surface,
			zeroline: false,
			tickfont: { size: 10 }
		},
		showlegend: false,
		autosize: true
	};

	const xTime = Array.from({ length: 50 }, (_, i) => `10:${i < 10 ? '0' + i : i}`);

	const yCpu = Array.from({ length: 50 }, () => Math.random() * 20 + 30);
	const yRam = Array.from({ length: 50 }, () => Math.random() * 10 + 60);

	const resourcesData = [
		{
			x: xTime,
			y: yCpu,
			name: 'CPU',
			type: 'scatter',
			mode: 'lines',
			line: { color: chartColors.blue, width: 2, shape: 'spline' },
			fill: 'tozeroy',
			fillcolor: 'rgba(59, 130, 246, 0.1)'
		},
		{
			x: xTime,
			y: yRam,
			name: 'RAM',
			type: 'scatter',
			mode: 'lines',
			line: { color: chartColors.purple, width: 2, shape: 'spline' },
			fill: 'tozeroy',
			fillcolor: 'rgba(139, 92, 246, 0.1)'
		}
	];

	const yDbLat = Array.from({ length: 50 }, () => Math.random() * 10 + 40);

	const dbLatencyData = [
		{
			x: xTime,
			y: yDbLat,
			type: 'scatter',
			mode: 'lines',
			line: { color: chartColors.secondary, width: 2, shape: 'spline' }
		}
	];
</script>

<section class="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
	<!-- Server Resources chart -->
	<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-4 lg:p-5 shadow-sm">
		<div class="flex justify-between items-center mb-4 lg:mb-6">
			<h3 class="text-base lg:text-lg font-semibold text-textMain">
				{t('dashboard_charts_serverResources')}
			</h3>
			<div
				class="flex gap-4 text-sm bg-surface/50 lg:bg-transparent p-2 lg:p-0 rounded-lg lg:rounded-none"
			>
				<div class="flex items-center gap-2">
					<span class="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full lg:rounded bg-blue"></span>
					<span class="text-textMain lg:text-textSec font-medium lg:font-normal">CPU</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full lg:rounded bg-purple"></span>
					<span class="text-textMain lg:text-textSec font-medium lg:font-normal">RAM</span>
				</div>
			</div>
		</div>
		<PlotlyChart
			id="chart-resources"
			data={resourcesData}
			layout={chartLayout}
			class="h-[200px] lg:h-[250px]"
		/>
	</div>

	<!-- DB Latency chart (desktop only) -->
	<div class="hidden lg:block bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-6">
			<h3 class="text-lg font-semibold text-textMain">{t('dashboard_charts_dbLatency')}</h3>
			<span class="px-2 py-1 bg-badge rounded text-xs text-textMain">Supabase</span>
		</div>
		<PlotlyChart id="chart-db" data={dbLatencyData} layout={chartLayout} class="h-[250px]" />
	</div>
</section>
