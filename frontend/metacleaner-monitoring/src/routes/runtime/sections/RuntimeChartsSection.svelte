<script lang="ts">
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import PlotlyChart from '$lib/shared/components/PlotlyChart.svelte';
	import type { TimeSeriesPoint } from '$lib/repositories/runtimeRepository';

	interface Props {
		cpuTimeSeries?: TimeSeriesPoint[];
		ramTimeSeries?: TimeSeriesPoint[];
	}

	let { cpuTimeSeries = [], ramTimeSeries = [] }: Props = $props();

	function formatTime(timestamp: number): string {
		const date = new Date(timestamp * 1000);
		return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
	}

	const baseLayout = {
		margin: { t: 10, r: 10, b: 30, l: 40 },
		plot_bgcolor: 'transparent',
		paper_bgcolor: 'transparent',
		font: { color: chartColors.textSec, family: 'Inter, sans-serif', size: 11 },
		xaxis: {
			showgrid: true,
			gridcolor: chartColors.surface,
			zeroline: false,
			tickfont: { size: 10 }
		},
		showlegend: false,
		autosize: true
	};

	const mobileLayout = {
		...baseLayout,
		margin: { t: 8, r: 8, b: 28, l: 36 },
		font: { ...baseLayout.font, size: 10 },
		xaxis: { ...baseLayout.xaxis, tickfont: { size: 9 }, nticks: 6 }
	};

	const cpuYAxis = {
		showgrid: true,
		gridcolor: chartColors.surface,
		zeroline: false,
		tickfont: { size: 10 },
		title: '%'
	};

	const ramYAxis = {
		showgrid: true,
		gridcolor: chartColors.surface,
		zeroline: false,
		tickfont: { size: 10 },
		title: 'GB'
	};

	const cpuLayout = { ...baseLayout, yaxis: cpuYAxis };
	const cpuMobileLayout = { ...mobileLayout, yaxis: { ...cpuYAxis, tickfont: { size: 9 } } };
	const ramLayout = { ...baseLayout, yaxis: ramYAxis };
	const ramMobileLayout = { ...mobileLayout, yaxis: { ...ramYAxis, tickfont: { size: 9 } } };

	const cpuChartData = $derived([
		{
			x: cpuTimeSeries.map((p) => formatTime(p.timestamp)),
			y: cpuTimeSeries.map((p) => p.value),
			type: 'scatter',
			mode: 'lines',
			name: 'CPU',
			line: { color: chartColors.secondary, width: 2, shape: 'spline', smoothing: 0.8 },
			fill: 'tozeroy',
			fillcolor: 'rgba(249,115,22,0.07)'
		}
	]);

	const ramChartData = $derived([
		{
			x: ramTimeSeries.map((p) => formatTime(p.timestamp)),
			y: ramTimeSeries.map((p) => p.value / (1024 * 1024 * 1024)),
			type: 'scatter',
			mode: 'lines',
			name: 'RAM',
			line: { color: chartColors.blue, width: 2, shape: 'spline', smoothing: 0.8 },
			fill: 'tozeroy',
			fillcolor: 'rgba(59,130,246,0.07)'
		}
	]);
</script>

<!-- Desktop: Runtime Charts -->
<div class="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5">
		<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_cpuOverTime')}</h3>
		<p class="text-xs text-textSec mt-0.5 mb-4">{t('runtime_charts_cpuSubtitle')}</p>
		{#if cpuTimeSeries.length > 0}
			<PlotlyChart
				id="chart-runtime-cpu"
				data={cpuChartData}
				layout={cpuLayout}
				class="h-[250px]"
			/>
		{:else}
			<div class="h-[250px] flex items-center justify-center">
				<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
			</div>
		{/if}
	</div>
	<div class="bg-card border border-surface rounded-xl p-5">
		<h3 class="text-lg font-semibold text-textMain">{t('runtime_charts_ramOverTime')}</h3>
		<p class="text-xs text-textSec mt-0.5 mb-4">{t('runtime_charts_ramSubtitle')}</p>
		{#if ramTimeSeries.length > 0}
			<PlotlyChart
				id="chart-runtime-ram"
				data={ramChartData}
				layout={ramLayout}
				class="h-[250px]"
			/>
		{:else}
			<div class="h-[250px] flex items-center justify-center">
				<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
			</div>
		{/if}
	</div>
</div>

<!-- Mobile: Runtime Charts -->
<div class="lg:hidden space-y-3">
	<div class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-3">{t('runtime_charts_cpuOverTime')}</h3>
		{#if cpuTimeSeries.length > 0}
			<PlotlyChart
				id="chart-runtime-cpu-m"
				data={cpuChartData}
				layout={cpuMobileLayout}
				class="h-[200px]"
			/>
		{:else}
			<div class="h-[200px] flex items-center justify-center">
				<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
			</div>
		{/if}
	</div>
	<div class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-3">{t('runtime_charts_ramOverTime')}</h3>
		{#if ramTimeSeries.length > 0}
			<PlotlyChart
				id="chart-runtime-ram-m"
				data={ramChartData}
				layout={ramMobileLayout}
				class="h-[200px]"
			/>
		{:else}
			<div class="h-[200px] flex items-center justify-center">
				<p class="text-sm text-textSec">{t('common_labels_noData')}</p>
			</div>
		{/if}
	</div>
</div>
