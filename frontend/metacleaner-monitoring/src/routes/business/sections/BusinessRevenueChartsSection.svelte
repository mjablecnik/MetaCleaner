<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import { getLtvCacMetrics } from '$lib/repositories/businessRepository';

	const ltvCac = getLtvCacMetrics();

	type AccKey = 'ltv' | 'arpu' | 'heatmap' | 'waterfall';
	let accOpen = $state<Record<AccKey, boolean>>({ ltv: false, arpu: false, heatmap: false, waterfall: false });

	function toggleAcc(k: AccKey) {
		accOpen[k] = !accOpen[k];
		if (accOpen[k]) {
			setTimeout(() => {
				const P = (window as any).Plotly;
				if (!P) return;
				const map: Record<AccKey, string> = { ltv: 'chart-ltv-cac-m', arpu: 'chart-arpu-m', heatmap: 'chart-heatmap-m', waterfall: 'chart-waterfall-m' };
				const id = map[k];
				if (id) { const el = document.getElementById(id); if (el) P.Plots.resize(el); }
			}, 50);
		}
	}

	onMount(() => {
		const P = (window as any).Plotly;
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
		const mrr = [28000,31200,33800,35100,36900,38400,40200,41800,43500,44900,46700,48320];
		const newMrr = [2800,3200,2600,1300,1800,1500,1800,1600,1700,1400,1800,1620];
		const activeUsers = [7200,7800,8400,8900,9300,9800,10200,10700,11200,11600,12100,12841];
		const newUsers = [180,220,260,210,190,250,200,240,260,220,280,318];

		// MRR chart data
		const dataMrr = [
			{ type: 'scatter', mode: 'lines', fill: 'tozeroy', name: 'MRR', x: months, y: mrr, line: { color: primary, width: 2, shape: 'spline' }, fillcolor: 'rgba(34,197,94,0.08)', yaxis: 'y' },
			{ type: 'bar', name: 'Nový MRR', x: months, y: newMrr, marker: { color: blueColor, opacity: 0.7 }, yaxis: 'y2' }
		];
		const mrrLayout = { ...commonLayout, showlegend: true, legend: { x: 0, y: 1, font: { size: 9, color: textSec }, bgcolor: 'transparent' }, yaxis2: { overlaying: 'y', side: 'right', gridcolor: 'transparent', linecolor: 'transparent', tickcolor: 'transparent', tickfont: { color: textSec, size: 10 }, zeroline: false } };
		const mrrLayoutM = { ...mobileLayout, showlegend: true, legend: { x: 0, y: 1, font: { size: 8, color: textSec }, bgcolor: 'transparent' }, yaxis2: { overlaying: 'y', side: 'right', gridcolor: 'transparent', linecolor: 'transparent', tickcolor: 'transparent', tickfont: { color: textSec, size: 9 }, zeroline: false } };

		// Users chart data
		const dataUsers = [
			{ type: 'scatter', mode: 'lines', fill: 'tozeroy', name: 'Aktivní', x: months, y: activeUsers, line: { color: purpleColor, width: 2, shape: 'spline' }, fillcolor: 'rgba(139,92,246,0.08)', yaxis: 'y' },
			{ type: 'bar', name: 'Noví', x: months, y: newUsers, marker: { color: greenColor, opacity: 0.7 }, yaxis: 'y2' }
		];
		const usersLayout = { ...mrrLayout };
		const usersLayoutM = { ...mrrLayoutM };

		// LTV vs CAC
		const planLabels = ['Starter','Pro','Business','Enterprise'];
		const dataLtvCac = [
			{ type: 'scatter', mode: 'lines+markers', name: 'LTV', x: planLabels, y: [1840,1840,1840,1840], line: { color: primary, width: 2 }, marker: { color: primary, size: 7 } },
			{ type: 'scatter', mode: 'lines+markers', name: 'CAC', x: planLabels, y: [438,438,438,438], line: { color: errorColor, width: 2 }, marker: { color: errorColor, size: 7 } }
		];
		const ltvLayout = { ...commonLayout, showlegend: true, legend: { x: 0, y: 1, font: { size: 9, color: textSec }, bgcolor: 'transparent' } };
		const ltvLayoutM = { ...mobileLayout, showlegend: true, legend: { x: 0, y: 1, font: { size: 8, color: textSec }, bgcolor: 'transparent' } };

		// ARPU
		const arpuVals = [37.62,36.42,35.22,34.02,32.82,31.62,30.42,29.22,28.02,26.82,25.62,24.42];
		const dataArpu = [
			{ type: 'scatter', mode: 'lines', name: 'ARPU', x: months, y: arpuVals, line: { color: blueColor, width: 2, shape: 'spline' } },
			{ type: 'scatter', mode: 'lines', name: 'Cíl', x: months, y: months.map(() => 40.00), line: { color: primary, width: 1.5, dash: 'dash' } }
		];
		const arpuLayout = { ...commonLayout, showlegend: true, legend: { x: 0, y: 1, font: { size: 9, color: textSec }, bgcolor: 'transparent' } };
		const arpuLayoutM = { ...mobileLayout, showlegend: true, legend: { x: 0, y: 1, font: { size: 8, color: textSec }, bgcolor: 'transparent' } };

		// Heatmap
		const heatZ: number[][] = [];
		let v = 0.1;
		for (let i = 0; i < 12; i++) {
			const row: number[] = [];
			for (let j = 0; j < 12; j++) { row.push(parseFloat(v.toFixed(2))); v += 0.018; }
			heatZ.push(row);
		}
		const dataHeatmap = [{ type: 'heatmap', z: heatZ, x: months, y: ['Po','Út','St','Čt','Pá','So','Ne','Po2','Út2','St2','Čt2','Pá2'], colorscale: 'Viridis', showscale: false }];
		const heatLayout = { ...commonLayout };
		const heatLayoutM = { ...mobileLayout };

		// Waterfall
		const dataWaterfall = [{ type: 'waterfall', x: months, y: [48320,48320,48320,48320,48320,48320,48320,48320,48320,48320,48320,48320], connector: { line: { color: gridColor } }, increasing: { marker: { color: primary } }, decreasing: { marker: { color: errorColor } }, totals: { marker: { color: blueColor } } }];
		const waterfallLayout = { ...commonLayout };
		const waterfallLayoutM = { ...mobileLayout };

		// Upgrade funnel
		const dataUpgradeFunnel = [{ type: 'funnel', values: [84210,12318,6840,2104,1840], text: ['Návštěvníci','Registrace','Trial aktivace','Trial→Placený','Aktivní platiaci'], marker: { color: [blueColor, purpleColor, primary, greenColor, chartColors.secondary] }, textinfo: 'value+text' }];
		const funnelLayout = { ...commonLayout, margin: { t: 10, r: 10, b: 10, l: 10 } };
		const funnelLayoutM = { ...mobileLayout, margin: { t: 8, r: 8, b: 8, l: 8 } };

		// Daily revenue
		const dayLabels = ['1.6.24','2.6.24','3.6.24','4.6.24','5.6.24','6.6.24','7.6.24','8.6.24','9.6.24','10.6.24','11.6.24','12.6.24'];
		const dataDailyRevenue = [{ type: 'scatter', mode: 'lines', fill: 'tozeroy', x: dayLabels, y: [23194,23194,23194,23194,23194,23194,23194,23194,23194,23194,23194,23194], line: { color: primary, width: 2 }, fillcolor: 'rgba(34,197,94,0.08)' }];
		const dailyLayout = { ...commonLayout };
		const dailyLayoutM = { ...mobileLayout };

		// Channel pie
		const dataChannel = [{ type: 'pie', labels: ['Google Ads','LinkedIn','Facebook','YouTube','Other'], values: [23194,15462,6282,3382,1111], hole: 0.55, marker: { colors: [blueColor, purpleColor, greenColor, errorColor, chartColors.secondary], line: { color: bgCard, width: 2 } }, textinfo: 'none', hovertemplate: '<b>%{label}</b><br>$%{value}<extra></extra>' }];
		const channelPieLayout: any = {
			paper_bgcolor: bgCard, plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 5, r: 5, b: 5, l: 5 }, showlegend: false,
			annotations: [{ text: `<b style="font-size:14px;color:${chartColors.textMain}">48%</b><br><span style="font-size:9px;color:${chartColors.textSec}">MRR celkem</span>`, x: 0.5, y: 0.5, xanchor: 'center', yanchor: 'middle', showarrow: false }]
		};

		// Payback period
		const dataPayback = [{ type: 'scatter', mode: 'lines+markers', x: planLabels, y: [12,12,12,12], line: { color: primary, width: 2 }, marker: { color: primary, size: 8 } }];
		const paybackLayout = { ...commonLayout };
		const paybackLayoutM = { ...mobileLayout };

		// --- Desktop charts ---
		try { const el = document.getElementById('chart-mrr'); if (el) P.newPlot('chart-mrr', dataMrr, mrrLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-users'); if (el) P.newPlot('chart-users', dataUsers, usersLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-ltv-cac'); if (el) P.newPlot('chart-ltv-cac', dataLtvCac, ltvLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-arpu'); if (el) P.newPlot('chart-arpu', dataArpu, arpuLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-heatmap'); if (el) P.newPlot('chart-heatmap', dataHeatmap, heatLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-waterfall'); if (el) P.newPlot('chart-waterfall', dataWaterfall, waterfallLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-upgrade-funnel'); if (el) P.newPlot('chart-upgrade-funnel', dataUpgradeFunnel, funnelLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-daily-revenue'); if (el) P.newPlot('chart-daily-revenue', dataDailyRevenue, dailyLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-channel'); if (el) P.newPlot('chart-channel', dataChannel, channelPieLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-payback'); if (el) P.newPlot('chart-payback', dataPayback, paybackLayout, chartConfig); } catch(e) {}

		// --- Mobile charts ---
		try { const el = document.getElementById('chart-mrr-m'); if (el) P.newPlot('chart-mrr-m', dataMrr, mrrLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-users-m'); if (el) P.newPlot('chart-users-m', dataUsers, usersLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-ltv-cac-m'); if (el) P.newPlot('chart-ltv-cac-m', dataLtvCac, ltvLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-arpu-m'); if (el) P.newPlot('chart-arpu-m', dataArpu, arpuLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-heatmap-m'); if (el) P.newPlot('chart-heatmap-m', dataHeatmap, heatLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-waterfall-m'); if (el) P.newPlot('chart-waterfall-m', dataWaterfall, waterfallLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-upgrade-funnel-m'); if (el) P.newPlot('chart-upgrade-funnel-m', dataUpgradeFunnel, funnelLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-daily-revenue-m'); if (el) P.newPlot('chart-daily-revenue-m', dataDailyRevenue, dailyLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-channel-m'); if (el) P.newPlot('chart-channel-m', dataChannel, channelPieLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-payback-m'); if (el) P.newPlot('chart-payback-m', dataPayback, paybackLayoutM, chartConfig); } catch(e) {}

		const handleResize = () => {
			[
				'chart-mrr','chart-users','chart-ltv-cac','chart-arpu','chart-heatmap','chart-waterfall',
				'chart-upgrade-funnel','chart-daily-revenue','chart-channel','chart-payback',
				'chart-mrr-m','chart-users-m','chart-ltv-cac-m','chart-arpu-m','chart-heatmap-m','chart-waterfall-m',
				'chart-upgrade-funnel-m','chart-daily-revenue-m','chart-channel-m','chart-payback-m'
			].forEach(id => { const el = document.getElementById(id); if (el) P.Plots.resize(el); });
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- ===== DESKTOP REVENUE CHARTS ===== -->
<div class="hidden lg:block space-y-6">
	<!-- Charts grid-cols-2: MRR + Users -->
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

	<!-- Unit economics: LTV vs CAC + ARPU -->
	<section class="grid grid-cols-2 gap-6">
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_ltv_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_ltv_subtitle')}</p>
				</div>
			</div>
			<div id="chart-ltv-cac" class="h-[240px] w-full"></div>
			<div class="mt-4 grid grid-cols-3 gap-3">
				<div class="text-center">
					<div class="text-xl font-bold text-success">{ltvCac.ltvCacRatio}x</div>
					<div class="text-xs text-textSec mt-0.5">{t('business_ltv_ratio')}</div>
				</div>
				<div class="text-center border-x border-surface">
					<div class="text-xl font-bold text-textMain">${ltvCac.ltv.toLocaleString()}</div>
					<div class="text-xs text-textSec mt-0.5">{t('business_ltv_avgLtv')}</div>
				</div>
				<div class="text-center">
					<div class="text-xl font-bold text-textMain">${ltvCac.cac}</div>
					<div class="text-xs text-textSec mt-0.5">{t('business_ltv_avgCac')}</div>
				</div>
			</div>
		</div>
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_arpu_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_arpu_subtitle')}</p>
				</div>
			</div>
			<div id="chart-arpu" class="h-[240px] w-full"></div>
			<div class="mt-4 grid grid-cols-3 gap-3">
				<div class="text-center">
					<div class="text-xl font-bold text-blue">${ltvCac.arpu}</div>
					<div class="text-xs text-textSec mt-0.5">{t('business_arpu_current')}</div>
				</div>
				<div class="text-center border-x border-surface">
					<div class="text-xl font-bold text-success">+$1.20</div>
					<div class="text-xs text-textSec mt-0.5">{t('business_arpu_mom')}</div>
				</div>
				<div class="text-center">
					<div class="text-xl font-bold text-textMain">$40.00</div>
					<div class="text-xs text-textSec mt-0.5">{t('business_arpu_target')}</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Heatmap + Waterfall -->
	<section class="grid grid-cols-2 gap-6">
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_heatmap_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_heatmap_subtitle')}</p>
				</div>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec">{t('business_heatmap_badge')}</span>
			</div>
			<div id="chart-heatmap" class="h-[240px] w-full"></div>
		</div>
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_mrrBridge_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_mrrBridge_subtitle')}</p>
				</div>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec">{t('business_mrrBridge_badge')}</span>
			</div>
			<div id="chart-waterfall" class="h-[240px] w-full"></div>
		</div>
	</section>

	<!-- Upgrade + Daily Revenue -->
	<section class="grid grid-cols-3 gap-6">
		<div class="bg-card border border-surface rounded-xl p-5 col-span-1">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_upgradeDowngrade_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_upgradeDowngrade_subtitle')}</p>
				</div>
			</div>
			<div id="chart-upgrade-funnel" class="h-[200px] w-full"></div>
			<div class="mt-3 space-y-1.5">
				<div class="flex justify-between text-xs">
					<span class="text-success font-medium">{t('business_upgrade_upgrades', { n: '124' })}</span>
				</div>
				<div class="flex justify-between text-xs">
					<span class="text-error font-medium">{t('business_upgrade_downgrades', { n: '38' })}</span>
				</div>
				<div class="flex justify-between text-xs">
					<span class="text-textSec">{t('business_upgradeDowngrade_netExpansion')}</span>
					<span class="text-success font-semibold">{t('business_upgrade_netMrr', { value: '4,320' })}</span>
				</div>
			</div>
		</div>
		<div class="bg-card border border-surface rounded-xl p-5 col-span-2">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_dailyRevenue_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_dailyRevenue_subtitle')}</p>
				</div>
			</div>
			<div id="chart-daily-revenue" class="h-[200px] w-full"></div>
		</div>
	</section>

	<!-- Channel + Payback -->
	<section class="grid grid-cols-2 gap-6">
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_revenueByChannel_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_revenueByChannel_subtitle')}</p>
				</div>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec">{t('business_timeRange_june2024')}</span>
			</div>
			<div id="chart-channel" class="h-[240px] w-full"></div>
		</div>
		<div class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_payback_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_payback_subtitle')}</p>
				</div>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textSec">{t('business_payback_badge')}</span>
			</div>
			<div id="chart-payback" class="h-[240px] w-full"></div>
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

	<!-- LTV vs CAC Accordion -->
	<section class="bg-card border border-surface rounded-xl overflow-hidden">
		<button onclick={() => toggleAcc('ltv')} class="w-full flex items-center justify-between px-4 py-4 min-h-[56px]">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
					<i class="fa-solid fa-scale-balanced text-success text-xs"></i>
				</div>
				<div class="text-left">
					<p class="text-sm font-semibold text-textMain">{t('business_ltv_title')}</p>
					<p class="text-xs text-textSec">{t('business_ltv_subtitleMobile')}</p>
				</div>
			</div>
			<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {accOpen.ltv ? 'rotate-180' : ''}"></i>
		</button>
		{#if accOpen.ltv}
			<div class="border-t border-surface p-4">
				<div id="chart-ltv-cac-m" class="h-[200px] w-full"></div>
				<div class="mt-3 grid grid-cols-3 gap-2 text-center">
					<div><div class="text-lg font-bold text-success">{ltvCac.ltvCacRatio}x</div><div class="text-xs text-textSec">{t('business_ltv_ratio')}</div></div>
					<div class="border-x border-surface"><div class="text-lg font-bold text-textMain">${ltvCac.ltv.toLocaleString()}</div><div class="text-xs text-textSec">{t('business_ltv_avgLtv')}</div></div>
					<div><div class="text-lg font-bold text-textMain">${ltvCac.cac}</div><div class="text-xs text-textSec">{t('business_ltv_avgCac')}</div></div>
				</div>
			</div>
		{/if}
	</section>

	<!-- ARPU Trend Accordion -->
	<section class="bg-card border border-surface rounded-xl overflow-hidden">
		<button onclick={() => toggleAcc('arpu')} class="w-full flex items-center justify-between px-4 py-4 min-h-[56px]">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center">
					<i class="fa-solid fa-chart-simple text-blue text-xs"></i>
				</div>
				<div class="text-left">
					<p class="text-sm font-semibold text-textMain">{t('business_arpu_title')}</p>
					<p class="text-xs text-textSec">{t('business_arpu_subtitleMobile')}</p>
				</div>
			</div>
			<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {accOpen.arpu ? 'rotate-180' : ''}"></i>
		</button>
		{#if accOpen.arpu}
			<div class="border-t border-surface p-4">
				<div id="chart-arpu-m" class="h-[200px] w-full"></div>
				<div class="mt-3 grid grid-cols-3 gap-2 text-center">
					<div><div class="text-lg font-bold text-blue">${ltvCac.arpu}</div><div class="text-xs text-textSec">{t('business_arpu_current')}</div></div>
					<div class="border-x border-surface"><div class="text-lg font-bold text-success">+$1.20</div><div class="text-xs text-textSec">{t('business_arpu_mom')}</div></div>
					<div><div class="text-lg font-bold text-textMain">$40.00</div><div class="text-xs text-textSec">{t('business_arpu_target')}</div></div>
				</div>
			</div>
		{/if}
	</section>

	<!-- Aktivita uživatelů Accordion -->
	<section class="bg-card border border-surface rounded-xl overflow-hidden">
		<button onclick={() => toggleAcc('heatmap')} class="w-full flex items-center justify-between px-4 py-4 min-h-[56px]">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-purple/10 flex items-center justify-center">
					<i class="fa-solid fa-fire text-purple text-xs"></i>
				</div>
				<div class="text-left">
					<p class="text-sm font-semibold text-textMain">{t('business_heatmap_title')}</p>
					<p class="text-xs text-textSec">{t('business_heatmap_subtitleMobile')}</p>
				</div>
			</div>
			<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {accOpen.heatmap ? 'rotate-180' : ''}"></i>
		</button>
		{#if accOpen.heatmap}
			<div class="border-t border-surface p-4">
				<div id="chart-heatmap-m" class="h-[200px] w-full"></div>
			</div>
		{/if}
	</section>

	<!-- MRR Bridge Accordion -->
	<section class="bg-card border border-surface rounded-xl overflow-hidden">
		<button onclick={() => toggleAcc('waterfall')} class="w-full flex items-center justify-between px-4 py-4 min-h-[56px]">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
					<i class="fa-solid fa-water text-secondary text-xs"></i>
				</div>
				<div class="text-left">
					<p class="text-sm font-semibold text-textMain">{t('business_mrrBridge_title')}</p>
					<p class="text-xs text-textSec">{t('business_mrrBridge_subtitleMobile')}</p>
				</div>
			</div>
			<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {accOpen.waterfall ? 'rotate-180' : ''}"></i>
		</button>
		{#if accOpen.waterfall}
			<div class="border-t border-surface p-4">
				<div id="chart-waterfall-m" class="h-[200px] w-full"></div>
			</div>
		{/if}
	</section>

	<!-- Upgrade & Downgrade -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_upgradeDowngrade_title')}</h3>
		<p class="text-xs text-textSec mb-3">{t('business_upgradeDowngrade_subtitle')}</p>
		<div id="chart-upgrade-funnel-m" class="h-[180px] w-full"></div>
		<div class="mt-3 flex justify-between text-xs">
			<span class="text-success font-medium">{t('business_upgrade_upgrades', { n: '124' })}</span>
			<span class="text-error font-medium">{t('business_upgrade_downgrades', { n: '38' })}</span>
			<span class="text-success font-semibold">{t('business_upgrade_netMrr', { value: '4,320' })}</span>
		</div>
	</section>

	<!-- Denní příjem -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_dailyRevenue_title')}</h3>
		<p class="text-xs text-textSec mb-3">{t('business_dailyRevenue_subtitle')}</p>
		<div id="chart-daily-revenue-m" class="h-[180px] w-full"></div>
	</section>

	<!-- Příjem dle kanálu -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<div class="flex items-center justify-between mb-3">
			<div>
				<h3 class="text-sm font-semibold text-textMain">{t('business_revenueByChannel_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('business_revenueByChannel_subtitle')}</p>
			</div>
			<span class="px-2 py-0.5 bg-badge rounded text-xs text-textSec">{t('business_timeRange_june2024')}</span>
		</div>
		<div id="chart-channel-m" class="h-[200px] w-full"></div>
	</section>

	<!-- Payback Period -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<div class="flex items-center justify-between mb-3">
			<div>
				<h3 class="text-sm font-semibold text-textMain">{t('business_payback_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('business_payback_subtitle')}</p>
			</div>
			<span class="px-2 py-0.5 bg-badge rounded text-xs text-textSec">{t('business_payback_badge')}</span>
		</div>
		<div id="chart-payback-m" class="h-[180px] w-full"></div>
	</section>
</div>
