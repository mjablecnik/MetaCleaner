<script lang="ts">
	import { onMount } from 'svelte';
	import { chartColors } from '$lib/theme/chartColors';
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';
	import {
		getGeoRevenue,
		getConversionFunnel,
		getLtvCacMetrics,
		getPlanRevenue
	} from '$lib/repositories/businessRepository';

	const geoRevenue = getGeoRevenue();
	const conversionFunnel = getConversionFunnel();
	const ltvCac = getLtvCacMetrics();
	const planRevenue = getPlanRevenue();

	type AccKey = 'ltv' | 'arpu' | 'heatmap' | 'waterfall' | 'retention';
	let accOpen = $state<Record<AccKey, boolean>>({ ltv: false, arpu: false, heatmap: false, waterfall: false, retention: false });

	function toggleAcc(k: AccKey) {
		accOpen[k] = !accOpen[k];
		if (accOpen[k]) {
			setTimeout(() => {
				const P = (window as any).Plotly;
				if (!P) return;
				const map: Record<AccKey, string> = { ltv: 'chart-ltv-cac-m', arpu: 'chart-arpu-m', heatmap: 'chart-heatmap-m', waterfall: 'chart-waterfall-m', retention: '' };
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
		const secondaryColor = chartColors.secondary;
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

		const pieLayout: any = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 5, r: 5, b: 5, l: 5 },
			showlegend: false
		};

		const months = ['Čvc','Srp','Zář','Říj','Lis','Pro','Led','Úno','Bře','Dub','Kvě','Čvn'];
		const mrr = [28000,31200,33800,35100,36900,38400,40200,41800,43500,44900,46700,48320];
		const newMrr = [2800,3200,2600,1300,1800,1500,1800,1600,1700,1400,1800,1620];
		const activeUsers = [7200,7800,8400,8900,9300,9800,10200,10700,11200,11600,12100,12841];
		const newUsers = [180,220,260,210,190,250,200,240,260,220,280,318];
		const churnMrr = [-800,-650,-900,-1100,-750,-700,-820,-760,-680,-900,-720,-680];

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
		const dataUpgradeFunnel = [{ type: 'funnel', values: [84210,12318,6840,2104,1840], text: ['Návštěvníci','Registrace','Trial aktivace','Trial→Placený','Aktivní platiaci'], marker: { color: [blueColor, purpleColor, primary, greenColor, secondaryColor] }, textinfo: 'value+text' }];
		const funnelLayout = { ...commonLayout, margin: { t: 10, r: 10, b: 10, l: 10 } };
		const funnelLayoutM = { ...mobileLayout, margin: { t: 8, r: 8, b: 8, l: 8 } };

		// Daily revenue
		const dayLabels = ['1.6.24','2.6.24','3.6.24','4.6.24','5.6.24','6.6.24','7.6.24','8.6.24','9.6.24','10.6.24','11.6.24','12.6.24'];
		const dataDailyRevenue = [{ type: 'scatter', mode: 'lines', fill: 'tozeroy', x: dayLabels, y: [23194,23194,23194,23194,23194,23194,23194,23194,23194,23194,23194,23194], line: { color: primary, width: 2 }, fillcolor: 'rgba(34,197,94,0.08)' }];
		const dailyLayout = { ...commonLayout };
		const dailyLayoutM = { ...mobileLayout };

		// Plan revenue pie
		const dataPlanRevenue = [{ type: 'pie', labels: ['Starter','Pro','Business','Enterprise'], values: [6840,18200,14880,8400], hole: 0.58, marker: { colors: [blueColor, primary, purpleColor, secondaryColor], line: { color: bgCard, width: 2 } }, textinfo: 'none', hovertemplate: '<b>%{label}</b><br>$%{value}<extra></extra>' }];
		const planPieLayout = { ...pieLayout, annotations: [{ text: `<b style="font-size:14px;color:${chartColors.textMain}">$48,320</b><br><span style="font-size:9px;color:${chartColors.textSec}">MRR celkem</span>`, x: 0.5, y: 0.5, xanchor: 'center', yanchor: 'middle', showarrow: false }] };

		// Churn chart
		const dataChurn = [
			{ type: 'bar', name: 'Nový MRR', x: months, y: newMrr, marker: { color: primary, opacity: 0.8 } },
			{ type: 'bar', name: 'Churn MRR', x: months, y: churnMrr, marker: { color: errorColor, opacity: 0.8 } }
		];
		const churnLayout = { ...commonLayout, barmode: 'relative', showlegend: true, legend: { x: 0, y: 1, font: { size: 9, color: textSec }, bgcolor: 'transparent' } };
		const churnLayoutM = { ...mobileLayout, barmode: 'relative', showlegend: true, legend: { x: 0, y: 1, font: { size: 8, color: textSec }, bgcolor: 'transparent' } };

		// Geo pie
		const dataGeo = [{ type: 'pie', labels: ['Evropa','Sev. Amerika','Asie','Ostatní'], values: [23194,15462,6282,3382], hole: 0.55, marker: { colors: [blueColor, greenColor, purpleColor, secondaryColor], line: { color: bgCard, width: 2 } }, textinfo: 'none', hovertemplate: '<b>%{label}</b><br>$%{value}<extra></extra>' }];
		const geoPieLayout = { ...pieLayout, annotations: [{ text: `<b style="font-size:14px;color:${chartColors.textMain}">48%</b><br><span style="font-size:9px;color:${chartColors.textSec}">MRR celkem</span>`, x: 0.5, y: 0.5, xanchor: 'center', yanchor: 'middle', showarrow: false }] };

		// Channel pie
		const dataChannel = [{ type: 'pie', labels: ['Google Ads','LinkedIn','Facebook','YouTube','Other'], values: [23194,15462,6282,3382,1111], hole: 0.55, marker: { colors: [blueColor, purpleColor, greenColor, errorColor, secondaryColor], line: { color: bgCard, width: 2 } }, textinfo: 'none', hovertemplate: '<b>%{label}</b><br>$%{value}<extra></extra>' }];
		const channelPieLayout = { ...pieLayout, annotations: [{ text: `<b style="font-size:14px;color:${chartColors.textMain}">48%</b><br><span style="font-size:9px;color:${chartColors.textSec}">MRR celkem</span>`, x: 0.5, y: 0.5, xanchor: 'center', yanchor: 'middle', showarrow: false }] };

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
		try { const el = document.getElementById('chart-plan-revenue'); if (el) P.newPlot('chart-plan-revenue', dataPlanRevenue, planPieLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-churn'); if (el) P.newPlot('chart-churn', dataChurn, churnLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-channel'); if (el) P.newPlot('chart-channel', dataChannel, channelPieLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-payback'); if (el) P.newPlot('chart-payback', dataPayback, paybackLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-geo'); if (el) P.newPlot('chart-geo', dataGeo, geoPieLayout, chartConfig); } catch(e) {}

		// --- Mobile charts ---
		try { const el = document.getElementById('chart-mrr-m'); if (el) P.newPlot('chart-mrr-m', dataMrr, mrrLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-users-m'); if (el) P.newPlot('chart-users-m', dataUsers, usersLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-ltv-cac-m'); if (el) P.newPlot('chart-ltv-cac-m', dataLtvCac, ltvLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-arpu-m'); if (el) P.newPlot('chart-arpu-m', dataArpu, arpuLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-heatmap-m'); if (el) P.newPlot('chart-heatmap-m', dataHeatmap, heatLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-waterfall-m'); if (el) P.newPlot('chart-waterfall-m', dataWaterfall, waterfallLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-upgrade-funnel-m'); if (el) P.newPlot('chart-upgrade-funnel-m', dataUpgradeFunnel, funnelLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-daily-revenue-m'); if (el) P.newPlot('chart-daily-revenue-m', dataDailyRevenue, dailyLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-plan-revenue-m'); if (el) P.newPlot('chart-plan-revenue-m', dataPlanRevenue, planPieLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-churn-m'); if (el) P.newPlot('chart-churn-m', dataChurn, churnLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-channel-m'); if (el) P.newPlot('chart-channel-m', dataChannel, channelPieLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-payback-m'); if (el) P.newPlot('chart-payback-m', dataPayback, paybackLayoutM, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-geo-m'); if (el) P.newPlot('chart-geo-m', dataGeo, geoPieLayout, chartConfig); } catch(e) {}

		const handleResize = () => {
			[
				'chart-mrr','chart-users','chart-ltv-cac','chart-arpu','chart-heatmap','chart-waterfall',
				'chart-upgrade-funnel','chart-daily-revenue','chart-plan-revenue','chart-churn','chart-channel','chart-payback','chart-geo',
				'chart-mrr-m','chart-users-m','chart-ltv-cac-m','chart-arpu-m','chart-heatmap-m','chart-waterfall-m',
				'chart-upgrade-funnel-m','chart-daily-revenue-m','chart-plan-revenue-m','chart-churn-m','chart-channel-m','chart-payback-m','chart-geo-m'
			].forEach(id => { const el = document.getElementById(id); if (el) P.Plots.resize(el); });
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- ===== DESKTOP LAYOUT ===== -->
<div class="hidden lg:block">
	<header class="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-surface px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<div class="w-9 h-9 rounded-lg bg-success/15 border border-success/30 flex items-center justify-center">
				<i class="fa-solid fa-chart-line text-success text-sm"></i>
			</div>
			<div>
				<h1 class="text-2xl font-bold text-textMain">{t('layout_nav_business')}</h1>
				<p class="text-sm text-textSec mt-0.5">{t('business_header_subtitle')}</p>
			</div>
		</div>
		<div class="flex items-center gap-3 flex-wrap">
			<div class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium">
				<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
				{t('business_status_live')}
			</div>
			<select class="bg-surface border border-border text-sm text-textMain rounded-lg px-3 py-2 focus:outline-none">
				<option>{t('business_timeRange_june2024')}</option>
				<option>{t('business_timeRange_last30d')}</option>
				<option>{t('business_timeRange_q22024')}</option>
				<option>{t('business_timeRange_ytd2024')}</option>
			</select>
			<button class="px-4 py-2 bg-surface hover:bg-surface-hover text-white rounded-lg text-sm font-medium transition-colors border border-border">
				<i class="fa-solid fa-download mr-2"></i>{t('common_actions_export')}
			</button>
		</div>
	</header>

	<div class="p-6 max-w-7xl mx-auto space-y-6">

		<!-- KPI Row 1 -->
		<section class="grid grid-cols-4 gap-4">
			<div class="bg-card border border-surface rounded-xl p-5 relative overflow-hidden">
				<div class="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full -translate-y-8 translate-x-8"></div>
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t('business_kpi_mrr')}</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">+12.4%</span>
				</div>
				<div class="flex items-end gap-2 mb-1">
					<span class="text-3xl font-bold text-textMain">$48,320</span>
				</div>
				<p class="text-xs text-textSec">{t('business_kpi_mrrSubtext')}</p>
			</div>
			<div class="bg-card border border-surface rounded-xl p-5 relative overflow-hidden">
				<div class="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full -translate-y-8 translate-x-8"></div>
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t('business_kpi_arr')}</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">+12.4%</span>
				</div>
				<div class="flex items-end gap-2 mb-1">
					<span class="text-3xl font-bold text-textMain">$579,840</span>
				</div>
				<p class="text-xs text-textSec">{t('business_kpi_mrrArrSubtext')}</p>
			</div>
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t('business_kpi_activeUsers')}</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">+8.1%</span>
				</div>
				<div class="flex items-end gap-2 mb-1">
					<span class="text-3xl font-bold text-textMain">12,842</span>
				</div>
				<p class="text-xs text-textSec">{t('business_kpi_activeUsersSubtext')}</p>
			</div>
			<div class="bg-card border border-error/20 rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t('business_kpi_churnRate')}</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">{t('business_kpi_churnBadge')}</span>
				</div>
				<div class="flex items-end gap-2 mb-1">
					<span class="text-3xl font-bold text-error">2.1%</span>
				</div>
				<p class="text-xs text-textSec">{t('business_kpi_churnRateSubtext')}</p>
			</div>
		</section>

		<!-- KPI Row 2 -->
		<section class="grid grid-cols-4 gap-4">
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
						<i class="fa-solid fa-bag-shopping text-success text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">{t('business_kpi_newOrders')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">1,204</div>
				<p class="text-xs text-textSec mt-1 flex items-center gap-1"><span class="text-success font-medium">+142</span> {t('business_kpi_newOrdersSubtext')}</p>
			</div>
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-blue/15 flex items-center justify-center">
						<i class="fa-solid fa-dollar-sign text-blue text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">{t('business_kpi_avgOrderValue')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">$40.13</div>
				<p class="text-xs text-textSec mt-1"><span class="text-success font-medium">+$2.40</span> {t('business_kpi_vsLastMonth')}</p>
			</div>
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-purple/15 flex items-center justify-center">
						<i class="fa-solid fa-user-plus text-purple text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">{t('business_kpi_newCustomers')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">318</div>
				<p class="text-xs text-textSec mt-1"><span class="text-success font-medium">+52</span> {t('business_kpi_newOrdersSubtext')}</p>
			</div>
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center">
						<i class="fa-solid fa-star text-secondary text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">{t('business_kpi_nps')}</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">72<span class="text-sm text-textSec font-normal">/100</span></div>
				<p class="text-xs text-textSec mt-1">{t('business_kpi_npsSubtext')}</p>
			</div>
		</section>

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

		<!-- Funnel + Plan Revenue -->
		<section class="grid grid-cols-3 gap-6">
			<div class="bg-card border border-surface rounded-xl p-5 col-span-1">
				<h3 class="text-lg font-semibold text-textMain mb-1">{t('business_funnel_title')}</h3>
				<p class="text-xs text-textSec mb-4">{t('business_funnel_subtitle')}</p>
				<div class="space-y-3">
					{#each conversionFunnel as step}
						<div>
							<div class="flex justify-between text-xs mb-1">
								<span class="text-textSec">{t(step.labelKey)}</span>
								<span class="text-textMain font-medium">{step.value.toLocaleString()} {#if step.conversionPercent}<span class="text-textSec">{step.conversionPercent}</span>{:else}<span class="text-textSec">100%</span>{/if}</span>
							</div>
							<div class="w-full h-1.5 bg-surface rounded-full"><div class="h-full rounded-full" style="background:{step.color};width:{step.conversionPercent ?? '100%'}"></div></div>
						</div>
					{/each}
				</div>
				<div class="mt-4 pt-3 border-t border-surface grid grid-cols-2 gap-2 text-xs">
					<div><span class="text-textSec">{t('business_funnel_totalConversion')}</span><div class="text-textMain font-semibold">2.19%</div></div>
					<div><span class="text-textSec">{t('business_funnel_trialToPaid')}</span><div class="text-textMain font-semibold">30.76%</div></div>
				</div>
			</div>
			<div class="bg-card border border-surface rounded-xl p-5 col-span-2">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('business_revenueByPlan_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('business_revenueByPlan_subtitle')}</p>
					</div>
				</div>
				<div id="chart-plan-revenue" class="h-[200px] w-full"></div>
				<div class="mt-3 grid grid-cols-4 gap-2">
					{#each planRevenue as plan}
						<div class="text-center p-2 rounded-lg" style="background:{plan.color}1a;border:1px solid {plan.color}33">
							<div class="text-sm font-bold" style="color:{plan.color}">${plan.value.toLocaleString()}</div>
							<div class="text-xs text-textSec">{plan.label}</div>
							<div class="text-xs text-textSec">{plan.percent}</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Churn + Retention cohorts -->
		<section class="grid grid-cols-2 gap-6">
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
							<tr>
								<td class="py-2 pr-3 text-textSec whitespace-nowrap">{t('business_cohort_month_feb24')}</td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.3);color:#22c55e">100%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.24);color:#22c55e">84%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.18);color:#22c55e">71%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.14);color:#94a3b8">63%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.11);color:#94a3b8">57%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.09);color:#94a3b8">52%</span></td>
							</tr>
							<tr>
								<td class="py-2 pr-3 text-textSec whitespace-nowrap">{t('business_cohort_month_mar24')}</td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.3);color:#22c55e">100%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.22);color:#22c55e">81%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.17);color:#94a3b8">68%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.13);color:#94a3b8">59%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.10);color:#94a3b8">54%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs text-border">—</span></td>
							</tr>
							<tr>
								<td class="py-2 pr-3 text-textSec whitespace-nowrap">{t('business_cohort_month_apr24')}</td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.3);color:#22c55e">100%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.21);color:#22c55e">79%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.15);color:#94a3b8">65%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.12);color:#94a3b8">58%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs text-border">—</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs text-border">—</span></td>
							</tr>
							<tr>
								<td class="py-2 pr-3 text-textSec whitespace-nowrap">{t('business_cohort_month_may24')}</td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.3);color:#22c55e">100%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.22);color:#22c55e">82%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.17);color:#94a3b8">70%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs text-border">—</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs text-border">—</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs text-border">—</span></td>
							</tr>
							<tr>
								<td class="py-2 pr-3 text-textSec whitespace-nowrap">{t('business_cohort_month_jun24')}</td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.3);color:#22c55e">100%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.25);color:#22c55e">86%</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs text-border">—</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs text-border">—</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs text-border">—</span></td>
								<td class="py-2 px-2 text-center"><span class="px-1.5 py-0.5 rounded text-xs text-border">—</span></td>
							</tr>
						</tbody>
					</table>
				</div>
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

		<!-- Top Customers + Geo -->
		<section class="grid grid-cols-3 gap-6">
			<div class="bg-card border border-surface rounded-xl p-5 col-span-2">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('business_topCustomers_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('business_topCustomers_subtitle')}</p>
					</div>
				</div>
				<div class="space-y-3">
					<div class="flex items-center gap-4 p-3 rounded-xl bg-surface/40 border border-border/40 hover:border-border transition-colors">
						<img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg" alt="Acme Corp" class="w-9 h-9 rounded-full object-cover flex-shrink-0" />
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-semibold">Acme Corp</p>
							<p class="text-xs text-textSec">Enterprise</p>
						</div>
						<div class="text-right">
							<p class="text-textMain text-sm font-bold">$2,800<span class="text-textSec font-normal text-xs">/mo</span></p>
						</div>
					</div>
					<div class="flex items-center gap-4 p-3 rounded-xl bg-surface/40 border border-border/40 hover:border-border transition-colors">
						<img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg" alt="TechVision" class="w-9 h-9 rounded-full object-cover flex-shrink-0" />
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-semibold">TechVision</p>
							<p class="text-xs text-textSec">Enterprise</p>
						</div>
						<div class="text-right">
							<p class="text-textMain text-sm font-bold">$1,960<span class="text-textSec font-normal text-xs">/mo</span></p>
						</div>
					</div>
					<div class="flex items-center gap-4 p-3 rounded-xl bg-surface/40 border border-border/40 hover:border-border transition-colors">
						<img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" alt="DataFlow GmbH" class="w-9 h-9 rounded-full object-cover flex-shrink-0" />
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-semibold">DataFlow GmbH</p>
							<p class="text-xs text-textSec">Business</p>
						</div>
						<div class="text-right">
							<p class="text-textMain text-sm font-bold">$1,200<span class="text-textSec font-normal text-xs">/mo</span></p>
						</div>
					</div>
					<div class="flex items-center gap-4 p-3 rounded-xl bg-surface/40 border border-border/40 hover:border-border transition-colors">
						<img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg" alt="Nexo Solutions" class="w-9 h-9 rounded-full object-cover flex-shrink-0" />
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-semibold">Nexo Solutions</p>
							<p class="text-xs text-textSec">Business</p>
						</div>
						<div class="text-right">
							<p class="text-textMain text-sm font-bold">$960<span class="text-textSec font-normal text-xs">/mo</span></p>
						</div>
					</div>
					<div class="flex items-center gap-4 p-3 rounded-xl bg-surface/40 border border-border/40 hover:border-border transition-colors">
						<img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg" alt="Sparkly Media" class="w-9 h-9 rounded-full object-cover flex-shrink-0" />
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-semibold">Sparkly Media</p>
							<p class="text-xs text-textSec">Pro</p>
						</div>
						<div class="text-right">
							<p class="text-textMain text-sm font-bold">$750<span class="text-textSec font-normal text-xs">/mo</span></p>
						</div>
					</div>
				</div>
			</div>
			<div class="bg-card border border-surface rounded-xl p-5 col-span-1">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('business_revenueByRegion_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('business_revenueByRegion_subtitle')}</p>
					</div>
				</div>
				<div id="chart-geo" class="h-[180px] w-full"></div>
				<div class="mt-3 space-y-2">
					{#each geoRevenue as geo}
						<div class="flex items-center justify-between text-xs">
							<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:{geo.color}"></span><span class="text-textSec">{t(geo.labelKey)}</span></div>
							<span class="text-textMain font-medium">{geo.percent} · ${geo.value.toLocaleString()}</span>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Goals & OKR -->
		<section class="bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-5">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('business_okr_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('business_okr_subtitle')}</p>
				</div>
			</div>
			<div class="grid grid-cols-4 gap-4">
				<div class="bg-surface/50 rounded-xl p-4">
					<div class="flex justify-between items-start mb-2">
						<h4 class="text-textSec text-xs font-medium">{t('business_okr_mrrGoal')}</h4>
						<span class="text-success text-xs font-bold">96%</span>
					</div>
					<div class="text-2xl font-bold text-textMain mb-2">$50,000</div>
					<div class="w-full h-2 bg-surface-deep rounded-full overflow-hidden">
						<div class="h-full bg-success rounded-full transition-all" style="width:96%"></div>
					</div>
					<p class="text-xs text-textSec mt-2">$48,320 / $50,000</p>
				</div>
				<div class="bg-surface/50 rounded-xl p-4">
					<div class="flex justify-between items-start mb-2">
						<h4 class="text-textSec text-xs font-medium">{t('business_okr_newCustomers')}</h4>
						<span class="text-success text-xs font-bold">79%</span>
					</div>
					<div class="text-2xl font-bold text-textMain mb-2">400</div>
					<div class="w-full h-2 bg-surface-deep rounded-full overflow-hidden">
						<div class="h-full bg-blue rounded-full transition-all" style="width:79%"></div>
					</div>
					<p class="text-xs text-textSec mt-2">318 / 400</p>
				</div>
				<div class="bg-surface/50 rounded-xl p-4">
					<div class="flex justify-between items-start mb-2">
						<h4 class="text-textSec text-xs font-medium">{t('business_okr_churnRate')}</h4>
						<span class="text-secondary text-xs font-bold">{t('business_okr_approxTarget')}</span>
					</div>
					<div class="text-2xl font-bold text-error mb-2">&lt;2.0%</div>
					<div class="w-full h-2 bg-surface-deep rounded-full overflow-hidden">
						<div class="h-full bg-secondary rounded-full transition-all" style="width:55%"></div>
					</div>
					<p class="text-xs text-textSec mt-2">{t('business_okr_currently', { value: '2.1%' })}</p>
				</div>
				<div class="bg-surface/50 rounded-xl p-4">
					<div class="flex justify-between items-start mb-2">
						<h4 class="text-textSec text-xs font-medium">{t('business_okr_npsGoal')}</h4>
						<span class="text-success text-xs font-bold">90%</span>
					</div>
					<div class="text-2xl font-bold text-textMain mb-2">80</div>
					<div class="w-full h-2 bg-surface-deep rounded-full overflow-hidden">
						<div class="h-full bg-purple rounded-full transition-all" style="width:90%"></div>
					</div>
					<p class="text-xs text-textSec mt-2">72 / 80</p>
				</div>
			</div>
		</section>

	</div>
</div>

<!-- ===== MOBILE LAYOUT ===== -->
<div class="lg:hidden block pb-24">

	<!-- Page Title Bar -->
	<div class="px-4 pt-3 pb-3 bg-card border-b border-surface flex items-center justify-between gap-3">
		<div class="flex items-center gap-2.5">
			<div class="w-8 h-8 rounded-lg bg-success/15 border border-success/30 flex items-center justify-center">
				<i class="fa-solid fa-chart-line text-success text-xs"></i>
			</div>
			<div>
				<h1 class="text-base font-bold text-textMain leading-tight">{t('layout_nav_business')}</h1>
				<p class="text-xs text-textSec">{t('business_header_subtitleMobile')}</p>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<div class="flex items-center gap-1.5 px-2.5 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-xs font-medium">
				<div class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
				{t('business_status_live')}
			</div>
			<select class="bg-surface border border-border text-xs text-textMain rounded-lg px-2.5 py-2 focus:outline-none min-h-[36px]">
				<option>{t('business_timeRange_june2024')}</option>
				<option>{t('business_timeRange_last30d')}</option>
				<option>{t('business_timeRange_q22024')}</option>
			</select>
		</div>
	</div>

	<div class="px-4 py-4 space-y-4">

		<!-- KPI Row 1 grid-cols-2 -->
		<section class="grid grid-cols-2 gap-3">
			<div class="bg-card border border-surface rounded-xl p-4 relative overflow-hidden">
				<div class="absolute top-0 right-0 w-16 h-16 bg-success/5 rounded-full -translate-y-4 translate-x-4"></div>
				<h3 class="text-textSec text-xs font-medium mb-2">{t('business_kpi_mrr')}</h3>
				<div class="text-2xl font-bold text-textMain">$48,320</div>
				<span class="text-xs text-success font-medium mt-0.5 block">+12.4%</span>
				<p class="text-xs text-textSec mt-1 leading-tight">{t('business_kpi_mrrSubtext')}</p>
			</div>
			<div class="bg-card border border-surface rounded-xl p-4 relative overflow-hidden">
				<div class="absolute top-0 right-0 w-16 h-16 bg-success/5 rounded-full -translate-y-4 translate-x-4"></div>
				<h3 class="text-textSec text-xs font-medium mb-2">{t('business_kpi_arr')}</h3>
				<div class="text-2xl font-bold text-textMain">$579,840</div>
				<span class="text-xs text-success font-medium mt-0.5 block">+12.4%</span>
				<p class="text-xs text-textSec mt-1 leading-tight">{t('business_kpi_mrrArrSubtext')}</p>

			</div>
			<div class="bg-card border border-surface rounded-xl p-4">
				<h3 class="text-textSec text-xs font-medium mb-2 leading-tight">{t('business_kpi_activeUsers')}</h3>
				<div class="text-2xl font-bold text-textMain">12,842</div>
				<span class="text-xs text-success font-medium mt-0.5 block">+8.1%</span>
				<p class="text-xs text-textSec mt-1 leading-tight">{t('business_kpi_activeUsersSubtext')}</p>
			</div>
			<div class="bg-card border border-error/20 rounded-xl p-4">
				<h3 class="text-textSec text-xs font-medium mb-2">{t('business_kpi_churnRate')}</h3>
				<div class="text-2xl font-bold text-error">2.1%</div>
				<span class="text-xs text-success font-medium mt-0.5 block">{t('business_kpi_churnBadge')}</span>
				<p class="text-xs text-textSec mt-1 leading-tight">{t('business_kpi_churnRateSubtext')}</p>
			</div>
		</section>

		<!-- KPI Row 2 grid-cols-2 -->
		<section class="grid grid-cols-2 gap-3">
			<div class="bg-card border border-surface rounded-xl p-4">
				<div class="w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center mb-2">
					<i class="fa-solid fa-bag-shopping text-success text-xs"></i>
				</div>
				<div class="text-xl font-bold text-textMain">1,204</div>
				<p class="text-xs text-textSec mt-0.5 leading-tight">{t('business_kpi_newOrders')}</p>
				<span class="text-xs text-success font-medium">+142</span>
			</div>
			<div class="bg-card border border-surface rounded-xl p-4">
				<div class="w-7 h-7 rounded-lg bg-blue/15 flex items-center justify-center mb-2">
					<i class="fa-solid fa-dollar-sign text-blue text-xs"></i>
				</div>
				<div class="text-xl font-bold text-textMain">$40.13</div>
				<p class="text-xs text-textSec mt-0.5 leading-tight">{t('business_kpi_avgOrderValueMobile')}</p>
				<span class="text-xs text-success font-medium">+$2.40</span>
			</div>
			<div class="bg-card border border-surface rounded-xl p-4">
				<div class="w-7 h-7 rounded-lg bg-purple/15 flex items-center justify-center mb-2">
					<i class="fa-solid fa-user-plus text-purple text-xs"></i>
				</div>
				<div class="text-xl font-bold text-textMain">318</div>
				<p class="text-xs text-textSec mt-0.5 leading-tight">{t('business_kpi_newCustomers')}</p>
				<span class="text-xs text-success font-medium">+52</span>
			</div>
			<div class="bg-card border border-surface rounded-xl p-4">
				<div class="w-7 h-7 rounded-lg bg-secondary/15 flex items-center justify-center mb-2">
					<i class="fa-solid fa-star text-secondary text-xs"></i>
				</div>
				<div class="text-xl font-bold text-textMain">72<span class="text-xs text-textSec font-normal">/100</span></div>
				<p class="text-xs text-textSec mt-0.5 leading-tight">{t('business_kpi_nps')}</p>
				<span class="text-xs text-textSec">{t('business_kpi_npsSubtext')}</span>
			</div>
		</section>

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

		<!-- Konverzní trychtýř -->
		<section class="bg-card border border-surface rounded-xl p-4">
			<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_funnel_title')}</h3>
			<p class="text-xs text-textSec mb-4">{t('business_funnel_subtitle')}</p>
			<div class="space-y-3">
				{#each conversionFunnel as step}
					<div>
						<div class="flex justify-between text-xs mb-1"><span class="text-textSec">{t(step.labelKey)}</span><span class="text-textMain font-medium">{step.value.toLocaleString()} {#if step.conversionPercent}<span class="text-textSec">{step.conversionPercent}</span>{:else}<span class="text-textSec">100%</span>{/if}</span></div>
						<div class="w-full h-1.5 bg-surface rounded-full"><div class="h-full rounded-full" style="background:{step.color};width:{step.conversionPercent ?? '100%'}"></div></div>
					</div>
				{/each}
			</div>
			<div class="mt-4 pt-3 border-t border-surface grid grid-cols-2 gap-2 text-xs">
				<div><span class="text-textSec">{t('business_funnel_totalConversion')}</span><div class="text-textMain font-semibold">2.19%</div></div>
				<div><span class="text-textSec">{t('business_funnel_trialToPaid')}</span><div class="text-textMain font-semibold">30.76%</div></div>
			</div>
		</section>

		<!-- Příjem podle plánu -->
		<section class="bg-card border border-surface rounded-xl p-4">
			<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_revenueByPlan_title')}</h3>
			<p class="text-xs text-textSec mb-3">{t('business_revenueByPlan_subtitle')}</p>
			<div id="chart-plan-revenue-m" class="h-[180px] w-full"></div>
			<div class="mt-3 grid grid-cols-2 gap-2">
				{#each planRevenue as plan}
					<div class="text-center p-2 rounded-lg" style="background:{plan.color}1a;border:1px solid {plan.color}33">
						<div class="text-sm font-bold" style="color:{plan.color}">${plan.value.toLocaleString()}</div>
						<div class="text-xs text-textSec">{plan.label} · {plan.percent}</div>
					</div>
				{/each}
			</div>
		</section>

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
								<tr>
									<td class="py-2 pr-2 text-textSec whitespace-nowrap">{t('business_cohort_month_feb24')}</td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.3);color:#22c55e">100%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.24);color:#22c55e">84%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.18);color:#22c55e">71%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.14);color:#94a3b8">63%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.11);color:#94a3b8">57%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.09);color:#94a3b8">52%</span></td>
								</tr>
								<tr>
									<td class="py-2 pr-2 text-textSec whitespace-nowrap">{t('business_cohort_month_mar24')}</td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.3);color:#22c55e">100%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.22);color:#22c55e">81%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.17);color:#94a3b8">68%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.13);color:#94a3b8">59%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.10);color:#94a3b8">54%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="text-border">—</span></td>
								</tr>
								<tr>
									<td class="py-2 pr-2 text-textSec whitespace-nowrap">{t('business_cohort_month_apr24')}</td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.3);color:#22c55e">100%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.21);color:#22c55e">79%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.15);color:#94a3b8">65%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.12);color:#94a3b8">58%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="text-border">—</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="text-border">—</span></td>
								</tr>
								<tr>
									<td class="py-2 pr-2 text-textSec whitespace-nowrap">{t('business_cohort_month_may24')}</td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.3);color:#22c55e">100%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.22);color:#22c55e">82%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.17);color:#94a3b8">70%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="text-border">—</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="text-border">—</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="text-border">—</span></td>
								</tr>
								<tr>
									<td class="py-2 pr-2 text-textSec whitespace-nowrap">{t('business_cohort_month_jun24')}</td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.3);color:#22c55e">100%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="px-1 py-0.5 rounded text-xs font-medium" style="background:rgba(34,197,94,0.25);color:#22c55e">86%</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="text-border">—</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="text-border">—</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="text-border">—</span></td>
									<td class="py-1.5 px-1.5 text-center"><span class="text-border">—</span></td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			{/if}
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

		<!-- Top zákazníci -->
		<section class="bg-card border border-surface rounded-xl p-4">
			<h3 class="text-sm font-semibold text-textMain mb-3">{t('business_topCustomers_title')}</h3>
			<div class="space-y-2.5">
				<div class="flex items-center gap-3">
					<img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg" alt="Acme Corp" class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<p class="text-textMain text-xs font-semibold">Acme Corp</p>
						<p class="text-xs text-textSec">Enterprise</p>
					</div>
					<span class="text-textMain text-xs font-bold">$2,800<span class="text-textSec font-normal">/mo</span></span>
				</div>
				<div class="flex items-center gap-3">
					<img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg" alt="TechVision" class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<p class="text-textMain text-xs font-semibold">TechVision</p>
						<p class="text-xs text-textSec">Enterprise</p>
					</div>
					<span class="text-textMain text-xs font-bold">$1,960<span class="text-textSec font-normal">/mo</span></span>
				</div>
				<div class="flex items-center gap-3">
					<img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" alt="DataFlow GmbH" class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<p class="text-textMain text-xs font-semibold">DataFlow GmbH</p>
						<p class="text-xs text-textSec">Business</p>
					</div>
					<span class="text-textMain text-xs font-bold">$1,200<span class="text-textSec font-normal">/mo</span></span>
				</div>
				<div class="flex items-center gap-3">
					<img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg" alt="Nexo Solutions" class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<p class="text-textMain text-xs font-semibold">Nexo Solutions</p>
						<p class="text-xs text-textSec">Business</p>
					</div>
					<span class="text-textMain text-xs font-bold">$960<span class="text-textSec font-normal">/mo</span></span>
				</div>
				<div class="flex items-center gap-3">
					<img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg" alt="Sparkly Media" class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<p class="text-textMain text-xs font-semibold">Sparkly Media</p>
						<p class="text-xs text-textSec">Pro</p>
					</div>
					<span class="text-textMain text-xs font-bold">$750<span class="text-textSec font-normal">/mo</span></span>
				</div>
			</div>
		</section>

		<!-- Příjem dle regionu -->
		<section class="bg-card border border-surface rounded-xl p-4">
			<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_revenueByRegion_title')}</h3>
			<p class="text-xs text-textSec mb-3">{t('business_revenueByRegion_subtitle')}</p>
			<div id="chart-geo-m" class="h-[180px] w-full"></div>
			<div class="mt-3 space-y-1.5">
				{#each geoRevenue as geo}
					<div class="flex items-center justify-between text-xs">
						<div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full inline-block" style="background:{geo.color}"></span><span class="text-textSec">{t(geo.labelKey)}</span></div>
						<span class="text-textMain font-medium">{geo.percent} · ${geo.value.toLocaleString()}</span>
					</div>
				{/each}
			</div>
		</section>

		<!-- Goals & OKR -->
		<section class="bg-card border border-surface rounded-xl p-4">
			<h3 class="text-sm font-semibold text-textMain mb-1">{t('business_okr_title')}</h3>
			<p class="text-xs text-textSec mb-4">{t('business_okr_subtitle')}</p>
			<div class="grid grid-cols-2 gap-3">
				<div class="bg-surface/50 rounded-xl p-3">
					<div class="flex justify-between items-start mb-1.5">
						<h4 class="text-textSec text-xs font-medium">{t('business_okr_mrrGoal')}</h4>
						<span class="text-success text-xs font-bold">96%</span>
					</div>
					<div class="text-lg font-bold text-textMain mb-2">$50,000</div>
					<div class="w-full h-1.5 bg-surface-deep rounded-full overflow-hidden">
						<div class="h-full bg-success rounded-full" style="width:96%"></div>
					</div>
					<p class="text-xs text-textSec mt-1.5">$48,320 / $50,000</p>
				</div>
				<div class="bg-surface/50 rounded-xl p-3">
					<div class="flex justify-between items-start mb-1.5">
						<h4 class="text-textSec text-xs font-medium">{t('business_okr_newCustomers')}</h4>
						<span class="text-success text-xs font-bold">79%</span>
					</div>
					<div class="text-lg font-bold text-textMain mb-2">400</div>
					<div class="w-full h-1.5 bg-surface-deep rounded-full overflow-hidden">
						<div class="h-full bg-blue rounded-full" style="width:79%"></div>
					</div>
					<p class="text-xs text-textSec mt-1.5">318 / 400</p>
				</div>
				<div class="bg-surface/50 rounded-xl p-3">
					<div class="flex justify-between items-start mb-1.5">
						<h4 class="text-textSec text-xs font-medium">{t('business_okr_churnRate')}</h4>
						<span class="text-secondary text-xs font-bold">{t('business_okr_approxTarget')}</span>
					</div>
					<div class="text-lg font-bold text-error mb-2">&lt;2.0%</div>
					<div class="w-full h-1.5 bg-surface-deep rounded-full overflow-hidden">
						<div class="h-full bg-secondary rounded-full" style="width:55%"></div>
					</div>
					<p class="text-xs text-textSec mt-1.5">{t('business_okr_currently', { value: '2.1%' })}</p>
				</div>
				<div class="bg-surface/50 rounded-xl p-3">
					<div class="flex justify-between items-start mb-1.5">
						<h4 class="text-textSec text-xs font-medium">{t('business_okr_npsGoal')}</h4>
						<span class="text-success text-xs font-bold">90%</span>
					</div>
					<div class="text-lg font-bold text-textMain mb-2">80</div>
					<div class="w-full h-1.5 bg-surface-deep rounded-full overflow-hidden">
						<div class="h-full bg-purple rounded-full" style="width:90%"></div>
					</div>
					<p class="text-xs text-textSec mt-1.5">72 / 80</p>
				</div>
			</div>
		</section>

		<div class="h-4"></div>
	</div>

	<!-- Bottom Navigation -->
	<nav class="fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-surface px-2 py-2 flex items-center justify-around lg:hidden">
		<a href="{base}/" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-gauge-high text-base"></i>
			<span class="text-xs">{t('layout_nav_dashboard')}</span>
		</a>
		<a href="{base}/dostupnost" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-server text-base"></i>
			<span class="text-xs">{t('layout_nav_availability')}</span>
		</a>
		<a href="{base}/chyby" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-triangle-exclamation text-base"></i>
			<span class="text-xs">{t('layout_nav_errors')}</span>
		</a>
		<a href="{base}/performance" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-bolt text-base"></i>
			<span class="text-xs">{t('layout_nav_performance')}</span>
		</a>
		<a href="{base}/business" class="flex flex-col items-center gap-1 px-3 py-1.5 text-success min-w-[44px]">
			<i class="fa-solid fa-chart-line text-base"></i>
			<span class="text-xs font-semibold">{t('layout_nav_business')}</span>
		</a>
	</nav>
</div>
