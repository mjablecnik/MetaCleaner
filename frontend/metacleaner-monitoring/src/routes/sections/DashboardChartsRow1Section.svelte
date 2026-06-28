<script lang="ts">
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import PlotlyChart from '$lib/shared/components/PlotlyChart.svelte';
	import { getResponseTimeStat } from '$lib/repositories/dashboardRepository';

	const rt = getResponseTimeStat();

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

	const yResponse = Array.from({ length: 50 }, () => Math.random() * 50 + 200);
	yResponse[15] = 800;
	yResponse[35] = 600;

	const responseTimeData = [
		{
			x: xTime,
			y: yResponse,
			type: 'scatter',
			mode: 'lines',
			line: { color: chartColors.primary, width: 2, shape: 'spline', smoothing: 0.8 },
			fill: 'tozeroy',
			fillcolor: 'rgba(34, 197, 94, 0.1)'
		}
	];

	const yErrors = Array.from({ length: 50 }, () =>
		Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0
	);

	const errorsData = [
		{
			x: xTime,
			y: yErrors,
			type: 'bar',
			marker: { color: chartColors.error, cornerradius: 2 }
		}
	];
</script>

<section class="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
	<!-- Response Time chart -->
	<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-4 lg:p-5 shadow-sm">
		<div class="flex justify-between items-start lg:items-center mb-4 lg:mb-6">
			<div>
				<h3 class="text-base lg:text-lg font-semibold text-textMain">
					{t('dashboard_charts_responseTime')}
				</h3>
				<div class="flex items-baseline gap-1 mt-1 lg:hidden">
					<span class="text-2xl font-bold text-textMain">{rt.value}</span>
					<span class="text-sm text-textSec">{rt.unit} ({rt.percentile})</span>
				</div>
			</div>
			<span class="hidden lg:block text-2xl font-bold text-textMain">
				{rt.value} <span class="text-sm text-textSec font-normal">{rt.unit}</span>
			</span>
		</div>
		<PlotlyChart
			id="chart-response-time"
			data={responseTimeData}
			layout={chartLayout}
			class="h-[200px] lg:h-[250px]"
		/>
	</div>

	<!-- Errors chart -->
	<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-4 lg:p-5 shadow-sm">
		<div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 mb-4 lg:mb-6">
			<h3 class="text-base lg:text-lg font-semibold text-textMain">
				{t('dashboard_charts_errors')}
				<span class="hidden lg:inline">{t('dashboard_charts_errorsSuffix')}</span>
			</h3>
			<div class="relative lg:static">
				<select
					class="w-full lg:w-auto appearance-none bg-surface border border-border text-sm text-textMain rounded-xl lg:rounded-md px-4 lg:px-3 py-3 lg:py-1.5 pr-10 lg:pr-3 focus:outline-none touch-target lg:min-h-0"
				>
					<option>{t('common_status_all')}</option>
					<option>5xx</option>
					<option>{t('dashboard_filters_jsErrors')}</option>
				</select>
				<div
					class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-textSec lg:hidden"
				>
					<i class="fa-solid fa-chevron-down text-xs"></i>
				</div>
			</div>
		</div>
		<PlotlyChart
			id="chart-errors"
			data={errorsData}
			layout={chartLayout}
			class="h-[200px] lg:h-[250px]"
		/>
	</div>
</section>
