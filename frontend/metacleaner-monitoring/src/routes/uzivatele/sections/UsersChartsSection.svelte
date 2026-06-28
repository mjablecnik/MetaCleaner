<script lang="ts">
	import { onMount } from 'svelte';
	import { chartColors } from '$lib/theme/chartColors';
	import { t } from '$lib/i18n';

	onMount(() => {
		const Plotly = window.Plotly;
		if (!Plotly) return;

		const bgCard = chartColors.card;
		const textSec = chartColors.textSec;
		const gridColor = 'rgba(30,41,59,0.8)';
		const chartConfig = { responsive: true, displayModeBar: false, displaylogo: false };

		const commonLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 10, r: 10, b: 30, l: 40 },
			showlegend: false,
			xaxis: {
				gridcolor: gridColor,
				linecolor: gridColor,
				tickcolor: 'transparent',
				tickfont: { color: textSec, size: 10 },
				zeroline: false,
				showgrid: false
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
			margin: { t: 5, r: 8, b: 28, l: 36 },
			xaxis: { ...commonLayout.xaxis, tickfont: { color: textSec, size: 9 } },
			yaxis: { ...commonLayout.yaxis, tickfont: { color: textSec, size: 9 } }
		};

		// Registrations data
		const regValues = [
			22, 31, 18, 28, 45, 38, 52, 29, 35, 41, 27, 48, 33, 56, 44, 38, 29, 51, 37, 42, 31, 58, 47,
			39, 28, 44, 62, 35, 48, 67
		];
		const daysDesktop = regValues.map((_, i) => {
			const d = new Date(2024, 4, i + 1);
			return `${d.getDate()}.${d.getMonth() + 1}.`;
		});
		const daysMobile = regValues.map((_, i) => (i % 5 === 0 || i === 29 ? daysDesktop[i] : ''));

		// Desktop charts
		const desktopReg = document.getElementById('chart-registrations-d');
		if (desktopReg) {
			Plotly.newPlot(
				'chart-registrations-d',
				[
					{
						x: daysDesktop,
						y: regValues,
						type: 'bar',
						marker: {
							color: regValues.map((_, i) => (i === 29 ? '#22c55e' : 'rgba(34,197,94,0.35)')),
							line: { width: 0 }
						},
						hovertemplate: '<b>%{x}</b><br>%{y} registrací<extra></extra>'
					}
				],
				{ ...commonLayout },
				chartConfig
			);
		}

		// Mobile charts
		const mobileReg = document.getElementById('chart-registrations-m');
		if (mobileReg) {
			Plotly.newPlot(
				'chart-registrations-m',
				[
					{
						x: daysMobile,
						y: regValues,
						type: 'bar',
						marker: {
							color: regValues.map((_, i) => (i === 29 ? '#22c55e' : 'rgba(34,197,94,0.35)')),
							line: { width: 0 }
						},
						hovertemplate: '<b>%{x}</b><br>%{y} registrací<extra></extra>'
					}
				],
				{ ...mobileLayout },
				chartConfig
			);
		}
	});
</script>

<!-- ===== DESKTOP: Charts Row (single column) ===== -->
<section class="hidden lg:block">
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-6">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('users_charts_registrations')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('users_charts_registrationsSubtitle')}</p>
			</div>
			<span class="px-2.5 py-1 bg-badge rounded-md text-xs text-textSec border border-border"
				>{t('common_timeRange_last30d')}</span
			>
		</div>
		<div id="chart-registrations-d" class="h-[220px] w-full"></div>
	</div>
</section>

<!-- ===== MOBILE: Charts (vertical, separate cards) ===== -->
<section class="lg:hidden space-y-4">
	<div class="bg-card border border-surface rounded-xl p-4">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-sm font-semibold text-textMain">{t('users_charts_registrations')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('common_timeRange_last30d')}</p>
			</div>
			<span class="px-2.5 py-1 bg-badge rounded-md text-xs text-textSec border border-border"
				>{t('common_timeRange_last30d')}</span
			>
		</div>
		<div id="chart-registrations-m" class="h-[180px] w-full"></div>
	</div>
</section>
