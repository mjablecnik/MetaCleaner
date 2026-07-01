<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import type { ConversionFunnelStep, PlanRevenue } from '$lib/repositories/businessRepository';
	import FunnelStep from '../components/FunnelStep.svelte';

	let {
		conversionFunnel,
		planRevenue
	}: { conversionFunnel: ConversionFunnelStep[] | null; planRevenue: PlanRevenue[] } = $props();

	onMount(() => {
		const P = window.Plotly;
		if (!P) return;

		const bgCard = chartColors.card;
		const textSec = chartColors.textSec;
		const primary = chartColors.primary;
		const purpleColor = chartColors.purple;
		const chartConfig = { responsive: true, displayModeBar: false, displaylogo: false };

		const pieLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 5, r: 5, b: 5, l: 5 },
			showlegend: false
		};

		// Plan revenue pie
		const dataPlanRevenue = [
			{
				type: 'pie',
				labels: ['Free', 'Pro', 'Business'],
				values: [0, 558, 783],
				hole: 0.58,
				marker: {
					colors: ['#475569', primary, purpleColor],
					line: { color: bgCard, width: 2 }
				},
				textinfo: 'none',
				hovertemplate: '<b>%{label}</b><br>$%{value}<extra></extra>'
			}
		];
		const planPieLayout = {
			...pieLayout,
			annotations: [
				{
					text: `<b style="font-size:14px;color:${chartColors.textMain}">$1,240</b><br><span style="font-size:9px;color:${chartColors.textSec}">MRR celkem</span>`,
					x: 0.5,
					y: 0.5,
					xanchor: 'center',
					yanchor: 'middle',
					showarrow: false
				}
			]
		};

		try {
			const el = document.getElementById('chart-plan-revenue');
			if (el) P.newPlot('chart-plan-revenue', dataPlanRevenue, planPieLayout, chartConfig);
		} catch {}
		try {
			const el = document.getElementById('chart-plan-revenue-m');
			if (el) P.newPlot('chart-plan-revenue-m', dataPlanRevenue, planPieLayout, chartConfig);
		} catch {}

		const handleResize = () => {
			['chart-plan-revenue', 'chart-plan-revenue-m'].forEach((id) => {
				const el = document.getElementById(id);
				if (el) P.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- ===== DESKTOP FUNNEL ===== -->
<section class="hidden lg:grid grid-cols-3 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5 col-span-1">
		<h3 class="text-lg font-semibold text-textMain mb-1">{t('business_funnel_title')}</h3>
		<p class="text-xs text-textSec mb-4">{t('business_funnel_subtitle')}</p>
		{#if conversionFunnel && conversionFunnel.length > 0}
			<div class="space-y-3">
				{#each conversionFunnel as step (step.labelKey)}
					<FunnelStep
						labelKey={step.labelKey}
						value={step.value}
						conversionPercent={step.conversionPercent}
						color={step.color}
					/>
				{/each}
			</div>
			<div class="mt-4 pt-3 border-t border-surface grid grid-cols-2 gap-2 text-xs">
				<div>
					<span class="text-textSec">{t('business_funnel_totalConversion')}</span>
					<div class="text-textMain font-semibold">0.72%</div>
				</div>
				<div>
					<span class="text-textSec">{t('business_funnel_trialToPaid')}</span>
					<div class="text-textMain font-semibold">4.84%</div>
				</div>
			</div>
		{:else}
			<p class="text-sm text-textSec">{t('business_funnel_dataNotAvailable')}</p>
		{/if}
	</div>
	<div class="bg-card border border-surface rounded-xl p-5 col-span-2">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('business_revenueByPlan_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('business_revenueByPlan_subtitle')}</p>
			</div>
		</div>
		<div id="chart-plan-revenue" class="h-[200px] w-full"></div>
		<div class="mt-3 grid grid-cols-3 gap-2">
			{#each planRevenue as plan (plan.label)}
				<div
					class="text-center p-2 rounded-lg"
					style="background:{plan.color}1a;border:1px solid {plan.color}33"
				>
					<div class="text-sm font-bold" style="color:{plan.color}">
						${plan.value.toLocaleString()}
					</div>
					<div class="text-xs text-textSec">{plan.label}</div>
					<div class="text-xs text-textSec">{plan.percent}</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ===== MOBILE FUNNEL ===== -->
<div class="lg:hidden space-y-4">
	<!-- Konverzní trychtýř -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_funnel_title')}</h3>
		<p class="text-xs text-textSec mb-4">{t('business_funnel_subtitle')}</p>
		{#if conversionFunnel && conversionFunnel.length > 0}
			<div class="space-y-3">
				{#each conversionFunnel as step (step.labelKey)}
					<FunnelStep
						labelKey={step.labelKey}
						value={step.value}
						conversionPercent={step.conversionPercent}
						color={step.color}
					/>
				{/each}
			</div>
			<div class="mt-4 pt-3 border-t border-surface grid grid-cols-2 gap-2 text-xs">
				<div>
					<span class="text-textSec">{t('business_funnel_totalConversion')}</span>
					<div class="text-textMain font-semibold">0.72%</div>
				</div>
				<div>
					<span class="text-textSec">{t('business_funnel_trialToPaid')}</span>
					<div class="text-textMain font-semibold">4.84%</div>
				</div>
			</div>
		{:else}
			<p class="text-sm text-textSec">{t('business_funnel_dataNotAvailable')}</p>
		{/if}
	</section>

	<!-- Příjem podle plánu -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_revenueByPlan_title')}</h3>
		<p class="text-xs text-textSec mb-3">{t('business_revenueByPlan_subtitle')}</p>
		<div id="chart-plan-revenue-m" class="h-[180px] w-full"></div>
		<div class="mt-3 grid grid-cols-2 gap-2">
			{#each planRevenue as plan (plan.label)}
				<div
					class="text-center p-2 rounded-lg"
					style="background:{plan.color}1a;border:1px solid {plan.color}33"
				>
					<div class="text-sm font-bold" style="color:{plan.color}">
						${plan.value.toLocaleString()}
					</div>
					<div class="text-xs text-textSec">{plan.label} · {plan.percent}</div>
				</div>
			{/each}
		</div>
	</section>
</div>
