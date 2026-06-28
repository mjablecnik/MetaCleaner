<script lang="ts">
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import PlotlyChart from '$lib/shared/components/PlotlyChart.svelte';

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
		yaxis: {
			showgrid: true,
			gridcolor: chartColors.surface,
			zeroline: false,
			tickfont: { size: 10 },
			title: 'ms'
		},
		showlegend: false,
		autosize: true
	};

	const mobileLayout = {
		...baseLayout,
		margin: { t: 8, r: 8, b: 28, l: 36 },
		font: { ...baseLayout.font, size: 10 },
		xaxis: { ...baseLayout.xaxis, tickfont: { size: 9 }, nticks: 6 },
		yaxis: { ...baseLayout.yaxis, tickfont: { size: 9 } }
	};

	const hours = Array.from({ length: 48 }, (_, i) => {
		const h = Math.floor(i / 2);
		const m = i % 2 === 0 ? '00' : '30';
		return `${String(h).padStart(2, '0')}:${m}`;
	});

	const frontendRT = hours.map(() => Math.random() * 30 + 80);
	frontendRT[10] = 420;
	const backendRT = hours.map(() => Math.random() * 60 + 220);
	backendRT[22] = 820;
	backendRT[23] = 690;

	const chartData = [
		{
			x: hours,
			y: frontendRT,
			type: 'scatter',
			mode: 'lines',
			name: 'Frontend',
			line: { color: chartColors.primary, width: 2, shape: 'spline', smoothing: 0.8 },
			fill: 'tozeroy',
			fillcolor: 'rgba(34,197,94,0.07)'
		},
		{
			x: hours,
			y: backendRT,
			type: 'scatter',
			mode: 'lines',
			name: 'Backend API',
			line: { color: chartColors.blue, width: 2, shape: 'spline', smoothing: 0.8 },
			fill: 'tozeroy',
			fillcolor: 'rgba(59,130,246,0.07)'
		}
	];
</script>

<!-- Desktop: col-span-2 in a 3-col grid (used inside AvailabilityHealthChecksSection grid) -->
<div class="hidden lg:block col-span-2 bg-card border border-surface rounded-xl p-5">
	<div class="flex items-center justify-between gap-3 mb-5">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('availability_charts_responseTime')}</h3>
			<p class="text-xs text-textSec mt-1">{t('availability_charts_responseTimeSubtitle')}</p>
		</div>
		<div class="flex gap-4 text-sm">
			<div class="flex items-center gap-2">
				<span class="w-3 h-0.5 bg-success inline-block"></span>
				<span class="text-textSec">Frontend</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="w-3 h-0.5 bg-blue inline-block"></span>
				<span class="text-textSec">Backend API</span>
			</div>
		</div>
	</div>
	<PlotlyChart id="chart-response-time" data={chartData} layout={baseLayout} class="h-[260px]" />
</div>

<!-- Mobile chart -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<div class="flex items-center justify-between mb-1">
		<div>
			<h3 class="text-sm font-semibold text-textMain">{t('availability_charts_responseTime')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('common_timeRange_last24h')}</p>
		</div>
		<div class="flex gap-3 text-xs">
			<div class="flex items-center gap-1.5">
				<span class="w-2.5 h-0.5 bg-success inline-block rounded"></span><span class="text-textSec"
					>FE</span
				>
			</div>
			<div class="flex items-center gap-1.5">
				<span class="w-2.5 h-0.5 bg-blue inline-block rounded"></span><span class="text-textSec"
					>API</span
				>
			</div>
		</div>
	</div>
	<PlotlyChart
		id="chart-response-time-m"
		data={chartData}
		layout={mobileLayout}
		class="h-[200px]"
	/>
</section>
