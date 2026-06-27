<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';
	import {
		getServiceCards,
		getHealthChecks,
		getIncidents,
		getSlaGoals,
		getAvailabilityQuickStats
	} from '$lib/repositories/availabilityRepository';

	const serviceCards = getServiceCards();
	const healthChecks = getHealthChecks();
	const incidents = getIncidents();
	const slaGoals = getSlaGoals();
	const qs = getAvailabilityQuickStats();
	const activeIncident = incidents.find((i) => i.status === 'active');

	const statusBadge: Record<string, { bg: string; label: string }> = {
		online: { bg: 'bg-success/10 text-success border border-success/20', label: 'ONLINE' },
		degraded: { bg: 'bg-secondary/10 text-secondary border border-secondary/20', label: 'DEGRADED' },
		offline: { bg: 'bg-error/10 text-error border border-error/20', label: 'OFFLINE' }
	};

	const statusBar: Record<string, { barClass: string }> = {
		online: { barClass: 'bg-success' },
		degraded: { barClass: 'bg-secondary' },
		offline: { barClass: 'bg-error' }
	};

	const statusDot: Record<string, { dot: string; text: string; pulse: boolean }> = {
		online: { dot: 'bg-success', text: 'text-success', pulse: true },
		degraded: { dot: 'bg-secondary', text: 'text-secondary', pulse: false },
		offline: { dot: 'bg-error', text: 'text-error', pulse: false }
	};

	let hcOpen = $state(false);
	let utOpen = $state(true);
	let slaOpen = $state(true);

	function generateUptimeBars(
		containerId: string,
		config: { downDays?: number[]; degradedDays?: number[] },
		mobile = false
	) {
		const container = document.getElementById(containerId);
		if (!container) return;
		const days = 90;
		for (let i = 0; i < days; i++) {
			const block = document.createElement('div');
			if (mobile) {
				block.style.flex = '1';
				block.style.minWidth = '2px';
				block.style.height = '20px';
				block.style.borderRadius = '2px';
				block.style.flexShrink = '0';
			} else {
				block.style.width = '12px';
				block.style.height = '28px';
				block.style.borderRadius = '3px';
				block.style.flexShrink = '0';
			}
			block.style.cursor = 'pointer';
			let color = '#22c55e';
			let title = `Dne ${days - i}: Provoz`;
			if (config.downDays && config.downDays.includes(i)) {
				color = '#ef4444';
				title = `Dne ${days - i}: Výpadek`;
			} else if (config.degradedDays && config.degradedDays.includes(i)) {
				color = '#f97316';
				title = `Dne ${days - i}: Degradace`;
			}
			block.style.backgroundColor = color;
			block.title = title;
			container.appendChild(block);
		}
	}

	onMount(() => {
		const Plotly = (window as any).Plotly;

		// Generate uptime bars from repository data
		serviceCards.forEach((card) => {
			generateUptimeBars(`bar-${card.key}`, { downDays: card.downDays, degradedDays: card.degradedDays });
			generateUptimeBars(`bar-${card.key}-m`, { downDays: card.downDays, degradedDays: card.degradedDays }, true);
		});

		if (!Plotly) return;

		const chartConfig = { responsive: true, displayModeBar: false, displaylogo: false };

		const baseLayout = {
			margin: { t: 10, r: 10, b: 30, l: 40 },
			plot_bgcolor: 'transparent',
			paper_bgcolor: 'transparent',
			font: { color: '#94a3b8', family: 'Inter, sans-serif', size: 11 },
			xaxis: { showgrid: true, gridcolor: '#1e293b', zeroline: false, tickfont: { size: 10 } },
			yaxis: {
				showgrid: true,
				gridcolor: '#1e293b',
				zeroline: false,
				tickfont: { size: 10 },
				title: 'ms'
			},
			showlegend: false,
			autosize: true
		};

		const hours = Array.from({ length: 48 }, (_, i) => {
			const h = Math.floor(i / 2);
			const m = i % 2 === 0 ? '00' : '30';
			return `${String(h).padStart(2, '0')}:${m}`;
		});

		const frontendRT = hours.map(() => Math.random() * 30 + 80);
		frontendRT[10] = 420;
		const backendRT = hours.map(() => Math.random() * 60 + 220);
		backendRT[22] = 820;
		backendRT[23] = 690;

		const chartData = [
			{
				x: hours,
				y: frontendRT,
				type: 'scatter',
				mode: 'lines',
				name: 'Frontend',
				line: { color: '#22c55e', width: 2, shape: 'spline', smoothing: 0.8 },
				fill: 'tozeroy',
				fillcolor: 'rgba(34,197,94,0.07)'
			},
			{
				x: hours,
				y: backendRT,
				type: 'scatter',
				mode: 'lines',
				name: 'Backend API',
				line: { color: '#3b82f6', width: 2, shape: 'spline', smoothing: 0.8 },
				fill: 'tozeroy',
				fillcolor: 'rgba(59,130,246,0.07)'
			}
		];

		const desktopEl = document.getElementById('chart-response-time');
		if (desktopEl) Plotly.newPlot('chart-response-time', chartData, baseLayout, chartConfig);

		const mobileEl = document.getElementById('chart-response-time-m');
		if (mobileEl) {
			Plotly.newPlot(
				'chart-response-time-m',
				chartData,
				{
					...baseLayout,
					margin: { t: 8, r: 8, b: 28, l: 36 },
					font: { ...baseLayout.font, size: 10 },
					xaxis: { ...baseLayout.xaxis, tickfont: { size: 9 }, nticks: 6 },
					yaxis: { ...baseLayout.yaxis, tickfont: { size: 9 } }
				},
				chartConfig
			);
		}

		const handleResize = () => {
			['chart-response-time', 'chart-response-time-m'].forEach((id) => {
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
	<!-- Desktop Page Header -->
	<header
		class="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-[#1e293b] px-6 py-4 flex items-center justify-between gap-4"
	>
		<div>
			<h1 class="text-2xl font-bold text-textMain">{t('availability_header_title')}</h1>
			<p class="text-sm text-textSec mt-1">{t('availability_header_subtitle')}</p>
		</div>
		<div class="flex items-center gap-3">
			<div
				class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium"
			>
				<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
				{t('common_status_allSystemsOperational')}
			</div>
			<select
				class="bg-[#1e293b] border border-[#334155] text-sm text-textMain rounded-lg px-3 py-1.5 focus:outline-none"
			>
				<option>{t('common_timeRange_last24h')}</option>
				<option>{t('common_timeRange_last7d')}</option>
				<option>{t('common_timeRange_last30d')}</option>
			</select>
			<button
				class="px-4 py-2 bg-[#1e293b] hover:bg-[#2d3748] text-white rounded-lg text-sm font-medium transition-colors border border-[#334155]"
			>
				<i class="fa-solid fa-download mr-2"></i>{t('common_actions_export')}
			</button>
		</div>
	</header>

	<div class="p-6 max-w-7xl mx-auto space-y-6">
		<!-- Summary Cards -->
		<section class="grid grid-cols-4 gap-4">
			{#each serviceCards as card (card.key)}
				{@const badge = statusBadge[card.status]}
				{@const bar = statusBar[card.status]}
				<div class="bg-card border border-[#1e293b] rounded-xl p-5 relative overflow-hidden">
					<div class="absolute top-0 left-0 w-1 h-full {bar.barClass} rounded-l-xl"></div>
					<div class="flex justify-between items-start mb-3 pl-1">
						<div>
							<p class="text-xs text-textSec uppercase tracking-wider font-semibold">{card.name}</p>
							<p class="text-xs text-textSec mt-0.5">{card.provider}</p>
						</div>
						<span class="px-2 py-0.5 text-xs font-semibold rounded-full {badge.bg}">{badge.label}</span>
					</div>
					<div class="pl-1">
						<span class="text-4xl font-bold text-textMain">{card.uptimeDisplay}<span class="text-2xl">%</span></span>
						<p class="text-xs text-textSec mt-2">{t('common_timeRange_last30d')}</p>
						<div class="mt-3 h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full {bar.barClass} rounded-full" style="width:{card.uptimeDisplay}%"></div>
						</div>
						<div class="flex justify-between mt-1">
							<span class="text-xs text-textSec">{card.outageLabel}</span>
							{#if card.trendPositive}
								<span class="text-xs text-success">↑ {card.trend}</span>
							{:else}
								<span class="text-xs text-error">↓ {card.trend}</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</section>

		<!-- Response Time & Health Checks -->
		<section class="grid grid-cols-3 gap-6">
			<!-- Response Time Chart -->
			<div class="col-span-2 bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center justify-between gap-3 mb-5">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('availability_charts_responseTime')}</h3>
						<p class="text-xs text-textSec mt-1">{t('availability_charts_responseTimeSubtitle')}</p>
					</div>
					<div class="flex gap-4 text-sm">
						<div class="flex items-center gap-2">
							<span class="w-3 h-0.5 bg-success inline-block"></span>
							<span class="text-textSec">Frontend</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="w-3 h-0.5 bg-[#3b82f6] inline-block"></span>
							<span class="text-textSec">Backend API</span>
						</div>
					</div>
				</div>
				<div id="chart-response-time" class="h-[260px] w-full"></div>
			</div>

			<!-- Health Checks -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center justify-between mb-5">
					<h3 class="text-lg font-semibold text-textMain">{t('availability_health_title')}</h3>
					<span class="text-xs text-textSec">{t('availability_health_interval')}</span>
				</div>
				<div class="space-y-3">
					{#each healthChecks as hc (hc.endpoint)}
						{@const dot = statusDot[hc.status]}
						<div class="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 border border-[#334155]/40">
							<div class="flex items-center gap-3">
								<div class="w-2.5 h-2.5 rounded-full {dot.dot} {dot.pulse ? 'animate-pulse' : ''} flex-shrink-0"></div>
								<div>
									<p class="text-sm font-medium text-textMain">{hc.endpoint}</p>
									<p class="text-xs text-textSec">{hc.service}</p>
								</div>
							</div>
							<div class="text-right">
								<p class="text-sm font-semibold {dot.text}">{hc.statusCode}</p>
								<p class="text-xs text-textSec">{hc.latencyMs}ms</p>
							</div>
						</div>
					{/each}
					<div class="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between">
						<span class="text-xs text-textSec">{t('availability_health_lastCheck')}</span>
						<button class="text-xs text-primary hover:underline font-medium">
							<i class="fa-solid fa-rotate-right mr-1"></i>{t('common_actions_refresh')}
						</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Uptime Timeline -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-5">
			<div class="flex items-center justify-between gap-3 mb-6">
				<div>
					<h3 class="text-lg font-semibold text-textMain">{t('availability_timeline_title')}</h3>
					<p class="text-xs text-textSec mt-1">{t('availability_timeline_subtitle')}</p>
				</div>
				<div class="flex items-center gap-4 text-xs text-textSec">
					<div class="flex items-center gap-1.5">
						<span class="w-3 h-3 rounded-sm bg-success inline-block"></span>{t('availability_timeline_up')}
					</div>
					<div class="flex items-center gap-1.5">
						<span class="w-3 h-3 rounded-sm bg-secondary inline-block"></span>{t('availability_timeline_degraded')}
					</div>
					<div class="flex items-center gap-1.5">
						<span class="w-3 h-3 rounded-sm bg-error inline-block"></span>{t('availability_timeline_down')}
					</div>
					<div class="flex items-center gap-1.5">
						<span class="w-3 h-3 rounded-sm bg-[#1e293b] border border-[#334155] inline-block"></span>{t('availability_timeline_noData')}
					</div>
				</div>
			</div>

			<div class="space-y-5">
				{#each serviceCards as card (card.key)}
					{@const valueClass = card.status === 'degraded' ? 'text-secondary' : 'text-success'}
					<div>
						<div class="flex items-center justify-between mb-2">
							<div class="flex items-center gap-2">
								<i class="fa-solid {card.icon} text-textSec text-xs"></i>
								<span class="text-sm font-medium text-textMain">{card.name} ({card.provider})</span>
							</div>
							<span class="text-sm font-semibold {valueClass}">{card.uptimeDisplay}% {t('common_labels_uptime')}</span>
						</div>
						<div class="flex gap-0.5 items-end" id="bar-{card.key}"></div>
						<div class="flex justify-between mt-1">
							<span class="text-xs text-textSec">{t('availability_timeline_daysAgo')}</span>
							<span class="text-xs text-textSec">{t('availability_timeline_today')}</span>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Incidents + SLA -->
		<section class="grid grid-cols-3 gap-6">
			<!-- Incident Log -->
			<div class="col-span-2 bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center justify-between mb-5">
					<h3 class="text-lg font-semibold text-textMain">{t('availability_incidents_title')}</h3>
					<div class="flex gap-2">
						<button class="px-3 py-1 text-xs bg-[#1e293b] text-textMain rounded-lg border border-[#334155] font-medium">{t('common_status_all')}</button>
						<button class="px-3 py-1 text-xs text-textSec hover:bg-[#1e293b] rounded-lg transition-colors">{t('common_status_active')}</button>
						<button class="px-3 py-1 text-xs text-textSec hover:bg-[#1e293b] rounded-lg transition-colors">{t('common_status_resolved')}</button>
					</div>
				</div>
				<div class="space-y-3">
					{#each incidents as inc (inc.id)}
						{#if inc.status === 'active'}
							<div class="p-4 rounded-xl bg-[#1e293b]/60 border border-secondary/30">
								<div class="flex items-start gap-3">
									<div class="mt-1 flex-shrink-0">
										<span class="w-6 h-6 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center">
											<i class="fa-solid fa-triangle-exclamation text-secondary text-xs"></i>
										</span>
									</div>
									<div class="flex-1 min-w-0">
										<div class="flex flex-wrap items-center justify-between gap-2">
											<div class="flex items-center gap-2">
												<span class="text-sm font-semibold text-textMain">{inc.title}</span>
												<span class="px-1.5 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full border border-secondary/20 font-medium">{t('common_status_active')}</span>
											</div>
											<span class="text-xs text-textSec">{inc.timestamp}</span>
										</div>
										<p class="text-xs text-textSec mt-1.5">{inc.descriptionDesktop}</p>
										<div class="flex items-center gap-4 mt-2">
											<span class="text-xs text-textSec"><i class="fa-solid fa-clock mr-1"></i>{t('availability_incidents_ongoing', { duration: inc.duration })}</span>
											<span class="text-xs text-textSec"><i class="fa-solid {inc.serviceIcon} mr-1"></i>{inc.service}</span>
										</div>
									</div>
								</div>
							</div>
						{:else}
							<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
								<div class="flex items-start gap-3">
									<div class="mt-1 flex-shrink-0">
										<span class="w-6 h-6 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
											<i class="fa-solid fa-check text-success text-xs"></i>
										</span>
									</div>
									<div class="flex-1 min-w-0">
										<div class="flex flex-wrap items-center justify-between gap-2">
											<div class="flex items-center gap-2">
												<span class="text-sm font-medium text-textSec line-through">{inc.title}</span>
												<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full border border-success/20 font-medium">{t('common_status_resolved')}</span>
											</div>
											<span class="text-xs text-textSec">{inc.timestamp}</span>
										</div>
										<p class="text-xs text-textSec mt-1.5">{inc.descriptionDesktop}</p>
										<div class="flex items-center gap-4 mt-2">
											<span class="text-xs text-textSec"><i class="fa-solid fa-stopwatch mr-1"></i>{t('availability_incidents_duration', { duration: inc.duration })}</span>
											<span class="text-xs text-textSec"><i class="fa-solid {inc.serviceIcon} mr-1"></i>{inc.service}</span>
										</div>
									</div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>

			<!-- SLA + Quick Stats -->
			<div class="space-y-4">
				<!-- SLA Card -->
				<div class="bg-card border border-[#1e293b] rounded-xl p-5">
					<h3 class="text-base font-semibold text-textMain mb-4">{t('availability_sla_title')}</h3>
					<div class="space-y-4">
						{#each slaGoals as goal (goal.service)}
							<div>
								<div class="flex justify-between items-center mb-1.5">
									<span class="text-sm text-textSec">{goal.service}</span>
									<span class="text-sm font-semibold {goal.met ? 'text-success' : 'text-secondary'}">{goal.actual}%</span>
								</div>
								<div class="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
									<div class="h-full {goal.barClass} rounded-full" style="width:{goal.actual}%"></div>
								</div>
								{#if goal.met}
									<p class="text-xs text-textSec mt-1">{t('availability_sla_goalMet', { target: String(goal.target) })}</p>
								{:else}
									<p class="text-xs text-secondary mt-1">{t('availability_sla_goalNotMet', { target: String(goal.target) })}</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<!-- Quick Stats -->
				<div class="bg-card border border-[#1e293b] rounded-xl p-5">
					<h3 class="text-base font-semibold text-textMain mb-4">{t('availability_quickStats_title')}</h3>
					<div class="space-y-3">
						<div class="flex justify-between items-center">
							<span class="text-sm text-textSec">{t('availability_quickStats_totalOutages')}</span>
							<span class="text-sm font-semibold text-textMain">{qs.totalOutages30d}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-textSec">{t('availability_quickStats_mttr')}</span>
							<span class="text-sm font-semibold text-textMain">{qs.mttr}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-textSec">{t('availability_quickStats_mtbf')}</span>
							<span class="text-sm font-semibold text-textMain">{qs.mtbf}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-textSec">{t('availability_quickStats_longestOutage')}</span>
							<span class="text-sm font-semibold text-error">{qs.longestOutage}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-textSec">{t('availability_quickStats_checkInterval')}</span>
							<span class="text-sm font-semibold text-textMain">{qs.checkInterval}</span>
						</div>
						<div class="h-px bg-[#1e293b] my-1"></div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-textSec">{t('availability_quickStats_alertsSent')}</span>
							<span class="text-sm font-semibold text-textMain">{qs.alertsSent}</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</div>

<!-- ===== MOBILE LAYOUT ===== -->
<div class="lg:hidden">
	<div class="px-4 pt-4 space-y-4">
		<div>
			<h1 class="text-xl font-bold text-textMain">{t('availability_header_title')}</h1>
			<p class="text-sm text-textSec mt-0.5">{t('availability_header_subtitleMobile')}</p>
		</div>

		<!-- Status Banner (active incident) -->
		{#if activeIncident}
			<div class="p-3 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center gap-3">
				<div class="w-8 h-8 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center flex-shrink-0">
					<i class="fa-solid fa-triangle-exclamation text-secondary text-sm"></i>
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-semibold text-textMain">{t('availability_status_activeIncident')}</p>
					<p class="text-xs text-textSec truncate">{activeIncident.title} · {activeIncident.duration}</p>
				</div>
				<i class="fa-solid fa-chevron-right text-textSec text-xs flex-shrink-0"></i>
			</div>
		{/if}

		<!-- Time Range -->
		<select
			class="w-full bg-[#1e293b] border border-[#334155] text-sm text-textMain rounded-xl px-4 py-3 focus:outline-none"
			style="min-height:44px"
		>
			<option>{t('common_timeRange_last24h')}</option>
			<option>{t('common_timeRange_last7d')}</option>
			<option>{t('common_timeRange_last30d')}</option>
		</select>

		<!-- Summary Cards 2x2 -->
		<section>
			<h2 class="text-xs font-semibold text-textSec uppercase tracking-wider mb-3">
				{t('availability_overview_title')}
			</h2>
			<div class="grid grid-cols-2 gap-3">
				{#each serviceCards as card (card.key)}
					{@const bar = statusBar[card.status]}
					{@const dot = statusDot[card.status]}
					<div class="bg-card border border-[#1e293b] rounded-xl p-4 relative overflow-hidden">
						<div class="absolute top-0 left-0 w-1 h-full {bar.barClass} rounded-l-xl"></div>
						<div class="pl-1">
							<div class="flex items-start justify-between mb-2">
								<div>
									<p class="text-xs text-textSec uppercase tracking-wider font-semibold leading-tight">{card.name}</p>
									<p class="text-xs text-textSec">{card.provider.split(' /')[0]}</p>
								</div>
								<span class="w-2 h-2 rounded-full {dot.dot} {dot.pulse ? 'animate-pulse' : ''} mt-1 flex-shrink-0"></span>
							</div>
							<span class="text-2xl font-bold text-textMain">{card.uptimeDisplay}<span class="text-base">%</span></span>
							<div class="mt-2 h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full {bar.barClass} rounded-full" style="width:{card.uptimeDisplay}%"></div>
							</div>
							<div class="flex justify-between mt-1.5">
								<span class="text-xs text-textSec">{card.outageLabel}</span>
								{#if card.trendPositive}
									<span class="text-xs text-success">↑ {card.trend}</span>
								{:else}
									<span class="text-xs text-error">↓ {card.trend}</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Response Time Chart -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<div class="flex items-center justify-between mb-1">
				<div>
					<h3 class="text-sm font-semibold text-textMain">{t('availability_charts_responseTime')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('common_timeRange_last24h')}</p>
				</div>
				<div class="flex gap-3 text-xs">
					<div class="flex items-center gap-1.5">
						<span class="w-2.5 h-0.5 bg-success inline-block rounded"></span><span class="text-textSec">FE</span>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="w-2.5 h-0.5 bg-[#3b82f6] inline-block rounded"></span><span class="text-textSec">API</span>
					</div>
				</div>
			</div>
			<div id="chart-response-time-m" class="h-[200px] w-full"></div>
		</section>

		<!-- Health Checks Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				class="w-full flex items-center justify-between p-4"
				style="min-height:52px"
				onclick={() => (hcOpen = !hcOpen)}
			>
				<div class="flex items-center gap-2">
					<h3 class="text-sm font-semibold text-textMain">{t('availability_health_title')}</h3>
					<span class="text-xs text-textSec bg-[#1e293b] px-2 py-0.5 rounded-full">{t('availability_health_endpoints', { count: String(healthChecks.length) })}</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs text-textSec">{t('availability_health_interval')}</span>
					<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {hcOpen ? 'rotate-180' : ''}"></i>
				</div>
			</button>
			{#if hcOpen}
				<div class="px-4 pb-4 space-y-2">
					{#each healthChecks as hc (hc.endpoint)}
						{@const dot = statusDot[hc.status]}
						<div
							class="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 border {hc.status === 'degraded' ? 'border-secondary/20' : 'border-[#334155]/40'}"
							style="min-height:52px"
						>
							<div class="flex items-center gap-3">
								<div class="w-2.5 h-2.5 rounded-full {dot.dot} {dot.pulse ? 'animate-pulse' : ''} flex-shrink-0"></div>
								<div>
									<p class="text-sm font-medium text-textMain">{hc.endpoint}</p>
									<p class="text-xs text-textSec">{hc.service}</p>
								</div>
							</div>
							<div class="text-right">
								<p class="text-sm font-semibold {dot.text}">{hc.statusCode}</p>
								<p class="text-xs text-textSec">{hc.latencyMs}ms</p>
							</div>
						</div>
					{/each}
					<div class="pt-2 border-t border-[#1e293b] flex items-center justify-between">
						<span class="text-xs text-textSec">{t('availability_health_lastCheck')}</span>
						<button
							class="text-xs text-primary font-medium flex items-center gap-1 py-2 px-3"
							style="min-height:44px"
						>
							<i class="fa-solid fa-rotate-right"></i>{t('common_actions_refresh')}
						</button>
					</div>
				</div>
			{/if}
		</section>

		<!-- Uptime Timeline Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				class="w-full flex items-center justify-between p-4"
				style="min-height:52px"
				onclick={() => (utOpen = !utOpen)}
			>
				<h3 class="text-sm font-semibold text-textMain">{t('availability_timeline_titleMobile')}</h3>
				<div class="flex items-center gap-2">
					<span class="text-xs text-textSec">{t('availability_timeline_90days')}</span>
					<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {utOpen ? 'rotate-180' : ''}"></i>
				</div>
			</button>
			{#if utOpen}
				<div class="px-4 pb-4">
					<div class="flex flex-wrap items-center gap-3 mb-4 text-xs text-textSec">
						<div class="flex items-center gap-1">
							<span class="w-2.5 h-2.5 rounded-sm bg-success inline-block"></span>{t('availability_timeline_up')}
						</div>
						<div class="flex items-center gap-1">
							<span class="w-2.5 h-2.5 rounded-sm bg-secondary inline-block"></span>{t('availability_timeline_degraded')}
						</div>
						<div class="flex items-center gap-1">
							<span class="w-2.5 h-2.5 rounded-sm bg-error inline-block"></span>{t('availability_timeline_down')}
						</div>
					</div>
					<div class="space-y-4">
						{#each serviceCards as card (card.key)}
							{@const valueClass = card.status === 'degraded' ? 'text-secondary' : 'text-success'}
							<div>
								<div class="flex items-center justify-between mb-1.5">
									<div class="flex items-center gap-1.5">
										<i class="fa-solid {card.icon} text-textSec text-xs"></i>
										<span class="text-xs font-medium text-textMain">{card.name}</span>
									</div>
									<span class="text-xs font-semibold {valueClass}">{card.uptimeDisplay}%</span>
								</div>
								<div class="flex gap-px items-end w-full overflow-hidden h-5" id="bar-{card.key}-m"></div>
								<div class="flex justify-between mt-1">
									<span class="text-xs text-textSec">90d</span>
									<span class="text-xs text-textSec">dnes</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</section>

		<!-- Incidents -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<div class="p-4 border-b border-[#1e293b] flex items-center justify-between">
				<h3 class="text-sm font-semibold text-textMain">{t('availability_incidents_title')}</h3>
				<div class="flex gap-1.5">
					<button class="px-2.5 py-1.5 text-xs bg-[#1e293b] text-textMain rounded-lg border border-[#334155] font-medium" style="min-height:36px">{t('common_status_all')}</button>
					<button class="px-2.5 py-1.5 text-xs text-textSec hover:bg-[#1e293b] rounded-lg transition-colors" style="min-height:36px">{t('common_status_active')}</button>
					<button class="px-2.5 py-1.5 text-xs text-textSec hover:bg-[#1e293b] rounded-lg transition-colors" style="min-height:36px">{t('common_status_resolved')}</button>
				</div>
			</div>
			<div class="p-4 space-y-3">
				{#each incidents as inc (inc.id)}
					{#if inc.status === 'active'}
						<div class="p-4 rounded-xl bg-[#1e293b]/60 border border-secondary/30">
							<div class="flex items-start gap-3">
								<div class="w-7 h-7 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center flex-shrink-0 mt-0.5">
									<i class="fa-solid fa-triangle-exclamation text-secondary text-xs"></i>
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-start justify-between gap-2 flex-wrap">
										<span class="text-sm font-semibold text-textMain leading-tight">{inc.title}</span>
										<span class="px-1.5 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full border border-secondary/20 font-medium flex-shrink-0">{t('common_status_active')}</span>
									</div>
									<p class="text-xs text-textSec mt-1.5 leading-relaxed">{inc.descriptionMobile}</p>
									<div class="flex flex-wrap items-center gap-3 mt-2">
										<span class="text-xs text-textSec"><i class="fa-solid fa-clock mr-1"></i>{inc.duration}</span>
										<span class="text-xs text-textSec"><i class="fa-solid {inc.serviceIcon} mr-1"></i>{inc.service}</span>
										<span class="text-xs text-textSec">{inc.timestamp}</span>
									</div>
								</div>
							</div>
						</div>
					{:else}
						<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
							<div class="flex items-start gap-3">
								<div class="w-7 h-7 rounded-full bg-success/10 border border-success/30 flex items-center justify-center flex-shrink-0 mt-0.5">
									<i class="fa-solid fa-check text-success text-xs"></i>
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-start justify-between gap-2 flex-wrap">
										<span class="text-sm font-medium text-textSec line-through leading-tight">{inc.title}</span>
										<span class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full border border-success/20 font-medium flex-shrink-0">{t('common_status_resolved')}</span>
									</div>
									<p class="text-xs text-textSec mt-1.5 leading-relaxed">{inc.descriptionMobile}</p>
									<div class="flex flex-wrap items-center gap-3 mt-2">
										<span class="text-xs text-textSec"><i class="fa-solid fa-stopwatch mr-1"></i>{inc.duration}</span>
										<span class="text-xs text-textSec"><i class="fa-solid {inc.serviceIcon} mr-1"></i>{inc.service.split(' ')[0]}</span>
										<span class="text-xs text-textSec">{inc.timestamp}</span>
									</div>
								</div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</section>

		<!-- SLA Goals Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				class="w-full flex items-center justify-between p-4"
				style="min-height:52px"
				onclick={() => (slaOpen = !slaOpen)}
			>
				<h3 class="text-sm font-semibold text-textMain">{t('availability_sla_title')}</h3>
				<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {slaOpen ? 'rotate-180' : ''}"></i>
			</button>
			{#if slaOpen}
				<div class="px-4 pb-4 space-y-4">
					{#each slaGoals as goal (goal.service)}
						<div>
							<div class="flex justify-between items-center mb-1.5">
								<span class="text-sm text-textSec">{goal.service}</span>
								<span class="text-sm font-semibold {goal.met ? 'text-success' : 'text-secondary'}">{goal.actual}%</span>
							</div>
							<div class="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full {goal.barClass} rounded-full" style="width:{goal.actual}%"></div>
							</div>
							{#if goal.met}
								<p class="text-xs text-textSec mt-1">{t('availability_sla_goalMet', { target: String(goal.target) })}</p>
							{:else}
								<p class="text-xs text-secondary mt-1">{t('availability_sla_goalNotMet', { target: String(goal.target) })}</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Quick Stats -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4 mb-24">
			<h3 class="text-sm font-semibold text-textMain mb-4">{t('availability_quickStats_title')}</h3>
			<div class="grid grid-cols-2 gap-3">
				<div class="bg-[#1e293b]/50 rounded-xl p-3 text-center">
					<p class="text-2xl font-bold text-textMain">{qs.totalOutages30d}</p>
					<p class="text-xs text-textSec mt-1">{t('availability_quickStats_totalOutages')}</p>
				</div>
				<div class="bg-[#1e293b]/50 rounded-xl p-3 text-center">
					<p class="text-2xl font-bold text-textMain">{qs.mttr}</p>
					<p class="text-xs text-textSec mt-1">{t('availability_quickStats_mttr')}</p>
				</div>
				<div class="bg-[#1e293b]/50 rounded-xl p-3 text-center">
					<p class="text-2xl font-bold text-textMain">{qs.mtbf}</p>
					<p class="text-xs text-textSec mt-1">{t('availability_quickStats_mtbf')}</p>
				</div>
				<div class="bg-[#1e293b]/50 rounded-xl p-3 text-center">
					<p class="text-2xl font-bold text-error">{qs.longestOutage}</p>
					<p class="text-xs text-textSec mt-1">{t('availability_quickStats_longestOutage')}</p>
				</div>
				<div class="bg-[#1e293b]/50 rounded-xl p-3 text-center">
					<p class="text-2xl font-bold text-textMain">{qs.checkInterval}</p>
					<p class="text-xs text-textSec mt-1">{t('availability_quickStats_checkInterval')}</p>
				</div>
				<div class="bg-[#1e293b]/50 rounded-xl p-3 text-center">
					<p class="text-2xl font-bold text-textMain">{qs.alertsSent}</p>
					<p class="text-xs text-textSec mt-1">{t('availability_quickStats_alertsSent')}</p>
				</div>
			</div>
		</section>
	</div>

	<!-- Mobile Bottom Navigation -->
	<nav class="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-[#1e293b] flex items-center justify-around px-2 py-2">
		<a href="{base}/" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-textMain transition-colors" style="min-width:52px;min-height:52px;justify-content:center">
			<i class="fa-solid fa-gauge-high text-lg"></i>
			<span class="text-xs">{t('layout_nav_dashboard')}</span>
		</a>
		<a href="{base}/dostupnost" class="flex flex-col items-center gap-1 px-3 py-2 text-primary" style="min-width:52px;min-height:52px;justify-content:center">
			<i class="fa-solid fa-server text-lg"></i>
			<span class="text-xs font-semibold">{t('layout_nav_availability')}</span>
		</a>
		<a href="{base}/chyby" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-textMain transition-colors" style="min-width:52px;min-height:52px;justify-content:center">
			<i class="fa-solid fa-triangle-exclamation text-lg"></i>
			<span class="text-xs">{t('layout_nav_errors')}</span>
		</a>
		<a href="{base}/performance" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-textMain transition-colors" style="min-width:52px;min-height:52px;justify-content:center">
			<i class="fa-solid fa-bolt text-lg"></i>
			<span class="text-xs">{t('layout_nav_performance')}</span>
		</a>
		<a href="{base}/nastaveni" class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-textMain transition-colors" style="min-width:52px;min-height:52px;justify-content:center">
			<i class="fa-solid fa-gear text-lg"></i>
			<span class="text-xs">{t('layout_nav_settings')}</span>
		</a>
	</nav>
</div>
