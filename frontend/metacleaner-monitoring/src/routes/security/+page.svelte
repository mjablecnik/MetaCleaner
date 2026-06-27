<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';
	import {
		getSecuritySummary,
		getSecurityKpiStats,
		getSecuritySecondaryKpis,
		getAttackTypes,
		getActiveThreats,
		getBlockedIps,
		getSecurityEvents
	} from '$lib/repositories/securityRepository';

	type AccordionKey = 'ips' | 'log';
	type ChartTab = 'threats' | 'geo' | 'attacks';

	const summary = getSecuritySummary();
	const kpiStats = getSecurityKpiStats();
	const secondaryKpis = getSecuritySecondaryKpis();
	const attackTypes = getAttackTypes();
	const activeThreats = getActiveThreats();
	const blockedIps = getBlockedIps();
	const securityEvents = getSecurityEvents();

	// Split KPI stats: first is threat score (special), rest are standard
	const threatScoreKpi = kpiStats[0];
	const standardKpiStats = kpiStats.slice(1);

	let accordionOpen = $state<Record<AccordionKey, boolean>>({
		ips: false,
		log: false
	});
	let activeTab = $state<ChartTab>('threats');

	function toggleAccordion(key: AccordionKey) {
		accordionOpen[key] = !accordionOpen[key];
		if (accordionOpen[key]) {
			setTimeout(() => {
				const Plotly = (window as any).Plotly;
				if (!Plotly) return;
				const elMap: Record<AccordionKey, string> = {
					ips: '',
					log: ''
				};
				const elId = elMap[key];
				if (elId) {
					const el = document.getElementById(elId);
					if (el) Plotly.Plots.resize(el);
				}
			}, 50);
		}
	}

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

		const bgCard = '#111d33';
		const textSec = '#94a3b8';
		const errorColor = '#ef4444';
		const secondaryColor = '#f97316';
		const purpleColor = '#8b5cf6';
		const blueColor = '#3b82f6';
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
		const logins = [28, 14, 10, 22, 65, 148, 210, 340, 180, 120, 88, 60];

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

		const dataLogins = [
			{
				type: 'bar',
				x: hours, y: logins,
				marker: {
					color: logins.map((v: number) => v > 200 ? errorColor : v > 100 ? secondaryColor : 'rgba(239,68,68,0.4)'),
					opacity: 0.85
				},
				hovertemplate: '<b>%{x}</b><br>%{y} pokusů<extra></extra>'
			}
		];

		const pieLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 5, r: 5, b: 5, l: 5 },
			showlegend: false,
			annotations: [{
				text: '<b style="font-size:18px;color:#ef4444">42%</b><br><span style="font-size:10px;color:#94a3b8">Brute Force</span>',
				x: 0.5, y: 0.5,
				xanchor: 'center', yanchor: 'middle',
				showarrow: false,
				font: { size: 13, color: '#ffffff' }
			}]
		};

		const mobilePieLayout = {
			...pieLayout,
			annotations: [{
				text: '<b style="font-size:16px;color:#ef4444">42%</b><br><span style="font-size:9px;color:#94a3b8">Brute Force</span>',
				x: 0.5, y: 0.5,
				xanchor: 'center', yanchor: 'middle',
				showarrow: false,
				font: { size: 12, color: '#ffffff' }
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

		const elLogins = document.getElementById('chart-logins');
		if (elLogins) Plotly.newPlot('chart-logins', dataLogins, { ...commonLayout, bargap: 0.3, yaxis: { ...commonLayout.yaxis, title: { text: 'Pokusy', font: { size: 10, color: textSec } } } }, chartConfig);

		// Mobile charts
		const elThreatsM = document.getElementById('chart-threats-m');
		if (elThreatsM) Plotly.newPlot('chart-threats-m', dataThreatTimeline, mobileLayout, chartConfig);

		const elGeoM = document.getElementById('chart-geo-m');
		if (elGeoM) Plotly.newPlot('chart-geo-m', dataGeo, mobileGeoLayout, chartConfig);

		const elPieM = document.getElementById('chart-attack-pie-m');
		if (elPieM) Plotly.newPlot('chart-attack-pie-m', dataAttackPie, mobilePieLayout, chartConfig);

		const elLoginsM = document.getElementById('chart-logins-m');
		if (elLoginsM) Plotly.newPlot('chart-logins-m', dataLogins, { ...mobileLayout, bargap: 0.3 }, chartConfig);

		const handleResize = () => {
			['chart-threats', 'chart-geo', 'chart-attack-pie', 'chart-logins',
			 'chart-threats-m', 'chart-geo-m', 'chart-attack-pie-m', 'chart-logins-m'].forEach(id => {
				const el = document.getElementById(id);
				if (el) Plotly.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- ===== DESKTOP LAYOUT ===== -->
<div class="hidden lg:block">
	<header class="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-[#1e293b] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<div class="w-9 h-9 rounded-lg bg-error/15 border border-error/30 flex items-center justify-center">
				<i class="fa-solid fa-shield-halved text-error text-sm"></i>
			</div>
			<div>
				<h1 class="text-2xl font-bold text-textMain">{t('layout_nav_security')}</h1>
				<p class="text-sm text-textSec mt-0.5">{t('security_header_subtitle')}</p>
			</div>
		</div>
		<div class="flex items-center gap-3 flex-wrap">
			<div class="flex items-center gap-2 px-3 py-1.5 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium">
				<div class="w-2 h-2 rounded-full bg-error animate-pulse"></div>
				{summary.activeThreats} {t('security_status_activeThreats')}
			</div>
			<select class="bg-[#1e293b] border border-[#334155] text-sm text-textMain rounded-lg px-3 py-2 focus:outline-none">
				<option>{t('common_timeRange_last24h')}</option>
				<option>{t('common_timeRange_last7d')}</option>
				<option>{t('common_timeRange_last30d')}</option>
			</select>
			<button class="px-4 py-2 bg-[#1e293b] hover:bg-[#2d3748] text-white rounded-lg text-sm font-medium transition-colors border border-[#334155]">
				<i class="fa-solid fa-download mr-2"></i>{t('common_actions_export')}
			</button>
		</div>
	</header>

	<div class="p-6 max-w-7xl mx-auto space-y-6">

		<!-- KPI Stats Row 1 -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<!-- Threat Score (special card with bar) -->
			<div class="bg-card border {threatScoreKpi.borderClass} rounded-xl p-5 relative overflow-hidden">
				<div class="absolute top-0 right-0 w-24 h-24 bg-error/5 rounded-full -translate-y-8 translate-x-8"></div>
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">{t(threatScoreKpi.labelKey)}</h3>
					<span class="px-2 py-0.5 {threatScoreKpi.badgeClass} text-xs rounded-full font-medium">{t(threatScoreKpi.badgeKey)}</span>
				</div>
				<div class="flex items-end gap-2 mb-3">
					<span class="text-3xl font-bold {threatScoreKpi.valueClass}">{threatScoreKpi.value}</span>
					<span class="text-sm text-textSec mb-1">{threatScoreKpi.unit}</span>
					<span class="text-sm {threatScoreKpi.valueClass} mb-1 flex items-center gap-1 ml-1"><i class="fa-solid fa-arrow-up text-xs"></i>{threatScoreKpi.trend}</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full {threatScoreKpi.barClass} rounded-full" style="width:{threatScoreKpi.barWidth}"></div>
				</div>
				<p class="text-xs text-textSec mt-2">{threatScoreKpi.subtext}</p>
			</div>
			<!-- Standard KPI cards -->
			{#each standardKpiStats as stat (stat.key)}
				<div class="bg-card border border-[#1e293b] rounded-xl p-5">
					<div class="flex justify-between items-start mb-3">
						<h3 class="text-textSec text-sm font-medium">{t(stat.labelKey)}</h3>
						<span class="px-2 py-0.5 {stat.badgeClass} text-xs rounded-full font-medium">{t(stat.badgeKey)}</span>
					</div>
					<div class="flex items-end gap-2">
						<span class="text-3xl font-bold {stat.valueClass ?? 'text-textMain'}">{stat.value}</span>
						{#if stat.trend}
							<span class="text-sm {stat.trendPositive ? 'text-success' : 'text-secondary'} mb-1 flex items-center gap-1"><i class="fa-solid fa-arrow-up text-xs"></i>{stat.trend}</span>
						{/if}
					</div>
					<p class="text-xs text-textSec mt-2">{stat.subtext}</p>
				</div>
			{/each}
		</section>

		<!-- KPI Stats Row 2 -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each secondaryKpis as kpi (kpi.key)}
				<div class="bg-card border border-[#1e293b] rounded-xl p-5">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-8 h-8 rounded-lg {kpi.iconBg} flex items-center justify-center">
							<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
						</div>
						<h3 class="text-textSec text-sm font-medium">{t(kpi.labelKey)}</h3>
					</div>
					{#if kpi.key === 'sslCerts'}
						<div class="text-2xl font-bold {kpi.valueClass}">{t(kpi.value)}</div>
						<p class="text-xs text-textSec mt-1">{kpi.subtext} <span class="{kpi.subtextExtraClass}">{kpi.subtextExtra}</span></p>
					{:else}
						<div class="text-2xl font-bold text-textMain">{kpi.value}</div>
						<p class="text-xs text-textSec mt-1">{kpi.subtext}</p>
					{/if}
				</div>
			{/each}
		</section>

		<!-- Charts Row -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
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
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('security_charts_geoOrigins')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('security_charts_geoSubtitle')}</p>
					</div>
				</div>
				<div id="chart-geo" class="h-[220px] w-full"></div>
			</div>
		</section>

		<!-- Attack Types + Active Threats -->
		<section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<h3 class="text-lg font-semibold text-textMain mb-1">{t('security_attackTypes_title')}</h3>
				<p class="text-xs text-textSec mb-4">{t('security_attackTypes_subtitle')}</p>
				<div id="chart-attack-pie" class="h-[200px] w-full"></div>
				<div class="mt-4 space-y-2">
					{#each attackTypes as attack (attack.id)}
						<div class="flex items-center justify-between text-sm">
							<div class="flex items-center gap-2">
								<span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color:{attack.color}"></span>
								<span class="text-textSec">{attack.label}</span>
							</div>
							<span class="text-textMain font-medium">{attack.percent}%</span>
						</div>
					{/each}
				</div>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-5 lg:col-span-2">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('security_threats_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('security_threats_subtitle')}</p>
					</div>
					<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('security_threats_badge')}</span>
				</div>
				<div class="space-y-3">
					{#each activeThreats as threat (threat.id)}
						<div class="flex items-start gap-4 p-4 rounded-xl {threat.bgClass} border {threat.borderClass}">
							<div class="flex-shrink-0 mt-0.5">
								<div class="w-9 h-9 rounded-lg {threat.iconBg} flex items-center justify-center">
									<i class="fa-solid {threat.icon} {threat.iconClass} text-sm"></i>
								</div>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<p class="text-textMain text-sm font-semibold">{threat.title}</p>
									<span class="px-1.5 py-0.5 {threat.severityClass} text-xs rounded font-medium">{t(threat.severityKey)}</span>
								</div>
								<p class="text-xs text-textSec">IP: {threat.ip} · Původ: {threat.origin} · {threat.detail}</p>
								<p class="text-xs text-textSec mt-0.5">Endpoint: {threat.endpoint} · Agent: {threat.agentOrNote}</p>
							</div>
							<div class="flex-shrink-0 flex flex-col gap-2 items-end">
								<div class="{threat.iconClass} font-bold text-xs whitespace-nowrap">{threat.time} – aktivní</div>
								<button class="px-3 py-1 {threat.actionClass} text-xs font-medium rounded-lg transition-colors">{t(threat.actionKey)}</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Blocked IPs + Failed Logins -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('security_blockedIps_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('security_blockedIps_subtitle')}</p>
					</div>
					<button class="px-3 py-1.5 bg-[#1e293b] hover:bg-[#2d3748] text-textSec hover:text-textMain text-xs rounded-lg border border-[#334155] transition-colors">
						<i class="fa-solid fa-plus mr-1.5"></i>{t('security_blockedIps_addIp')}
					</button>
				</div>
				<div class="space-y-2">
					{#each blockedIps as ip (ip.id)}
						<div class="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40 hover:border-[#334155] transition-colors">
							<div class="w-7 h-7 rounded-lg bg-[#1e293b] flex items-center justify-center flex-shrink-0">
								<i class="fa-solid fa-ban {ip.iconClass} text-xs"></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-textMain text-sm font-mono">{ip.ip}</p>
								<p class="text-xs text-textSec">{ip.country} · {ip.reason}</p>
							</div>
							<div class="flex items-center gap-2 flex-shrink-0">
								<span class="px-1.5 py-0.5 {ip.blockTypeClass} text-xs rounded font-medium">{t(ip.blockTypeKey)}</span>
								<span class="text-xs text-textSec">{ip.blockedAt}</span>
							</div>
						</div>
					{/each}
				</div>
				<div class="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-textSec">
					<span>{t('security_blockedIps_footer')}</span>
					<button class="text-[#3b82f6] hover:text-[#60a5fa] transition-colors">{t('security_blockedIps_showAll')}</button>
				</div>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('security_failedLogins_title')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('security_failedLogins_subtitle')}</p>
					</div>
				</div>
				<div id="chart-logins" class="h-[220px] w-full"></div>
			</div>
		</section>

		<!-- Security Event Log -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-5">
			<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('security_eventLog_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('security_eventLog_subtitle')}</p>
				</div>
				<div class="flex gap-3 flex-wrap">
					<div class="flex rounded-lg overflow-hidden border border-[#334155]">
						<button class="px-3 py-1.5 bg-error/20 text-error text-xs font-medium">{t('common_status_all')}</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">{t('security_severity_critical')}</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">{t('common_status_warning')}</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">{t('common_labels_info')}</button>
					</div>
					<div class="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-1.5">
						<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
						<input type="text" placeholder="{t('security_eventLog_searchPlaceholder')}" class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-32" />
					</div>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-[#1e293b]">
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_time')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_type')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_description')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('security_table_ipSource')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_endpoint')}</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3">{t('common_table_status')}</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[#1e293b]/60">
						{#each securityEvents as event (event.id)}
							<tr class="hover:bg-[#1e293b]/30 transition-colors">
								<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">{event.time}</td>
								<td class="py-3 pr-4"><span class="px-2 py-0.5 {event.typeLabelClass} text-xs rounded font-medium">{event.typeLabel}</span></td>
								<td class="py-3 pr-4 text-textMain max-w-xs truncate">{event.description}</td>
								<td class="py-3 pr-4 text-textSec font-mono text-xs">{event.ipSource}</td>
								<td class="py-3 pr-4 text-textSec font-mono text-xs">{event.endpoint}</td>
								<td class="py-3"><span class="px-2 py-0.5 {event.statusClass} text-xs rounded">{t(event.statusKey)}</span></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

	</div>
</div>

<!-- ===== MOBILE LAYOUT ===== -->
<div class="lg:hidden pb-20">

	<!-- Page Title Bar -->
	<div class="px-4 pt-3 pb-3 bg-card border-b border-[#1e293b] flex items-center justify-between gap-3">
		<div class="flex items-center gap-2.5">
			<div class="w-8 h-8 rounded-lg bg-error/15 border border-error/30 flex items-center justify-center">
				<i class="fa-solid fa-shield-halved text-error text-xs"></i>
			</div>
			<div>
				<h1 class="text-base font-bold text-textMain leading-tight">{t('layout_nav_security')}</h1>
				<p class="text-xs text-textSec">{t('security_header_subtitleMobile')}</p>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<div class="flex items-center gap-1.5 px-2.5 py-1.5 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-medium">
				<div class="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></div>
				{summary.activeThreats} {t('security_status_threats')}
			</div>
			<select class="bg-[#1e293b] border border-[#334155] text-xs text-textMain rounded-lg px-2.5 py-2 focus:outline-none min-h-[36px]">
				<option>{t('common_timeRange_last24h')}</option>
				<option>{t('common_timeRange_last7d')}</option>
				<option>{t('common_timeRange_last30d')}</option>
			</select>
		</div>
	</div>

	<div class="px-4 py-4 space-y-4">

		<!-- KPI Stats (2x2 grid, Threat Score spans full width) -->
		<section class="grid grid-cols-2 gap-3">
			<!-- Threat Score (full width) -->
			<div class="bg-card border {threatScoreKpi.borderClass} rounded-xl p-4 relative overflow-hidden col-span-2">
				<div class="absolute top-0 right-0 w-20 h-20 bg-error/5 rounded-full -translate-y-6 translate-x-6"></div>
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-textSec text-xs font-medium">{t(threatScoreKpi.labelKey)}</h3>
					<span class="px-2 py-0.5 {threatScoreKpi.badgeClass} text-xs rounded-full font-medium">{t(threatScoreKpi.badgeKey)}</span>
				</div>
				<div class="flex items-center gap-3 mb-3">
					<span class="text-4xl font-bold {threatScoreKpi.valueClass}">{threatScoreKpi.value}</span>
					<div class="flex flex-col gap-0.5">
						<span class="text-xs text-textSec">{threatScoreKpi.unit}</span>
						<span class="text-xs {threatScoreKpi.valueClass} flex items-center gap-1 font-medium"><i class="fa-solid fa-arrow-up text-xs"></i>{threatScoreKpi.trend} dnes</span>
					</div>
					<div class="flex-1 ml-2">
						<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-gradient-to-r from-error/60 to-error rounded-full" style="width:{threatScoreKpi.barWidth}"></div>
						</div>
						<p class="text-xs text-textSec mt-1">{threatScoreKpi.subtext}</p>
					</div>
				</div>
			</div>

			<!-- Failed Logins -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<h3 class="text-textSec text-xs font-medium mb-2 leading-tight">{t('security_kpi_failedLogins')}</h3>
				<div class="text-2xl font-bold text-textMain">{standardKpiStats[0].value}</div>
				<span class="text-xs text-secondary flex items-center gap-0.5 font-medium mt-0.5"><i class="fa-solid fa-arrow-up text-xs"></i>{standardKpiStats[0].trend}</span>
				<p class="text-xs text-textSec mt-1.5 leading-tight">Brute-force: 4 IP</p>
				<span class="mt-2 inline-block px-1.5 py-0.5 {standardKpiStats[0].badgeClass} text-xs rounded-full font-medium">{t(standardKpiStats[0].badgeKey)}</span>
			</div>

			<!-- Blocked IPs -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<h3 class="text-textSec text-xs font-medium mb-2 leading-tight">{t('security_kpi_blockedIpsMobile')}</h3>
				<div class="text-2xl font-bold text-textMain">{standardKpiStats[1].value}</div>
				<span class="text-xs text-success flex items-center gap-0.5 font-medium mt-0.5"><i class="fa-solid fa-arrow-up text-xs"></i>{standardKpiStats[1].trend}</span>
				<p class="text-xs text-textSec mt-1.5 leading-tight">Auto: 28 · Manual: 10</p>
				<span class="mt-2 inline-block px-1.5 py-0.5 {standardKpiStats[1].badgeClass} text-xs rounded-full font-medium">{t(standardKpiStats[1].badgeKey)}</span>
			</div>

			<!-- Anomalies -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<h3 class="text-textSec text-xs font-medium mb-2">{t('security_kpi_anomalies')}</h3>
				<div class="text-2xl font-bold {standardKpiStats[2].valueClass ?? 'text-textMain'}">{standardKpiStats[2].value}</div>
				<span class="text-xs {standardKpiStats[2].valueClass} flex items-center gap-0.5 font-medium mt-0.5"><i class="fa-solid fa-arrow-up text-xs"></i>{standardKpiStats[2].trend}</span>
				<p class="text-xs text-textSec mt-1.5 leading-tight">SQL, XSS, Rate</p>
				<span class="mt-2 inline-block px-1.5 py-0.5 {standardKpiStats[2].badgeClass} text-xs rounded-full font-medium">{t(standardKpiStats[2].badgeKey)}</span>
			</div>

			<!-- SSL Certs -->
			{#each secondaryKpis.filter(k => k.key === 'sslCerts') as kpi (kpi.key)}
				<div class="bg-card border border-[#1e293b] rounded-xl p-4">
					<h3 class="text-textSec text-xs font-medium mb-2">{t(kpi.labelKey)}</h3>
					<div class="text-2xl font-bold {kpi.valueClass}">{t(kpi.value)}</div>
					<p class="text-xs text-textSec mt-1.5">{kpi.subtext} <span class="{kpi.subtextExtraClass}">{kpi.subtextExtra}</span></p>
					<div class="w-8 h-8 rounded-lg {kpi.iconBg} flex items-center justify-center mt-2">
						<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
					</div>
				</div>
			{/each}
		</section>

		<!-- Secondary Stats (horizontal scroll) -->
		<section class="overflow-x-auto -mx-4 px-4">
			<div class="flex gap-3 w-max">
				{#each secondaryKpis.filter(k => k.key !== 'sslCerts') as kpi (kpi.key)}
					<div class="bg-card border border-[#1e293b] rounded-xl p-4 w-36 flex-shrink-0">
						<div class="w-8 h-8 rounded-lg {kpi.iconBg} flex items-center justify-center mb-2">
							<i class="fa-solid {kpi.icon} {kpi.iconColor} text-xs"></i>
						</div>
						<div class="text-xl font-bold text-textMain">{kpi.value}</div>
						<p class="text-xs text-textSec mt-0.5 leading-tight">{t(kpi.labelKey)}</p>
					</div>
				{/each}
				<div class="bg-card border border-[#1e293b] rounded-xl p-4 w-36 flex-shrink-0">
					<div class="w-8 h-8 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center mb-2">
						<i class="fa-solid fa-eye text-[#3b82f6] text-xs"></i>
					</div>
					<div class="text-xl font-bold text-textMain">12</div>
					<p class="text-xs text-textSec mt-0.5 leading-tight">Unikátní útočníci</p>
				</div>
			</div>
		</section>

		<!-- Active Threats -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<div class="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#1e293b]">
				<div>
					<h3 class="text-base font-semibold text-textMain">{t('security_threats_title')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('security_threats_subtitle')}</p>
				</div>
				<span class="flex items-center gap-1.5 text-xs text-error bg-error/10 border border-error/20 px-2.5 py-1 rounded-lg font-medium">
					<div class="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></div>
					{t('security_threats_badge')}
				</span>
			</div>
			<div class="divide-y divide-[#1e293b]/60">
				{#each activeThreats as threat (threat.id)}
					<div class="p-4 {threat.bgClass}">
						<div class="flex items-start gap-3">
							<div class="w-9 h-9 rounded-lg {threat.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5">
								<i class="fa-solid {threat.icon} {threat.iconClass} text-sm"></i>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 flex-wrap mb-1">
									<p class="text-textMain text-sm font-semibold leading-tight">{threat.title}</p>
									<span class="px-1.5 py-0.5 {threat.severityClass} text-xs rounded font-medium">{t(threat.severityKey)}</span>
								</div>
								<p class="text-xs text-textSec">IP: {threat.ip} · {threat.origin} · {threat.detail}</p>
								<p class="text-xs text-textSec mt-0.5 font-mono">{threat.endpoint}</p>
								<div class="flex items-center justify-between mt-3">
									<span class="{threat.iconClass} font-bold text-xs">{threat.time} – aktivní</span>
									<button class="px-4 py-2 {threat.actionClass} text-xs font-medium rounded-lg transition-colors min-h-[36px]">{t(threat.actionKey)}</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Charts — tabbed -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<div class="border-b border-[#1e293b]">
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

		<!-- Failed Logins Chart -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<div class="flex items-center justify-between mb-3">
				<div>
					<h3 class="text-sm font-semibold text-textMain">{t('security_failedLogins_titleMobile')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('security_failedLogins_subtitleMobile')}</p>
				</div>
			</div>
			<div id="chart-logins-m" class="h-[180px] w-full"></div>
		</section>

		<!-- Blocked IPs Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<div class="flex items-center justify-between px-4 py-4 min-h-[56px]">
				<button
					onclick={() => toggleAccordion('ips')}
					class="flex items-center gap-3 flex-1 text-left"
				>
					<div class="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
						<i class="fa-solid fa-ban text-error text-xs"></i>
					</div>
					<div class="text-left">
						<p class="text-sm font-semibold text-textMain">{t('security_blockedIps_title')}</p>
						<p class="text-xs text-textSec">{t('security_blockedIps_footerMobile')}</p>
					</div>
				</button>
				<div class="flex items-center gap-2 flex-shrink-0">
					<button class="px-3 py-1.5 bg-[#1e293b] text-textSec text-xs rounded-lg border border-[#334155] min-h-[36px]">
						<i class="fa-solid fa-plus mr-1"></i>{t('security_blockedIps_addIpMobile')}
					</button>
					<button onclick={() => toggleAccordion('ips')} class="p-1" aria-label="Toggle">
						<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {accordionOpen.ips ? 'rotate-180' : ''}"></i>
					</button>
				</div>
			</div>
			{#if accordionOpen.ips}
				<div class="border-t border-[#1e293b]">
					<div class="divide-y divide-[#1e293b]/60">
						{#each blockedIps as ip (ip.id)}
							<div class="flex items-center gap-3 p-4">
								<div class="w-7 h-7 rounded-lg bg-[#1e293b] flex items-center justify-center flex-shrink-0">
									<i class="fa-solid fa-ban {ip.iconClass} text-xs"></i>
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-textMain text-sm font-mono">{ip.ip}</p>
									<p class="text-xs text-textSec">{ip.country} · {ip.reason}</p>
								</div>
								<div class="flex flex-col items-end gap-1">
									<span class="px-1.5 py-0.5 {ip.blockTypeClass} text-xs rounded font-medium">{t(ip.blockTypeKey)}</span>
									<span class="text-xs text-textSec">{ip.blockedAt}</span>
								</div>
							</div>
						{/each}
					</div>
					<div class="px-4 py-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-textSec">
						<span>{t('security_blockedIps_footerMobile')}</span>
						<button class="text-[#3b82f6] font-medium min-h-[36px] px-2">{t('security_blockedIps_showAll')}</button>
					</div>
				</div>
			{/if}
		</section>

		<!-- Security Event Log Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				onclick={() => toggleAccordion('log')}
				class="w-full flex items-center justify-between px-4 py-4 min-h-[56px]"
			>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center">
						<i class="fa-solid fa-list text-textSec text-xs"></i>
					</div>
					<div class="text-left">
						<p class="text-sm font-semibold text-textMain">{t('security_eventLog_title')}</p>
						<p class="text-xs text-textSec">{t('security_eventLog_subtitleMobile')}</p>
					</div>
				</div>
				<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {accordionOpen.log ? 'rotate-180' : ''}"></i>
			</button>
			{#if accordionOpen.log}
				<div class="border-t border-[#1e293b]">
					<div class="px-4 py-3 flex gap-2 overflow-x-auto border-b border-[#1e293b]">
						<button class="px-3 py-1.5 bg-error/20 text-error text-xs font-medium rounded-lg whitespace-nowrap min-h-[36px]">{t('common_status_all')}</button>
						<button class="px-3 py-1.5 bg-[#1e293b] text-textSec text-xs font-medium rounded-lg whitespace-nowrap min-h-[36px] hover:text-textMain">{t('security_severity_critical')}</button>
						<button class="px-3 py-1.5 bg-[#1e293b] text-textSec text-xs font-medium rounded-lg whitespace-nowrap min-h-[36px] hover:text-textMain">{t('common_status_warning')}</button>
						<button class="px-3 py-1.5 bg-[#1e293b] text-textSec text-xs font-medium rounded-lg whitespace-nowrap min-h-[36px] hover:text-textMain">{t('common_labels_info')}</button>
					</div>
					<div class="px-4 py-3 border-b border-[#1e293b]">
						<div class="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5">
							<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
							<input type="text" placeholder="{t('security_eventLog_searchPlaceholderMobile')}" class="bg-transparent text-sm text-textMain placeholder-textSec outline-none flex-1" />
						</div>
					</div>
					<div class="divide-y divide-[#1e293b]/60">
						{#each securityEvents as event (event.id)}
							<div class="p-4">
								<div class="flex items-center justify-between mb-2">
									<div class="flex items-center gap-2">
										<span class="px-2 py-0.5 {event.typeLabelClass} text-xs rounded font-medium">{event.typeLabel}</span>
										<span class="font-mono text-xs text-textSec">{event.time}</span>
									</div>
									<span class="px-2 py-0.5 {event.statusClass} text-xs rounded">{t(event.statusKey)}</span>
								</div>
								<p class="text-sm text-textMain mb-1">{event.description}</p>
								<p class="text-xs text-textSec font-mono">{event.ipSource} · {event.endpoint}</p>
							</div>
						{/each}
					</div>
					<div class="px-4 py-3 border-t border-[#1e293b]">
						<button class="w-full py-2.5 text-xs text-[#3b82f6] font-medium text-center min-h-[44px]">{t('security_eventLog_loadMore')}</button>
					</div>
				</div>
			{/if}
		</section>

		<div class="h-4"></div>
	</div>

	<!-- Bottom Navigation -->
	<nav class="fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-[#1e293b] px-2 py-2 flex items-center justify-around lg:hidden">
		<a href="{base}/" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-gauge-high text-base"></i>
			<span class="text-xs">{t('layout_nav_dashboard')}</span>
		</a>
		<a href="{base}/runtime" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-server text-base"></i>
			<span class="text-xs">{t('layout_nav_runtime')}</span>
		</a>
		<a href="{base}/security" class="flex flex-col items-center gap-1 px-3 py-1.5 text-error relative min-w-[44px]">
			<div class="absolute -top-1 right-1/4 w-4 h-4 bg-error rounded-full flex items-center justify-center">
				<span class="text-white font-bold" style="font-size:9px">{summary.activeThreats}</span>
			</div>
			<i class="fa-solid fa-shield-halved text-base"></i>
			<span class="text-xs font-semibold">{t('layout_nav_security')}</span>
		</a>
		<a href="{base}/business" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-chart-line text-base"></i>
			<span class="text-xs">{t('layout_nav_business')}</span>
		</a>
		<a href="{base}/nastaveni" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-gear text-base"></i>
			<span class="text-xs">{t('layout_nav_settings')}</span>
		</a>
	</nav>
</div>
