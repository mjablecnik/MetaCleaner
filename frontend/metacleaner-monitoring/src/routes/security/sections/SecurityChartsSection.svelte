<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import { getAttackTypes } from '$lib/repositories/securityRepository';

	type ChartTab = 'threats' | 'geo' | 'attacks';

	const attackTypes = getAttackTypes();

	let activeTab = $state<ChartTab>('threats');

	function switchTab(tab: ChartTab) {
		activeTab = tab;
		setTimeout(() => {
			const Plotly = (window as any).Plotly;
			if (!Plotly) return;
			const elMap: Record<ChartTab, string> = {
				threats: 'chart-threats-m',
				geo: 'chart-geo-m',
				attacks: 'chart-attack-pie-m'
			};
			const el = document.getElementById(elMap[tab]);
			if (el) Plotly.Plots.resize(el);
		}, 50);
	}

	onMount(() => {
		const Plotly = (window as any).Plotly;
		if (!Plotly) return;

		const bgCard = chartColors.card;
		const textSec = chartColors.textSec;
		const errorColor = chartColors.error;
		const secondaryColor = chartColors.secondary;
		const purpleColor = chartColors.purple;
		const blueColor = chartColors.blue;
		const gridColor = 'rgba(30,41,59,0.8)';
		const chartConfig = { responsive: true, displayModeBar: false, displaylogo: false };

		const commonLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 10, r: 10, b: 40, l: 45 },
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

		const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
		const critical = [1, 0, 0, 1, 2, 3, 4, 6, 3, 2, 1, 1];
		const warnings = [2, 1, 1, 3, 5, 8, 10, 14, 8, 6, 4, 2];

		const dataThreatTimeline = [
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy', name: 'Varování',
				x: hours, y: warnings,
				line: { color: secondaryColor, width: 2, shape: 'spline' },
				fillcolor: 'rgba(249,115,22,0.08)',
				hovertemplate: '<b>%{x}</b><br>Varování: %{y}<extra></extra>'
			},
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy', name: 'Kritické',
				x: hours, y: critical,
				line: { color: errorColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(239,68,68,0.12)',
				hovertemplate: '<b>%{x}</b><br>Kritické: %{y}<extra></extra>'
			}
		];

		const dataGeo = [
			{
				type: 'bar', orientation: 'h',
				x: [12, 18, 24, 38, 67],
				y: ['Ostatní', 'Iran', 'Ukraine', 'China', 'Russia'],
				marker: { color: ['rgba(148,163,184,0.6)', 'rgba(139,92,246,0.7)', 'rgba(249,115,22,0.7)', 'rgba(59,130,246,0.7)', 'rgba(239,68,68,0.8)'] },
				hovertemplate: '<b>%{y}</b><br>Hrozby: %{x}<extra></extra>'
			}
		];

		const dataAttackPie = [
			{
				type: 'pie',
				labels: ['Brute Force', 'SQL Injection', 'XSS', 'Rate Abuse'],
				values: [42, 28, 18, 12],
				hole: 0.60,
				marker: {
					colors: [errorColor, purpleColor, secondaryColor, blueColor],
					line: { color: bgCard, width: 2 }
				},
				textinfo: 'none',
				hovertemplate: '<b>%{label}</b><br>%{value}%<extra></extra>',
				direction: 'clockwise'
			}
		];

		const pieLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 5, r: 5, b: 5, l: 5 },
			showlegend: false,
			annotations: [{
				text: `<b style="font-size:18px;color:${chartColors.error}">42%</b><br><span style="font-size:10px;color:${chartColors.textSec}">Brute Force</span>`,
				x: 0.5, y: 0.5,
				xanchor: 'center', yanchor: 'middle',
				showarrow: false,
				font: { size: 13, color: chartColors.textMain }
			}]
		};

		const mobilePieLayout = {
			...pieLayout,
			annotations: [{
				text: `<b style="font-size:16px;color:${chartColors.error}">42%</b><br><span style="font-size:9px;color:${chartColors.textSec}">Brute Force</span>`,
				x: 0.5, y: 0.5,
				xanchor: 'center', yanchor: 'middle',
				showarrow: false,
				font: { size: 12, color: chartColors.textMain }
			}]
		};

		const geoLayout = {
			...commonLayout,
			margin: { t: 10, r: 20, b: 30, l: 70 },
			xaxis: { ...commonLayout.xaxis, title: { text: 'Počet událostí', font: { size: 10, color: textSec } } }
		};

		const mobileGeoLayout = {
			...mobileLayout,
			margin: { t: 8, r: 16, b: 28, l: 60 }
		};

		// Desktop charts
		const elThreats = document.getElementById('chart-threats');
		if (elThreats) Plotly.newPlot('chart-threats', dataThreatTimeline, commonLayout, chartConfig);

		const elGeo = document.getElementById('chart-geo');
		if (elGeo) Plotly.newPlot('chart-geo', dataGeo, geoLayout, chartConfig);

		const elPie = document.getElementById('chart-attack-pie');
		if (elPie) Plotly.newPlot('chart-attack-pie', dataAttackPie, pieLayout, chartConfig);

		// Mobile charts
		const elThreatsM = document.getElementById('chart-threats-m');
		if (elThreatsM) Plotly.newPlot('chart-threats-m', dataThreatTimeline, mobileLayout, chartConfig);

		const elGeoM = document.getElementById('chart-geo-m');
		if (elGeoM) Plotly.newPlot('chart-geo-m', dataGeo, mobileGeoLayout, chartConfig);

		const elPieM = document.getElementById('chart-attack-pie-m');
		if (elPieM) Plotly.newPlot('chart-attack-pie-m', dataAttackPie, mobilePieLayout, chartConfig);

		const handleResize = () => {
			['chart-threats', 'chart-geo', 'chart-attack-pie',
			 'chart-threats-m', 'chart-geo-m', 'chart-attack-pie-m'].forEach(id => {
				const el = document.getElementById(id);
				if (el) Plotly.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- ===== DESKTOP: Charts Row ===== -->
<section class="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('security_charts_eventsOverTime')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('security_charts_eventsSubtitle')}</p>
			</div>
			<div class="flex gap-2">
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-error inline-block"></span>{t('security_severity_critical')}</span>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-secondary inline-block"></span>{t('common_status_warning')}</span>
			</div>
		</div>
		<div id="chart-threats" class="h-[220px] w-full"></div>
	</div>
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('security_charts_geoOrigins')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('security_charts_geoSubtitle')}</p>
			</div>
		</div>
		<div id="chart-geo" class="h-[220px] w-full"></div>
	</div>
</section>

<!-- ===== MOBILE: Charts — tabbed ===== -->
<section class="lg:hidden bg-card border border-surface rounded-xl overflow-hidden">
	<div class="border-b border-surface">
		<div class="flex">
			<button
				onclick={() => switchTab('threats')}
				class="flex-1 py-3 text-xs font-semibold transition-colors border-b-2 {activeTab === 'threats' ? 'text-textMain border-error' : 'text-textSec border-transparent hover:text-textMain'}"
			>
				{t('security_tabs_events')}
			</button>
			<button
				onclick={() => switchTab('geo')}
				class="flex-1 py-3 text-xs font-semibold transition-colors border-b-2 {activeTab === 'geo' ? 'text-textMain border-error' : 'text-textSec border-transparent hover:text-textMain'}"
			>
				{t('security_tabs_geography')}
			</button>
			<button
				onclick={() => switchTab('attacks')}
				class="flex-1 py-3 text-xs font-semibold transition-colors border-b-2 {activeTab === 'attacks' ? 'text-textMain border-error' : 'text-textSec border-transparent hover:text-textMain'}"
			>
				{t('security_tabs_attackTypes')}
			</button>
		</div>
	</div>
	{#if activeTab === 'threats'}
		<div class="p-4">
			<div class="flex items-center justify-between mb-3">
				<p class="text-xs text-textSec">{t('security_tabs_threatsPerHour')}</p>
				<div class="flex gap-2">
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-error inline-block"></span>{t('security_severity_critical')}</span>
					<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-secondary inline-block"></span>{t('common_status_warning')}</span>
				</div>
			</div>
			<div id="chart-threats-m" class="h-[200px] w-full"></div>
		</div>
	{:else if activeTab === 'geo'}
		<div class="p-4">
			<p class="text-xs text-textSec mb-3">{t('security_charts_geoSubtitleMobile')}</p>
			<div id="chart-geo-m" class="h-[200px] w-full"></div>
		</div>
	{:else if activeTab === 'attacks'}
		<div class="p-4">
			<p class="text-xs text-textSec mb-3">{t('security_attackTypes_subtitle')}</p>
			<div id="chart-attack-pie-m" class="h-[180px] w-full"></div>
			<div class="mt-3 grid grid-cols-2 gap-2">
				{#each attackTypes as attack (attack.id)}
					<div class="flex items-center gap-2 text-xs">
						<span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color:{attack.color}"></span>
						<span class="text-textSec">{attack.label}</span>
						<span class="text-textMain font-semibold ml-auto">{attack.percent}%</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</section>
