<script lang="ts">
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import PlotlyChart from '$lib/shared/components/PlotlyChart.svelte';
	import AccordionSection from '$lib/shared/elements/AccordionSection.svelte';
	import SlowQueryItem from '../components/SlowQueryItem.svelte';
	import { getQueryTypeDistribution, getSlowestQueries } from '$lib/repositories/databaseRepository';

	const queryTypes = getQueryTypeDistribution();
	const slowQueries = getSlowestQueries();

	let queryTypesOpen = $state(false);
	let slowQueriesOpen = $state(true);

	const dataPie = [
		{
			type: 'pie',
			labels: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
			values: [68, 18, 11, 3],
			hole: 0.60,
			marker: {
				colors: [chartColors.blue, chartColors.greenMuted, chartColors.secondary, chartColors.error],
				line: { color: chartColors.card, width: 2 }
			},
			textinfo: 'none',
			hovertemplate: '<b>%{label}</b><br>%{value}%<extra></extra>',
			direction: 'clockwise'
		}
	];

	const pieLayout = {
		paper_bgcolor: chartColors.card,
		plot_bgcolor: chartColors.card,
		font: { family: 'Inter, sans-serif', color: chartColors.textSec, size: 11 },
		margin: { t: 5, r: 5, b: 5, l: 5 },
		showlegend: false,
		annotations: [
			{
				text: `<b style="font-size:18px;color:${chartColors.textMain}">68%</b><br><span style="font-size:10px;color:${chartColors.textSec}">SELECT</span>`,
				x: 0.5,
				y: 0.5,
				xanchor: 'center',
				yanchor: 'middle',
				showarrow: false,
				font: { size: 13, color: chartColors.textMain }
			}
		]
	};

	const mobilePieLayout = {
		...pieLayout,
		font: { ...pieLayout.font, size: 10 },
		annotations: [
			{
				text: `<b style="font-size:16px;color:${chartColors.textMain}">68%</b><br><span style="font-size:9px;color:${chartColors.textSec}">SELECT</span>`,
				x: 0.5,
				y: 0.5,
				xanchor: 'center',
				yanchor: 'middle',
				showarrow: false,
				font: { size: 12, color: chartColors.textMain }
			}
		]
	};
</script>

<!-- Desktop: 3-col grid: pie (1 col) + slow queries (2 cols) -->
<section class="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
	<!-- Query Types pie -->
	<div class="bg-card border border-surface rounded-xl p-5">
		<h3 class="text-lg font-semibold text-textMain mb-1">{t('database_charts_queryTypes')}</h3>
		<p class="text-xs text-textSec mb-4">{t('database_charts_queryTypesSubtitle')}</p>
		<PlotlyChart id="chart-query-pie" data={dataPie} layout={pieLayout} class="h-[200px]" />
		<div class="mt-4 space-y-2">
			{#each queryTypes as qt}
				<div class="flex items-center justify-between text-sm">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full {qt.color} inline-block"></span>
						<span class="text-textSec">{qt.label}</span>
					</div>
					<span class="text-textMain font-medium">{qt.percent}%</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Slow Queries -->
	<div class="bg-card border border-surface rounded-xl p-5 lg:col-span-2">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('database_slowQueries_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('database_slowQueries_subtitle')}</p>
			</div>
			<span class="text-xs text-textSec bg-badge px-2 py-1 rounded"
				>{t('common_timeRange_last24h')}</span
			>
		</div>
		<div class="space-y-3">
			{#each slowQueries as q (q.sql)}
				<SlowQueryItem query={q} variant="desktop" />
			{/each}
		</div>
	</div>
</section>

<!-- Mobile: accordions -->
<div class="lg:hidden space-y-3">
	<AccordionSection
		title={t('database_charts_queryTypes')}
		open={queryTypesOpen}
		ontoggle={() => (queryTypesOpen = !queryTypesOpen)}
	>
		<PlotlyChart
			id="chart-query-pie-m"
			data={dataPie}
			layout={pieLayout}
			mobileLayout={mobilePieLayout}
			class="h-[180px]"
		/>
		<div class="mt-3 grid grid-cols-2 gap-2">
			{#each queryTypes as qt}
				<div class="flex items-center justify-between bg-surface/40 rounded-lg px-3 py-2">
					<div class="flex items-center gap-2">
						<span class="w-2 h-2 rounded-full {qt.color} inline-block"></span>
						<span class="text-textSec text-xs">{qt.label}</span>
					</div>
					<span class="text-textMain text-xs font-semibold">{qt.percent}%</span>
				</div>
			{/each}
		</div>
	</AccordionSection>

	<AccordionSection
		title={t('database_slowQueries_title')}
		open={slowQueriesOpen}
		ontoggle={() => (slowQueriesOpen = !slowQueriesOpen)}
	>
		<div class="space-y-2">
			{#each slowQueries as q (q.sql)}
				<SlowQueryItem query={q} variant="mobile" />
			{/each}
		</div>
	</AccordionSection>
</div>
