<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import CohortCell from '../components/CohortCell.svelte';

	type AccKey = 'retention';
	let accOpen = $state<Record<AccKey, boolean>>({ retention: false });

	function toggleAcc(k: AccKey) {
		accOpen[k] = !accOpen[k];
	}

	// Hardcoded cohort data: rows are months, columns are M0-M5
	// null means no data yet
	const cohortData: { monthKey: string; values: (number | null)[] }[] = [
		{ monthKey: 'business_cohort_month_feb24', values: [100, 84, 71, 63, 57, 52] },
		{ monthKey: 'business_cohort_month_mar24', values: [100, 81, 68, 59, 54, null] },
		{ monthKey: 'business_cohort_month_apr24', values: [100, 79, 65, 58, null, null] },
		{ monthKey: 'business_cohort_month_may24', values: [100, 82, 70, null, null, null] },
		{ monthKey: 'business_cohort_month_jun24', values: [100, 86, null, null, null, null] }
	];

	onMount(() => {
		const P = (window as any).Plotly;
		if (!P) return;

		const bgCard = chartColors.card;
		const textSec = chartColors.textSec;
		const primary = chartColors.primary;
		const errorColor = chartColors.error;
		const blueColor = chartColors.blue;
		const gridColor = 'rgba(30,41,59,0.8)';
		const chartConfig = { responsive: true, displayModeBar: false, displaylogo: false };

		const commonLayout: any = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 10, r: 10, b: 40, l: 50 },
			showlegend: false,
			xaxis: { gridcolor: gridColor, linecolor: gridColor, tickcolor: 'transparent', tickfont: { color: textSec, size: 10 }, zeroline: false },
			yaxis: { gridcolor: gridColor, linecolor: gridColor, tickcolor: 'transparent', tickfont: { color: textSec, size: 10 }, zeroline: false }
		};

		const mobileLayout: any = {
			...commonLayout,
			font: { ...commonLayout.font, size: 10 },
			margin: { t: 8, r: 8, b: 36, l: 38 },
			xaxis: { ...commonLayout.xaxis, tickfont: { color: textSec, size: 9 }, nticks: 6 },
			yaxis: { ...commonLayout.yaxis, tickfont: { color: textSec, size: 9 } }
		};

		const months = ['Čvc','Srp','Zář','Říj','Lis','Pro','Led','Úno','Bře','Dub','Kvě','Čvn'];
		const newMrr = [2800,3200,2600,1300,1800,1500,1800,1600,1700,1400,1800,1620];
		const churnMrr = [-800,-650,-900,-1100,-750,-700,-820,-760,-680,-900,-720,-680];

		// Churn chart
		const dataChurn = [
			{ type: 'bar', name: 'Nový MRR', x: months, y: newMrr, marker: { color: primary, opacity: 0.8 } },
			{ type: 'bar', name: 'Churn MRR', x: months, y: churnMrr, marker: { color: errorColor, opacity: 0.8 } }
		];
		const churnLayout = { ...commonLayout, barmode: 'relative', showlegend: true, legend: { x: 0, y: 1, font: { size: 9, color: textSec }, bgcolor: 'transparent' } };
		const churnLayoutM = { ...mobileLayout, barmode: 'relative', showlegend: true, legend: { x: 0, y: 1, font: { size: 8, color: textSec }, bgcolor: 'transparent' } };

		try { const el = document.getElementById('chart-churn'); if (el) P.newPlot('chart-churn', dataChurn, churnLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-churn-m'); if (el) P.newPlot('chart-churn-m', dataChurn, churnLayoutM, chartConfig); } catch(e) {}

		const handleResize = () => {
			['chart-churn', 'chart-churn-m'].forEach(id => {
				const el = document.getElementById(id);
				if (el) P.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- ===== DESKTOP COHORT ===== -->
<section class="hidden lg:grid grid-cols-2 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('business_churnNewMrr_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('business_churnNewMrr_subtitle')}</p>
			</div>
			<div class="flex gap-2">
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-success inline-block"></span>{t('business_churnNewMrr_new')}</span>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-error inline-block"></span>{t('business_churnNewMrr_churn')}</span>
			</div>
		</div>
		<div id="chart-churn" class="h-[240px] w-full"></div>
	</div>
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('business_cohort_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('business_cohort_subtitle')}</p>
			</div>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-xs">
				<thead>
					<tr class="border-b border-surface">
						<th class="text-left text-textSec font-medium pb-2 pr-3">{t('business_cohort_cohort')}</th>
						<th class="text-center text-textSec font-medium pb-2 px-2">M0</th>
						<th class="text-center text-textSec font-medium pb-2 px-2">M1</th>
						<th class="text-center text-textSec font-medium pb-2 px-2">M2</th>
						<th class="text-center text-textSec font-medium pb-2 px-2">M3</th>
						<th class="text-center text-textSec font-medium pb-2 px-2">M4</th>
						<th class="text-center text-textSec font-medium pb-2 px-2">M5</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-surface/40">
					{#each cohortData as row}
						<tr>
							<td class="py-2 pr-3 text-textSec whitespace-nowrap">{t(row.monthKey)}</td>
							{#each row.values as val}
								<td class="py-2 px-2 text-center"><CohortCell percent={val} /></td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>

<!-- ===== MOBILE COHORT ===== -->
<div class="lg:hidden space-y-4">
	<!-- Churn vs MRR -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<div class="flex items-center justify-between mb-3">
			<div>
				<h3 class="text-sm font-semibold text-textMain">{t('business_churnNewMrr_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('business_churnNewMrr_subtitleMobile')}</p>
			</div>
			<div class="flex gap-2">
				<span class="px-2 py-0.5 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>{t('business_churnNewMrr_new')}</span>
				<span class="px-2 py-0.5 bg-badge rounded text-xs text-textSec flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-error inline-block"></span>{t('business_churnNewMrr_churn')}</span>
			</div>
		</div>
		<div id="chart-churn-m" class="h-[200px] w-full"></div>
	</section>

	<!-- Retence kohort Accordion -->
	<section class="bg-card border border-surface rounded-xl overflow-hidden">
		<button onclick={() => toggleAcc('retention')} class="w-full flex items-center justify-between px-4 py-4 min-h-[56px]">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
					<i class="fa-solid fa-table text-success text-xs"></i>
				</div>
				<div class="text-left">
					<p class="text-sm font-semibold text-textMain">{t('business_cohort_title')}</p>
					<p class="text-xs text-textSec">{t('business_cohort_subtitleMobile')}</p>
				</div>
			</div>
			<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {accOpen.retention ? 'rotate-180' : ''}"></i>
		</button>
		{#if accOpen.retention}
			<div class="border-t border-surface p-4 overflow-x-auto">
				<div class="min-w-[340px]">
					<table class="w-full text-xs">
						<thead>
							<tr class="border-b border-surface">
								<th class="text-left text-textSec font-medium pb-2 pr-2">{t('business_cohort_cohort')}</th>
								<th class="text-center text-textSec font-medium pb-2 px-1.5">M0</th>
								<th class="text-center text-textSec font-medium pb-2 px-1.5">M1</th>
								<th class="text-center text-textSec font-medium pb-2 px-1.5">M2</th>
								<th class="text-center text-textSec font-medium pb-2 px-1.5">M3</th>
								<th class="text-center text-textSec font-medium pb-2 px-1.5">M4</th>
								<th class="text-center text-textSec font-medium pb-2 px-1.5">M5</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-surface/40">
							{#each cohortData as row}
								<tr>
									<td class="py-2 pr-2 text-textSec whitespace-nowrap">{t(row.monthKey)}</td>
									{#each row.values as val}
										<td class="py-1.5 px-1.5 text-center"><CohortCell percent={val} /></td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</section>
</div>
