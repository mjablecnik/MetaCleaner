<script lang="ts">
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import PlotlyChart from '$lib/shared/components/PlotlyChart.svelte';
	import AccordionSection from '$lib/shared/elements/AccordionSection.svelte';
	import TableSizeRow from '../components/TableSizeRow.svelte';
	import { getTableSizes, getDatabaseStats } from '$lib/repositories/databaseRepository';

	const tableSizes = getTableSizes();
	const dbStats = getDatabaseStats();

	let tableSizesOpen = $state(false);
	let qpsOpen = $state(false);

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
	const qps = [420, 380, 510, 640, 980, 1420, 1840, 2100, 1780, 1540, 1200, 860];

	const dataQps = [
		{
			type: 'bar',
			x: hours,
			y: qps,
			marker: {
				color: qps.map((v) => (v > 1800 ? chartColors.secondary : chartColors.blue)),
				opacity: 0.85
			},
			hovertemplate: '<b>%{x}</b><br>%{y} queries/min<extra></extra>'
		}
	];

	const baseLayout = {
		paper_bgcolor: chartColors.card,
		plot_bgcolor: chartColors.card,
		font: { family: 'Inter, sans-serif', color: chartColors.textSec, size: 11 },
		margin: { t: 10, r: 10, b: 40, l: 45 },
		showlegend: false,
		bargap: 0.3,
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
			zeroline: false,
			title: { text: 'q/min', font: { size: 10, color: chartColors.textSec } }
		}
	};

	const mobileLayout = {
		font: { family: 'Inter, sans-serif', color: chartColors.textSec, size: 10 },
		margin: { t: 8, r: 8, b: 36, l: 38 },
		xaxis: { tickfont: { color: chartColors.textSec, size: 9 } },
		yaxis: { tickfont: { color: chartColors.textSec, size: 9 } }
	};
</script>

<!-- Desktop: 2-col grid: table sizes + QPS chart -->
<section class="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6">
	<!-- Table Sizes -->
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('database_tableSizes_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('database_tableSizes_subtitle')}</p>
			</div>
		</div>
		<div class="space-y-3">
			{#each tableSizes as ts (ts.name)}
				<TableSizeRow tableSize={ts} variant="desktop" />
			{/each}
		</div>
		<div class="mt-5 pt-4 border-t border-surface">
			<div class="flex justify-between text-xs text-textSec mb-2">
				<span>{t('database_tableSizes_totalStorage')}</span>
				<span class="text-textMain font-semibold"
					>{dbStats.totalStorage} / {dbStats.maxStorage}</span
				>
			</div>
			<div class="w-full h-2.5 bg-surface rounded-full overflow-hidden">
				<div
					class="h-full rounded-full"
					style="width:{dbStats.storagePercent}%; background: linear-gradient(90deg, {chartColors.blue} 0%, {chartColors.purple} 100%)"
				></div>
			</div>
			<p class="text-xs text-textSec mt-2">
				Odhadované zaplnění při současném tempu: <span class="text-secondary font-medium"
					>{dbStats.estimatedFillDays}</span
				>
			</p>
		</div>
	</div>

	<!-- QPM Chart -->
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('database_charts_queriesPerMin')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('database_charts_queriesPerMinSubtitle')}</p>
			</div>
		</div>
		<PlotlyChart id="chart-qps" data={dataQps} layout={baseLayout} class="h-[220px]" />
	</div>
</section>

<!-- Mobile: accordions -->
<div class="lg:hidden space-y-3">
	<AccordionSection
		title={t('database_tableSizes_title')}
		open={tableSizesOpen}
		ontoggle={() => (tableSizesOpen = !tableSizesOpen)}
	>
		<div class="space-y-3">
			{#each tableSizes as ts (ts.name)}
				<TableSizeRow tableSize={ts} variant="mobile" />
			{/each}
			<div class="mt-2 pt-4 border-t border-surface">
				<div class="flex justify-between text-xs text-textSec mb-2">
					<span>{t('database_tableSizes_totalStorage')}</span>
					<span class="text-textMain font-semibold"
						>{dbStats.totalStorage} / {dbStats.maxStorage}</span
					>
				</div>
				<div class="w-full h-2.5 bg-surface rounded-full overflow-hidden">
					<div
						class="h-full rounded-full"
						style="width:{dbStats.storagePercent}%; background: linear-gradient(90deg, {chartColors.blue} 0%, {chartColors.purple} 100%)"
					></div>
				</div>
				<p class="text-xs text-textSec mt-2">
					Odhadované zaplnění: <span class="text-secondary font-medium"
						>{dbStats.estimatedFillDays}</span
					>
				</p>
			</div>
		</div>
	</AccordionSection>

	<AccordionSection
		title={t('database_charts_queriesPerMin')}
		open={qpsOpen}
		ontoggle={() => (qpsOpen = !qpsOpen)}
	>
		<PlotlyChart
			id="chart-qps-m"
			data={dataQps}
			layout={baseLayout}
			{mobileLayout}
			class="h-[200px]"
		/>
	</AccordionSection>
</div>
