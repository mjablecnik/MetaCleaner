<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';

	onMount(() => {
		const P = window.Plotly;
		if (!P) return;

		const bgCard = chartColors.card;
		const textSec = chartColors.textSec;
		const primary = chartColors.primary;
		const errorColor = chartColors.error;
		const purpleColor = chartColors.purple;
		const blueColor = chartColors.blue;
		const greenColor = chartColors.greenMuted;
		const gridColor = 'rgba(30,41,59,0.8)';
		const chartConfig = { responsive: true, displayModeBar: false, displaylogo: false };

		const commonLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 10, r: 10, b: 40, l: 50 },
			showlegend: false,
			xaxis: {
				gridcolor: gridColor,
				linecolor: gridColor,
				tickcolor: 'transparent',
				tickfont: { color: textSec, size: 10 },
				zeroline: false
			},
			yaxis: {
				gridcolor: gridColor,
				linecolor: gridColor,
				tickcolor: 'transparent',
				tickfont: { color: textSec, size: 10 },
				zeroline: false
			}
		};

		const mobileLayout = {
			...commonLayout,
			font: { ...commonLayout.font, size: 10 },
			margin: { t: 8, r: 8, b: 36, l: 38 },
			xaxis: { ...commonLayout.xaxis, tickfont: { color: textSec, size: 9 }, nticks: 6 },
			yaxis: { ...commonLayout.yaxis, tickfont: { color: textSec, size: 9 } }
		};

		const months = [
			'Čvc',
			'Srp',
			'Zář',
			'Říj',
			'Lis',
			'Pro',
			'Led',
			'Úno',
			'Bře',
			'Dub',
			'Kvě',
			'Čvn'
		];
		const mrr = [420, 520, 620, 710, 800, 880, 960, 1030, 1090, 1150, 1190, 1240];
		const newMrr = [42, 62, 55, 68, 72, 58, 65, 48, 52, 60, 45, 61];
		const churnMrr = [-12, -18, -22, -15, -28, -20, -18, -25, -14, -22, -18, -14];
		const activeUsers = [1320, 1420, 1540, 1640, 1720, 1790, 1830, 1870, 1900, 1940, 1970, 2100];
		const newUsers = [28, 34, 40, 32, 28, 34, 26, 34, 36, 28, 38, 34];

		// MRR chart
		const dataMrr = [
			{
				type: 'scatter',
				mode: 'lines',
				fill: 'tozeroy',
				name: 'MRR',
				x: months,
				y: mrr,
				line: { color: primary, width: 2, shape: 'spline' },
				fillcolor: 'rgba(34,197,94,0.08)',
				yaxis: 'y'
			},
			{
				type: 'bar',
				name: 'Nový MRR',
				x: months,
				y: newMrr,
				marker: { color: blueColor, opacity: 0.7 },
				yaxis: 'y2'
			}
		];
		const mrrLayout = {
			...commonLayout,
			showlegend: true,
			legend: { x: 0, y: 1, font: { size: 9, color: textSec }, bgcolor: 'transparent' },
			yaxis2: {
				overlaying: 'y',
				side: 'right',
				gridcolor: 'transparent',
				linecolor: 'transparent',
				tickcolor: 'transparent',
				tickfont: { color: textSec, size: 10 },
				zeroline: false
			}
		};
		const mrrLayoutM = {
			...mobileLayout,
			showlegend: true,
			legend: { x: 0, y: 1, font: { size: 8, color: textSec }, bgcolor: 'transparent' },
			yaxis2: {
				overlaying: 'y',
				side: 'right',
				gridcolor: 'transparent',
				linecolor: 'transparent',
				tickcolor: 'transparent',
				tickfont: { color: textSec, size: 9 },
				zeroline: false
			}
		};

		// Users chart
		const dataUsers = [
			{
				type: 'scatter',
				mode: 'lines',
				fill: 'tozeroy',
				name: 'Aktivní',
				x: months,
				y: activeUsers,
				line: { color: purpleColor, width: 2, shape: 'spline' },
				fillcolor: 'rgba(139,92,246,0.08)',
				yaxis: 'y'
			},
			{
				type: 'bar',
				name: 'Noví',
				x: months,
				y: newUsers,
				marker: { color: greenColor, opacity: 0.7 },
				yaxis: 'y2'
			}
		];
		const usersLayout = { ...mrrLayout };
		const usersLayoutM = { ...mrrLayoutM };

		// Churn vs New MRR
		const dataChurn = [
			{
				type: 'bar',
				name: 'Nový MRR',
				x: months,
				y: newMrr,
				marker: { color: primary, opacity: 0.8 }
			},
			{
				type: 'bar',
				name: 'Churn MRR',
				x: months,
				y: churnMrr,
				marker: { color: errorColor, opacity: 0.8 }
			}
		];
		const churnLayout = {
			...commonLayout,
			barmode: 'relative',
			showlegend: true,
			legend: { x: 0, y: 1, font: { size: 9, color: textSec }, bgcolor: 'transparent' }
		};
		const churnLayoutM = {
			...mobileLayout,
			barmode: 'relative',
			showlegend: true,
			legend: { x: 0, y: 1, font: { size: 8, color: textSec }, bgcolor: 'transparent' }
		};

		// Daily revenue
		const dayLabels = Array.from({ length: 30 }, (_, i) => `${i + 1}.6.`);
		const dailyValues = Array.from({ length: 30 }, () => Math.floor(Math.random() * 400 + 1400));
		const dataDailyRevenue = [
			{
				type: 'scatter',
				mode: 'lines',
				fill: 'tozeroy',
				x: dayLabels,
				y: dailyValues,
				line: { color: primary, width: 2, shape: 'spline' },
				fillcolor: 'rgba(34,197,94,0.08)'
			}
		];
		const dailyLayout = { ...commonLayout };
		const dailyLayoutM = { ...mobileLayout };

		// Desktop charts
		try {
			const el = document.getElementById('chart-mrr');
			if (el) P.newPlot('chart-mrr', dataMrr, mrrLayout, chartConfig);
		} catch {}
		try {
			const el = document.getElementById('chart-users');
			if (el) P.newPlot('chart-users', dataUsers, usersLayout, chartConfig);
		} catch {}
		try {
			const el = document.getElementById('chart-churn');
			if (el) P.newPlot('chart-churn', dataChurn, churnLayout, chartConfig);
		} catch {}
		try {
			const el = document.getElementById('chart-daily-revenue');
			if (el) P.newPlot('chart-daily-revenue', dataDailyRevenue, dailyLayout, chartConfig);
		} catch {}

		// Mobile charts
		try {
			const el = document.getElementById('chart-mrr-m');
			if (el) P.newPlot('chart-mrr-m', dataMrr, mrrLayoutM, chartConfig);
		} catch {}
		try {
			const el = document.getElementById('chart-users-m');
			if (el) P.newPlot('chart-users-m', dataUsers, usersLayoutM, chartConfig);
		} catch {}
		try {
			const el = document.getElementById('chart-churn-m');
			if (el) P.newPlot('chart-churn-m', dataChurn, churnLayoutM, chartConfig);
		} catch {}
		try {
			const el = document.getElementById('chart-daily-revenue-m');
			if (el) P.newPlot('chart-daily-revenue-m', dataDailyRevenue, dailyLayoutM, chartConfig);
		} catch {}

		const handleResize = () => {
			[
				'chart-mrr',
				'chart-users',
				'chart-churn',
				'chart-daily-revenue',
				'chart-mrr-m',
				'chart-users-m',
				'chart-churn-m',
				'chart-daily-revenue-m'
			].forEach((id) => {
				const el = document.getElementById(id);
				if (el) P.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- ===== DESKTOP REVENUE CHARTS ===== -->
<div class="hidden lg:block space-y-6">
	<!-- MRR + Users -->
	<section class="grid grid-cols-2 gap-6">
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_charts_mrrGrowth')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_charts_mrrSubtitle')}</p>
				</div>
			</div>
			<div id="chart-mrr" class="h-[240px] w-full"></div>
		</div>
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_charts_userGrowth')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_charts_userSubtitle')}</p>
				</div>
			</div>
			<div id="chart-users" class="h-[240px] w-full"></div>
		</div>
	</section>

	<!-- Churn vs New MRR + Daily Revenue -->
	<section class="grid grid-cols-2 gap-6">
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_churnNewMrr_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_churnNewMrr_subtitle')}</p>
				</div>
				<div class="flex gap-2">
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-success inline-block"></span>{t(
							'business_churnNewMrr_new'
						)}</span
					>
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"
						><span class="w-2 h-2 rounded-full bg-error inline-block"></span>{t(
							'business_churnNewMrr_churn'
						)}</span
					>
				</div>
			</div>
			<div id="chart-churn" class="h-[240px] w-full"></div>
		</div>
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_dailyRevenue_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_dailyRevenue_subtitle')}</p>
				</div>
			</div>
			<div id="chart-daily-revenue" class="h-[240px] w-full"></div>
		</div>
	</section>
</div>

<!-- ===== MOBILE REVENUE CHARTS ===== -->
<div class="lg:hidden space-y-4">
	<!-- MRR Chart -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_charts_mrrGrowth')}</h3>
		<p class="text-xs text-textSec mb-3">{t('business_charts_mrrSubtitle')}</p>
		<div id="chart-mrr-m" class="h-[200px] w-full"></div>
	</section>

	<!-- User Growth Chart -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_charts_userGrowth')}</h3>
		<p class="text-xs text-textSec mb-3">{t('business_charts_userSubtitle')}</p>
		<div id="chart-users-m" class="h-[200px] w-full"></div>
	</section>

	<!-- Churn vs New MRR -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<div class="flex items-center justify-between mb-3">
			<div>
				<h3 class="text-sm font-semibold text-textMain">{t('business_churnNewMrr_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('business_churnNewMrr_subtitleMobile')}</p>
			</div>
			<div class="flex gap-2">
				<span class="px-2 py-0.5 bg-badge rounded text-xs text-textSec flex items-center gap-1"
					><span class="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>{t(
						'business_churnNewMrr_new'
					)}</span
				>
				<span class="px-2 py-0.5 bg-badge rounded text-xs text-textSec flex items-center gap-1"
					><span class="w-1.5 h-1.5 rounded-full bg-error inline-block"></span>{t(
						'business_churnNewMrr_churn'
					)}</span
				>
			</div>
		</div>
		<div id="chart-churn-m" class="h-[200px] w-full"></div>
	</section>

	<!-- Daily Revenue -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_dailyRevenue_title')}</h3>
		<p class="text-xs text-textSec mb-3">{t('business_dailyRevenue_subtitle')}</p>
		<div id="chart-daily-revenue-m" class="h-[180px] w-full"></div>
	</section>
</div>
