<script lang="ts">
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import PlotlyChart from '$lib/shared/components/PlotlyChart.svelte';
	import AccordionSection from '$lib/shared/elements/AccordionSection.svelte';

	let latencyOpen = $state(true);
	let connectionsOpen = $state(false);

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
	const avgLatency = [18, 16, 20, 22, 28, 35, 42, 55, 38, 30, 26, 22];
	const p95Latency = [80, 70, 90, 100, 130, 160, 200, 280, 175, 140, 115, 95];
	const conns = [32, 28, 35, 42, 58, 72, 81, 87, 76, 68, 59, 50];

	const dataLatency = [
		{
			type: 'scatter',
			mode: 'lines',
			fill: 'tozeroy',
			name: 'P95',
			x: hours,
			y: p95Latency,
			line: { color: chartColors.purple, width: 2, shape: 'spline' },
			fillcolor: 'rgba(139,92,246,0.08)',
			hovertemplate: '<b>%{x}</b><br>P95: %{y}ms<extra></extra>'
		},
		{
			type: 'scatter',
			mode: 'lines',
			fill: 'tozeroy',
			name: 'Avg',
			x: hours,
			y: avgLatency,
			line: { color: chartColors.greenMuted, width: 2.5, shape: 'spline' },
			fillcolor: 'rgba(62,207,142,0.10)',
			hovertemplate: '<b>%{x}</b><br>Avg: %{y}ms<extra></extra>'
		}
	];

	const dataConnections = [
		{
			type: 'scatter',
			mode: 'lines',
			fill: 'tozeroy',
			x: hours,
			y: conns,
			line: { color: chartColors.secondary, width: 2.5, shape: 'spline' },
			fillcolor: 'rgba(249,115,22,0.10)',
			hovertemplate: '<b>%{x}</b><br>Spojení: %{y}<extra></extra>'
		},
		{
			type: 'scatter',
			mode: 'lines',
			x: hours,
			y: Array(hours.length).fill(100),
			line: { color: chartColors.error, width: 1.5, dash: 'dot' },
			hovertemplate: 'Limit: 100<extra></extra>'
		}
	];

	const baseLayout = {
		paper_bgcolor: chartColors.card,
		plot_bgcolor: chartColors.card,
		font: { family: 'Inter, sans-serif', color: chartColors.textSec, size: 11 },
		margin: { t: 10, r: 10, b: 40, l: 45 },
		showlegend: false,
		xaxis: {
			gridcolor: 'rgba(30,41,59,0.8)',
			linecolor: 'rgba(30,41,59,0.8)',
			tickcolor: 'transparent',
			tickfont: { color: chartColors.textSec, size: 10 },
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

	const latencyLayout = {
		...baseLayout,
		yaxis: {
			...baseLayout.yaxis,
			title: { text: 'ms', font: { size: 10, color: chartColors.textSec } }
		}
	};

	const connectionsLayout = {
		...baseLayout,
		yaxis: { ...baseLayout.yaxis, range: [0, 115] }
	};

	const mobileLayout = {
		font: { family: 'Inter, sans-serif', color: chartColors.textSec, size: 10 },
		margin: { t: 8, r: 8, b: 36, l: 38 },
		xaxis: { tickfont: { color: chartColors.textSec, size: 9 } },
		yaxis: { tickfont: { color: chartColors.textSec, size: 9 } }
	};
</script>

<!-- Desktop: 2-col chart grid -->
<section class="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6">
	<!-- Latency chart -->
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('database_charts_queryLatency')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('database_charts_queryLatencySubtitle')}</p>
			</div>
			<div class="flex gap-2">
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5">
					<span class="w-2 h-2 rounded-full bg-green-muted inline-block"></span>Avg
				</span>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5">
					<span class="w-2 h-2 rounded-full bg-purple inline-block"></span>P95
				</span>
			</div>
		</div>
		<PlotlyChart id="chart-latency" data={dataLatency} layout={latencyLayout} class="h-[220px]" />
	</div>

	<!-- Connections chart -->
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('database_charts_connections')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('database_charts_connectionsSubtitle')}</p>
			</div>
			<div
				class="flex items-center gap-1.5 px-2 py-1 bg-secondary/10 border border-secondary/20 rounded text-xs text-secondary"
			>
				<i class="fa-solid fa-triangle-exclamation text-xs"></i>
				Limit: 100
			</div>
		</div>
		<PlotlyChart
			id="chart-connections"
			data={dataConnections}
			layout={connectionsLayout}
			class="h-[220px]"
		/>
	</div>
</section>

<!-- Mobile: accordion charts -->
<div class="lg:hidden space-y-3">
	<AccordionSection
		title={t('database_charts_queryLatency')}
		open={latencyOpen}
		ontoggle={() => (latencyOpen = !latencyOpen)}
	>
		{#snippet headerRight()}
			<div class="flex gap-1.5">
				<span class="flex items-center gap-1 text-[10px] text-textSec"
					><span class="w-1.5 h-1.5 rounded-full bg-green-muted inline-block"></span>Avg</span
				>
				<span class="flex items-center gap-1 text-[10px] text-textSec"
					><span class="w-1.5 h-1.5 rounded-full bg-purple inline-block"></span>P95</span
				>
			</div>
		{/snippet}
		<PlotlyChart
			id="chart-latency-m"
			data={dataLatency}
			layout={latencyLayout}
			{mobileLayout}
			class="h-[200px]"
		/>
	</AccordionSection>

	<AccordionSection
		title={t('database_charts_connections')}
		open={connectionsOpen}
		ontoggle={() => (connectionsOpen = !connectionsOpen)}
	>
		{#snippet headerRight()}
			<div
				class="flex items-center gap-1 px-2 py-1 bg-secondary/10 border border-secondary/20 rounded text-[10px] text-secondary"
			>
				<i class="fa-solid fa-triangle-exclamation text-[9px]"></i> Limit: 100
			</div>
		{/snippet}
		<PlotlyChart
			id="chart-connections-m"
			data={dataConnections}
			layout={connectionsLayout}
			{mobileLayout}
			class="h-[200px]"
		/>
	</AccordionSection>
</div>
