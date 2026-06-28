<script lang="ts">
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import PlotlyChart from '$lib/shared/components/PlotlyChart.svelte';
	import AccordionSection from '$lib/shared/elements/AccordionSection.svelte';
	import { getErrorTypeBreakdown } from '$lib/repositories/errorsRepository';

	const breakdown = getErrorTypeBreakdown();

	let breakdownOpen = $state(true);

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
	const jsVals = [4, 3, 6, 5, 9, 14, 18, 22, 17, 13, 10, 6];
	const backVals = [1, 0, 1, 2, 2, 3, 4, 5, 2, 1, 1, 0];

	const dataJsBackend = [
		{
			type: 'bar',
			name: 'JS Errors',
			x: hours,
			y: jsVals,
			marker: { color: chartColors.secondary, opacity: 0.85 },
			hovertemplate: '<b>%{x}</b><br>JS: %{y}<extra></extra>'
		},
		{
			type: 'bar',
			name: 'Backend',
			x: hours,
			y: backVals,
			marker: { color: chartColors.error, opacity: 0.85 },
			hovertemplate: '<b>%{x}</b><br>Backend: %{y}<extra></extra>'
		}
	];

	const total = breakdown.reduce((s, b) => s + b.count, 0);
	const pieColors = [chartColors.error, chartColors.secondary, chartColors.purple, chartColors.blue];

	const dataPie = [
		{
			type: 'pie',
			labels: breakdown.map((b) => t(b.labelKey)),
			values: breakdown.map((b) => b.count),
			hole: 0.62,
			marker: {
				colors: pieColors,
				line: { color: chartColors.card, width: 2 }
			},
			textinfo: 'none',
			hovertemplate: '<b>%{label}</b><br>%{value} chyb<br>%{percent}<extra></extra>',
			direction: 'clockwise'
		}
	];

	const commonLayout = {
		paper_bgcolor: chartColors.card,
		plot_bgcolor: chartColors.card,
		font: { family: 'Inter, sans-serif', color: chartColors.textSec, size: 11 },
		margin: { t: 10, r: 10, b: 40, l: 40 },
		showlegend: false,
		barmode: 'group',
		bargap: 0.3,
		bargroupgap: 0.1,
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

	const mobileBarLayout = {
		...commonLayout,
		font: { ...commonLayout.font, size: 10 },
		margin: { t: 8, r: 8, b: 32, l: 32 },
		xaxis: { ...commonLayout.xaxis, tickfont: { color: chartColors.textSec, size: 9 } },
		yaxis: { ...commonLayout.yaxis, tickfont: { color: chartColors.textSec, size: 9 } }
	};

	const pieLayout = {
		paper_bgcolor: chartColors.card,
		plot_bgcolor: chartColors.card,
		font: { family: 'Inter, sans-serif', color: chartColors.textSec, size: 11 },
		margin: { t: 10, r: 10, b: 10, l: 10 },
		showlegend: false,
		annotations: [
			{
				text: `<b style="font-size:20px;color:${chartColors.textMain}">${total}</b><br><span style="font-size:11px;color:${chartColors.textSec}">celkem</span>`,
				x: 0.5,
				y: 0.5,
				xanchor: 'center',
				yanchor: 'middle',
				showarrow: false,
				font: { size: 14, color: chartColors.textMain }
			}
		]
	};

	const pieMobileLayout = {
		...pieLayout,
		font: { ...pieLayout.font, size: 10 },
		margin: { t: 8, r: 8, b: 8, l: 8 },
		annotations: [
			{
				...pieLayout.annotations[0],
				text: `<b style="font-size:18px;color:${chartColors.textMain}">${total}</b><br><span style="font-size:10px;color:${chartColors.textSec}">celkem</span>`
			}
		]
	};
</script>

<!-- Desktop: 2-col grid — JS vs Backend bar + Error type donut -->
<section class="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6">
	<!-- JS vs Backend bar chart -->
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<h3 class="text-lg font-semibold text-textMain">{t('errors_charts_jsVsBackend')}</h3>
			<div class="flex gap-3 text-xs">
				<div class="flex items-center gap-1.5">
					<span class="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span><span
						class="text-textSec">JS</span
					>
				</div>
				<div class="flex items-center gap-1.5">
					<span class="w-2.5 h-2.5 rounded-full bg-error inline-block"></span><span
						class="text-textSec">Backend</span
					>
				</div>
			</div>
		</div>
		<PlotlyChart
			id="chart-errors-js-backend"
			data={dataJsBackend}
			layout={commonLayout}
			mobileLayout={mobileBarLayout}
			class="h-[220px]"
		/>
	</div>

	<!-- Error type donut chart + legend -->
	<div class="bg-card border border-surface rounded-xl p-5">
		<h3 class="text-lg font-semibold text-textMain mb-4">{t('errors_charts_errorTypes')}</h3>
		<PlotlyChart
			id="chart-errors-pie"
			data={dataPie}
			layout={pieLayout}
			mobileLayout={pieMobileLayout}
			class="h-[220px]"
		/>
		<div class="mt-3 space-y-2">
			{#each breakdown as item (item.labelKey)}
				<div class="flex items-center justify-between text-sm">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full {item.color} inline-block"></span>
						<span class="text-textSec">{t(item.labelKey)}</span>
					</div>
					<span class="text-textMain font-medium">{item.count}</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Mobile: JS vs Backend chart card + breakdown accordion -->
<div class="lg:hidden space-y-3">
	<!-- JS vs Backend chart -->
	<div class="bg-card border border-surface rounded-xl p-4">
		<div class="flex items-center justify-between mb-3">
			<h3 class="text-sm font-semibold text-textMain">{t('errors_mobile_jsVsBackend')}</h3>
			<div class="flex gap-3 text-[10px]">
				<div class="flex items-center gap-1">
					<span class="w-2 h-2 rounded-full bg-secondary inline-block"></span><span
						class="text-textSec">JS</span
					>
				</div>
				<div class="flex items-center gap-1">
					<span class="w-2 h-2 rounded-full bg-error inline-block"></span><span class="text-textSec"
						>Backend</span
					>
				</div>
			</div>
		</div>
		<PlotlyChart
			id="chart-errors-js-backend-mobile"
			data={dataJsBackend}
			layout={mobileBarLayout}
			class="h-[180px]"
		/>
	</div>

	<!-- Error type breakdown accordion -->
	<AccordionSection
		title={t('errors_charts_errorTypes')}
		open={breakdownOpen}
		ontoggle={() => (breakdownOpen = !breakdownOpen)}
	>
		<PlotlyChart
			id="chart-errors-pie-mobile"
			data={dataPie}
			layout={pieMobileLayout}
			class="h-[200px]"
		/>
		<div class="mt-3 space-y-2.5">
			{#each breakdown as item (item.labelKey)}
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full {item.color} inline-block"></span>
						<span class="text-textSec text-xs">{t(item.labelKey)}</span>
					</div>
					<span class="text-textMain font-semibold text-sm">{item.count}</span>
				</div>
			{/each}
		</div>
	</AccordionSection>
</div>
