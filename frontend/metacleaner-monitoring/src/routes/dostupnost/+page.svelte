<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';

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

		// Generate uptime bars for desktop
		const uptimeConfig = {
			frontend: { downDays: [] as number[], degradedDays: [45] },
			backend: { downDays: [12, 67], degradedDays: [23, 55] },
			db: { downDays: [34], degradedDays: [20, 60] },
			cf: { downDays: [5, 18, 42, 71, 83], degradedDays: [0, 10, 25, 50, 65, 78] }
		};

		generateUptimeBars('bar-frontend', uptimeConfig.frontend);
		generateUptimeBars('bar-backend', uptimeConfig.backend);
		generateUptimeBars('bar-db', uptimeConfig.db);
		generateUptimeBars('bar-cf', uptimeConfig.cf);

		generateUptimeBars('bar-frontend-m', uptimeConfig.frontend, true);
		generateUptimeBars('bar-backend-m', uptimeConfig.backend, true);
		generateUptimeBars('bar-db-m', uptimeConfig.db, true);
		generateUptimeBars('bar-cf-m', uptimeConfig.cf, true);

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
			<!-- Frontend -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-5 relative overflow-hidden">
				<div class="absolute top-0 left-0 w-1 h-full bg-success rounded-l-xl"></div>
				<div class="flex justify-between items-start mb-3 pl-1">
					<div>
						<p class="text-xs text-textSec uppercase tracking-wider font-semibold">Frontend</p>
						<p class="text-xs text-textSec mt-0.5">Vercel / CDN</p>
					</div>
					<span
						class="px-2 py-0.5 bg-success/10 text-success text-xs font-semibold rounded-full border border-success/20"
						>ONLINE</span
					>
				</div>
				<div class="pl-1">
					<span class="text-4xl font-bold text-textMain">99.99<span class="text-2xl">%</span></span>
					<p class="text-xs text-textSec mt-2">{t('common_timeRange_last30d')}</p>
					<div class="mt-3 h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden">
						<div class="h-full bg-success rounded-full" style="width:99.99%"></div>
					</div>
					<div class="flex justify-between mt-1">
						<span class="text-xs text-textSec">0 výpadků</span>
						<span class="text-xs text-success">↑ +0.01%</span>
					</div>
				</div>
			</div>

			<!-- Backend API -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-5 relative overflow-hidden">
				<div class="absolute top-0 left-0 w-1 h-full bg-success rounded-l-xl"></div>
				<div class="flex justify-between items-start mb-3 pl-1">
					<div>
						<p class="text-xs text-textSec uppercase tracking-wider font-semibold">Backend API</p>
						<p class="text-xs text-textSec mt-0.5">Fly.io</p>
					</div>
					<span
						class="px-2 py-0.5 bg-success/10 text-success text-xs font-semibold rounded-full border border-success/20"
						>ONLINE</span
					>
				</div>
				<div class="pl-1">
					<span class="text-4xl font-bold text-textMain">99.95<span class="text-2xl">%</span></span>
					<p class="text-xs text-textSec mt-2">{t('common_timeRange_last30d')}</p>
					<div class="mt-3 h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden">
						<div class="h-full bg-success rounded-full" style="width:99.95%"></div>
					</div>
					<div class="flex justify-between mt-1">
						<span class="text-xs text-textSec">2 výpadky</span>
						<span class="text-xs text-error">↓ -0.03%</span>
					</div>
				</div>
			</div>

			<!-- Databáze -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-5 relative overflow-hidden">
				<div class="absolute top-0 left-0 w-1 h-full bg-success rounded-l-xl"></div>
				<div class="flex justify-between items-start mb-3 pl-1">
					<div>
						<p class="text-xs text-textSec uppercase tracking-wider font-semibold">Databáze</p>
						<p class="text-xs text-textSec mt-0.5">Supabase</p>
					</div>
					<span
						class="px-2 py-0.5 bg-success/10 text-success text-xs font-semibold rounded-full border border-success/20"
						>ONLINE</span
					>
				</div>
				<div class="pl-1">
					<span class="text-4xl font-bold text-textMain">99.97<span class="text-2xl">%</span></span>
					<p class="text-xs text-textSec mt-2">{t('common_timeRange_last30d')}</p>
					<div class="mt-3 h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden">
						<div class="h-full bg-success rounded-full" style="width:99.97%"></div>
					</div>
					<div class="flex justify-between mt-1">
						<span class="text-xs text-textSec">1 výpadek</span>
						<span class="text-xs text-success">↑ +0.02%</span>
					</div>
				</div>
			</div>

			<!-- Edge CDN -->
			<div class="bg-card border border-[#1e293b] rounded-xl p-5 relative overflow-hidden">
				<div class="absolute top-0 left-0 w-1 h-full bg-secondary rounded-l-xl"></div>
				<div class="flex justify-between items-start mb-3 pl-1">
					<div>
						<p class="text-xs text-textSec uppercase tracking-wider font-semibold">Edge / CDN</p>
						<p class="text-xs text-textSec mt-0.5">Cloudflare</p>
					</div>
					<span
						class="px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-semibold rounded-full border border-secondary/20"
						>DEGRADED</span
					>
				</div>
				<div class="pl-1">
					<span class="text-4xl font-bold text-textMain">99.82<span class="text-2xl">%</span></span>
					<p class="text-xs text-textSec mt-2">{t('common_timeRange_last30d')}</p>
					<div class="mt-3 h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden">
						<div class="h-full bg-secondary rounded-full" style="width:99.82%"></div>
					</div>
					<div class="flex justify-between mt-1">
						<span class="text-xs text-textSec">5 výpadků</span>
						<span class="text-xs text-error">↓ -0.08%</span>
					</div>
				</div>
			</div>
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
					<div
						class="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 border border-[#334155]/40"
					>
						<div class="flex items-center gap-3">
							<div class="w-2.5 h-2.5 rounded-full bg-success animate-pulse flex-shrink-0"></div>
							<div>
								<p class="text-sm font-medium text-textMain">/health</p>
								<p class="text-xs text-textSec">Backend API</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-success">200 OK</p>
							<p class="text-xs text-textSec">42ms</p>
						</div>
					</div>
					<div
						class="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 border border-[#334155]/40"
					>
						<div class="flex items-center gap-3">
							<div class="w-2.5 h-2.5 rounded-full bg-success animate-pulse flex-shrink-0"></div>
							<div>
								<p class="text-sm font-medium text-textMain">/api/ping</p>
								<p class="text-xs text-textSec">Backend API</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-success">200 OK</p>
							<p class="text-xs text-textSec">18ms</p>
						</div>
					</div>
					<div
						class="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 border border-[#334155]/40"
					>
						<div class="flex items-center gap-3">
							<div class="w-2.5 h-2.5 rounded-full bg-success animate-pulse flex-shrink-0"></div>
							<div>
								<p class="text-sm font-medium text-textMain">/ (root)</p>
								<p class="text-xs text-textSec">Frontend</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-success">200 OK</p>
							<p class="text-xs text-textSec">91ms</p>
						</div>
					</div>
					<div
						class="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 border border-[#334155]/40"
					>
						<div class="flex items-center gap-3">
							<div class="w-2.5 h-2.5 rounded-full bg-secondary flex-shrink-0"></div>
							<div>
								<p class="text-sm font-medium text-textMain">/api/db-health</p>
								<p class="text-xs text-textSec">Supabase</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-secondary">200 OK</p>
							<p class="text-xs text-textSec">412ms</p>
						</div>
					</div>
					<div
						class="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 border border-[#334155]/40"
					>
						<div class="flex items-center gap-3">
							<div class="w-2.5 h-2.5 rounded-full bg-success animate-pulse flex-shrink-0"></div>
							<div>
								<p class="text-sm font-medium text-textMain">CF Edge Check</p>
								<p class="text-xs text-textSec">Cloudflare</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-success">200 OK</p>
							<p class="text-xs text-textSec">8ms</p>
						</div>
					</div>
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
					<h3 class="text-lg font-semibold text-textMain">
						{t('availability_timeline_title')}
					</h3>
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
						<span class="w-3 h-3 rounded-sm bg-[#1e293b] border border-[#334155] inline-block"
						></span>{t('availability_timeline_noData')}
					</div>
				</div>
			</div>

			<div class="space-y-5">
				<!-- Frontend -->
				<div>
					<div class="flex items-center justify-between mb-2">
						<div class="flex items-center gap-2">
							<i class="fa-solid fa-desktop text-textSec text-xs"></i>
							<span class="text-sm font-medium text-textMain">Frontend (Vercel)</span>
						</div>
						<span class="text-sm font-semibold text-success">99.99% {t('common_labels_uptime')}</span>
					</div>
					<div class="flex gap-0.5 items-end" id="bar-frontend"></div>
					<div class="flex justify-between mt-1">
						<span class="text-xs text-textSec">{t('availability_timeline_daysAgo')}</span>
						<span class="text-xs text-textSec">{t('availability_timeline_today')}</span>
					</div>
				</div>

				<!-- Backend -->
				<div>
					<div class="flex items-center justify-between mb-2">
						<div class="flex items-center gap-2">
							<i class="fa-solid fa-server text-textSec text-xs"></i>
							<span class="text-sm font-medium text-textMain">Backend API (Fly.io)</span>
						</div>
						<span class="text-sm font-semibold text-success">99.95% {t('common_labels_uptime')}</span>
					</div>
					<div class="flex gap-0.5 items-end" id="bar-backend"></div>
					<div class="flex justify-between mt-1">
						<span class="text-xs text-textSec">{t('availability_timeline_daysAgo')}</span>
						<span class="text-xs text-textSec">{t('availability_timeline_today')}</span>
					</div>
				</div>

				<!-- Database -->
				<div>
					<div class="flex items-center justify-between mb-2">
						<div class="flex items-center gap-2">
							<i class="fa-solid fa-database text-textSec text-xs"></i>
							<span class="text-sm font-medium text-textMain">Databáze (Supabase)</span>
						</div>
						<span class="text-sm font-semibold text-success">99.97% {t('common_labels_uptime')}</span>
					</div>
					<div class="flex gap-0.5 items-end" id="bar-db"></div>
					<div class="flex justify-between mt-1">
						<span class="text-xs text-textSec">{t('availability_timeline_daysAgo')}</span>
						<span class="text-xs text-textSec">{t('availability_timeline_today')}</span>
					</div>
				</div>

				<!-- Cloudflare -->
				<div>
					<div class="flex items-center justify-between mb-2">
						<div class="flex items-center gap-2">
							<i class="fa-solid fa-cloud text-textSec text-xs"></i>
							<span class="text-sm font-medium text-textMain">Edge CDN (Cloudflare)</span>
						</div>
						<span class="text-sm font-semibold text-secondary">99.82% {t('common_labels_uptime')}</span>
					</div>
					<div class="flex gap-0.5 items-end" id="bar-cf"></div>
					<div class="flex justify-between mt-1">
						<span class="text-xs text-textSec">{t('availability_timeline_daysAgo')}</span>
						<span class="text-xs text-textSec">{t('availability_timeline_today')}</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Incidents + SLA -->
		<section class="grid grid-cols-3 gap-6">
			<!-- Incident Log -->
			<div class="col-span-2 bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center justify-between mb-5">
					<h3 class="text-lg font-semibold text-textMain">{t('availability_incidents_title')}</h3>
					<div class="flex gap-2">
						<button
							class="px-3 py-1 text-xs bg-[#1e293b] text-textMain rounded-lg border border-[#334155] font-medium"
							>{t('common_status_all')}</button
						>
						<button
							class="px-3 py-1 text-xs text-textSec hover:bg-[#1e293b] rounded-lg transition-colors"
							>{t('common_status_active')}</button
						>
						<button
							class="px-3 py-1 text-xs text-textSec hover:bg-[#1e293b] rounded-lg transition-colors"
							>{t('common_status_resolved')}</button
						>
					</div>
				</div>
				<div class="space-y-3">
					<!-- Active -->
					<div class="p-4 rounded-xl bg-[#1e293b]/60 border border-secondary/30">
						<div class="flex items-start gap-3">
							<div class="mt-1 flex-shrink-0">
								<span
									class="w-6 h-6 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center"
								>
									<i class="fa-solid fa-triangle-exclamation text-secondary text-xs"></i>
								</span>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex flex-wrap items-center justify-between gap-2">
									<div class="flex items-center gap-2">
										<span class="text-sm font-semibold text-textMain">Zvýšená latence Edge CDN</span>
										<span
											class="px-1.5 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full border border-secondary/20 font-medium"
											>Aktivní</span
										>
									</div>
									<span class="text-xs text-textSec">Dnes, 08:14</span>
								</div>
								<p class="text-xs text-textSec mt-1.5">
									Cloudflare edge uzly v regionu EU reportují zvýšenou latenci. Tým zkoumá příčinu.
								</p>
								<div class="flex items-center gap-4 mt-2">
									<span class="text-xs text-textSec"
										><i class="fa-solid fa-clock mr-1"></i>Trvá 2h 18m</span
									>
									<span class="text-xs text-textSec"
										><i class="fa-solid fa-cloud mr-1"></i>Cloudflare Edge</span
									>
								</div>
							</div>
						</div>
					</div>

					<!-- Resolved 1 -->
					<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex items-start gap-3">
							<div class="mt-1 flex-shrink-0">
								<span
									class="w-6 h-6 rounded-full bg-success/10 border border-success/30 flex items-center justify-center"
								>
									<i class="fa-solid fa-check text-success text-xs"></i>
								</span>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex flex-wrap items-center justify-between gap-2">
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium text-textSec line-through"
											>Backend API restart (500 errors)</span
										>
										<span
											class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full border border-success/20 font-medium"
											>Vyřešeno</span
										>
									</div>
									<span class="text-xs text-textSec">Včera, 22:45</span>
								</div>
								<p class="text-xs text-textSec mt-1.5">
									Instance crashla kvůli OOM. Automatický restart obnovil provoz za 43s.
								</p>
								<div class="flex items-center gap-4 mt-2">
									<span class="text-xs text-textSec"
										><i class="fa-solid fa-stopwatch mr-1"></i>Výpadek: 43s</span
									>
									<span class="text-xs text-textSec"
										><i class="fa-solid fa-server mr-1"></i>Fly.io Backend</span
									>
								</div>
							</div>
						</div>
					</div>

					<!-- Resolved 2 -->
					<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex items-start gap-3">
							<div class="mt-1 flex-shrink-0">
								<span
									class="w-6 h-6 rounded-full bg-success/10 border border-success/30 flex items-center justify-center"
								>
									<i class="fa-solid fa-check text-success text-xs"></i>
								</span>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex flex-wrap items-center justify-between gap-2">
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium text-textSec line-through"
											>Supabase DB connection pool exhausted</span
										>
										<span
											class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full border border-success/20 font-medium"
											>Vyřešeno</span
										>
									</div>
									<span class="text-xs text-textSec">20. 5., 16:02</span>
								</div>
								<p class="text-xs text-textSec mt-1.5">
									Pool připojení dosáhl limitu 100. Zvýšen limit a přidána queue pro čekající
									spojení.
								</p>
								<div class="flex items-center gap-4 mt-2">
									<span class="text-xs text-textSec"
										><i class="fa-solid fa-stopwatch mr-1"></i>Výpadek: 7m 12s</span
									>
									<span class="text-xs text-textSec"
										><i class="fa-solid fa-database mr-1"></i>Supabase DB</span
									>
								</div>
							</div>
						</div>
					</div>

					<!-- Resolved 3 -->
					<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
						<div class="flex items-start gap-3">
							<div class="mt-1 flex-shrink-0">
								<span
									class="w-6 h-6 rounded-full bg-success/10 border border-success/30 flex items-center justify-center"
								>
									<i class="fa-solid fa-check text-success text-xs"></i>
								</span>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex flex-wrap items-center justify-between gap-2">
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium text-textSec line-through"
											>Frontend deployment timeout</span
										>
										<span
											class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full border border-success/20 font-medium"
											>Vyřešeno</span
										>
									</div>
									<span class="text-xs text-textSec">15. 5., 11:30</span>
								</div>
								<p class="text-xs text-textSec mt-1.5">
									CI/CD pipeline se zasekla. Vyřešeno ručním triggernutím deploymentu.
								</p>
								<div class="flex items-center gap-4 mt-2">
									<span class="text-xs text-textSec"
										><i class="fa-solid fa-stopwatch mr-1"></i>Výpadek: 18m 5s</span
									>
									<span class="text-xs text-textSec"
										><i class="fa-solid fa-desktop mr-1"></i>Vercel Frontend</span
									>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- SLA + Quick Stats -->
			<div class="space-y-4">
				<!-- SLA Card -->
				<div class="bg-card border border-[#1e293b] rounded-xl p-5">
					<h3 class="text-base font-semibold text-textMain mb-4">{t('availability_sla_title')}</h3>
					<div class="space-y-4">
						<div>
							<div class="flex justify-between items-center mb-1.5">
								<span class="text-sm text-textSec">Frontend</span>
								<span class="text-sm font-semibold text-success">99.99%</span>
							</div>
							<div class="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full bg-success rounded-full" style="width:100%"></div>
							</div>
							<p class="text-xs text-textSec mt-1">Cíl: 99.9% ✓</p>
						</div>
						<div>
							<div class="flex justify-between items-center mb-1.5">
								<span class="text-sm text-textSec">Backend API</span>
								<span class="text-sm font-semibold text-success">99.95%</span>
							</div>
							<div class="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full bg-success rounded-full" style="width:99.95%"></div>
							</div>
							<p class="text-xs text-textSec mt-1">Cíl: 99.9% ✓</p>
						</div>
						<div>
							<div class="flex justify-between items-center mb-1.5">
								<span class="text-sm text-textSec">Databáze</span>
								<span class="text-sm font-semibold text-success">99.97%</span>
							</div>
							<div class="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full bg-success rounded-full" style="width:99.97%"></div>
							</div>
							<p class="text-xs text-textSec mt-1">Cíl: 99.5% ✓</p>
						</div>
						<div>
							<div class="flex justify-between items-center mb-1.5">
								<span class="text-sm text-textSec">Edge CDN</span>
								<span class="text-sm font-semibold text-secondary">99.82%</span>
							</div>
							<div class="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
								<div class="h-full bg-secondary rounded-full" style="width:99.82%"></div>
							</div>
							<p class="text-xs text-secondary mt-1">Cíl: 99.9% ✗ (pod cílem)</p>
						</div>
					</div>
				</div>

				<!-- Quick Stats -->
				<div class="bg-card border border-[#1e293b] rounded-xl p-5">
					<h3 class="text-base font-semibold text-textMain mb-4">{t('availability_quickStats_title')}</h3>
					<div class="space-y-3">
						<div class="flex justify-between items-center">
							<span class="text-sm text-textSec">{t('availability_quickStats_totalOutages')}</span>
							<span class="text-sm font-semibold text-textMain">8</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-textSec">{t('availability_quickStats_mttr')}</span>
							<span class="text-sm font-semibold text-textMain">6m 34s</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-textSec">{t('availability_quickStats_mtbf')}</span>
							<span class="text-sm font-semibold text-textMain">8.4 dní</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-textSec">{t('availability_quickStats_longestOutage')}</span>
							<span class="text-sm font-semibold text-error">18m 5s</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-textSec">{t('availability_quickStats_checkInterval')}</span>
							<span class="text-sm font-semibold text-textMain">60s</span>
						</div>
						<div class="h-px bg-[#1e293b] my-1"></div>
						<div class="flex justify-between items-center">
							<span class="text-sm text-textSec">{t('availability_quickStats_alertsSent')}</span>
							<span class="text-sm font-semibold text-textMain">12</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</div>

<!-- ===== MOBILE LAYOUT ===== -->
<div class="lg:hidden">
	<!-- Mobile page title in top bar is handled by layout; add page title below top bar -->
	<div class="px-4 pt-4 space-y-4">
		<div>
			<h1 class="text-xl font-bold text-textMain">{t('availability_header_title')}</h1>
			<p class="text-sm text-textSec mt-0.5">{t('availability_header_subtitleMobile')}</p>
		</div>

		<!-- Status Banner -->
		<div class="p-3 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center gap-3">
			<div
				class="w-8 h-8 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center flex-shrink-0"
			>
				<i class="fa-solid fa-triangle-exclamation text-secondary text-sm"></i>
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-sm font-semibold text-textMain">{t('availability_status_activeIncident')}</p>
				<p class="text-xs text-textSec truncate">Zvýšená latence Edge CDN · Trvá 2h 18m</p>
			</div>
			<i class="fa-solid fa-chevron-right text-textSec text-xs flex-shrink-0"></i>
		</div>

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
				<!-- Frontend -->
				<div class="bg-card border border-[#1e293b] rounded-xl p-4 relative overflow-hidden">
					<div class="absolute top-0 left-0 w-1 h-full bg-success rounded-l-xl"></div>
					<div class="pl-1">
						<div class="flex items-start justify-between mb-2">
							<div>
								<p class="text-xs text-textSec uppercase tracking-wider font-semibold leading-tight">
									Frontend
								</p>
								<p class="text-xs text-textSec">Vercel</p>
							</div>
							<span class="w-2 h-2 rounded-full bg-success animate-pulse mt-1 flex-shrink-0"></span>
						</div>
						<span class="text-2xl font-bold text-textMain">99.99<span class="text-base">%</span></span>
						<div class="mt-2 h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-success rounded-full" style="width:99.99%"></div>
						</div>
						<div class="flex justify-between mt-1.5">
							<span class="text-xs text-textSec">0 výpadků</span>
							<span class="text-xs text-success">↑ +0.01%</span>
						</div>
					</div>
				</div>

				<!-- Backend -->
				<div class="bg-card border border-[#1e293b] rounded-xl p-4 relative overflow-hidden">
					<div class="absolute top-0 left-0 w-1 h-full bg-success rounded-l-xl"></div>
					<div class="pl-1">
						<div class="flex items-start justify-between mb-2">
							<div>
								<p class="text-xs text-textSec uppercase tracking-wider font-semibold leading-tight">
									Backend
								</p>
								<p class="text-xs text-textSec">Fly.io</p>
							</div>
							<span class="w-2 h-2 rounded-full bg-success animate-pulse mt-1 flex-shrink-0"></span>
						</div>
						<span class="text-2xl font-bold text-textMain">99.95<span class="text-base">%</span></span>
						<div class="mt-2 h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-success rounded-full" style="width:99.95%"></div>
						</div>
						<div class="flex justify-between mt-1.5">
							<span class="text-xs text-textSec">2 výpadky</span>
							<span class="text-xs text-error">↓ -0.03%</span>
						</div>
					</div>
				</div>

				<!-- Database -->
				<div class="bg-card border border-[#1e293b] rounded-xl p-4 relative overflow-hidden">
					<div class="absolute top-0 left-0 w-1 h-full bg-success rounded-l-xl"></div>
					<div class="pl-1">
						<div class="flex items-start justify-between mb-2">
							<div>
								<p class="text-xs text-textSec uppercase tracking-wider font-semibold leading-tight">
									Databáze
								</p>
								<p class="text-xs text-textSec">Supabase</p>
							</div>
							<span class="w-2 h-2 rounded-full bg-success animate-pulse mt-1 flex-shrink-0"></span>
						</div>
						<span class="text-2xl font-bold text-textMain">99.97<span class="text-base">%</span></span>
						<div class="mt-2 h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-success rounded-full" style="width:99.97%"></div>
						</div>
						<div class="flex justify-between mt-1.5">
							<span class="text-xs text-textSec">1 výpadek</span>
							<span class="text-xs text-success">↑ +0.02%</span>
						</div>
					</div>
				</div>

				<!-- Edge CDN -->
				<div class="bg-card border border-[#1e293b] rounded-xl p-4 relative overflow-hidden">
					<div class="absolute top-0 left-0 w-1 h-full bg-secondary rounded-l-xl"></div>
					<div class="pl-1">
						<div class="flex items-start justify-between mb-2">
							<div>
								<p class="text-xs text-textSec uppercase tracking-wider font-semibold leading-tight">
									Edge CDN
								</p>
								<p class="text-xs text-textSec">Cloudflare</p>
							</div>
							<span class="w-2 h-2 rounded-full bg-secondary mt-1 flex-shrink-0"></span>
						</div>
						<span class="text-2xl font-bold text-textMain">99.82<span class="text-base">%</span></span>
						<div class="mt-2 h-1.5 w-full bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-secondary rounded-full" style="width:99.82%"></div>
						</div>
						<div class="flex justify-between mt-1.5">
							<span class="text-xs text-textSec">5 výpadků</span>
							<span class="text-xs text-error">↓ -0.08%</span>
						</div>
					</div>
				</div>
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
						<span class="w-2.5 h-0.5 bg-success inline-block rounded"></span
						><span class="text-textSec">FE</span>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="w-2.5 h-0.5 bg-[#3b82f6] inline-block rounded"></span
						><span class="text-textSec">API</span>
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
					<span class="text-xs text-textSec bg-[#1e293b] px-2 py-0.5 rounded-full">{t('availability_health_endpoints', { count: 5 })}</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs text-textSec">{t('availability_health_interval')}</span>
					<i
						class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {hcOpen
							? 'rotate-180'
							: ''}"
					></i>
				</div>
			</button>
			{#if hcOpen}
				<div class="px-4 pb-4 space-y-2">
					<div
						class="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 border border-[#334155]/40"
						style="min-height:52px"
					>
						<div class="flex items-center gap-3">
							<div class="w-2.5 h-2.5 rounded-full bg-success animate-pulse flex-shrink-0"></div>
							<div>
								<p class="text-sm font-medium text-textMain">/health</p>
								<p class="text-xs text-textSec">Backend API</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-success">200 OK</p>
							<p class="text-xs text-textSec">42ms</p>
						</div>
					</div>
					<div
						class="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 border border-[#334155]/40"
						style="min-height:52px"
					>
						<div class="flex items-center gap-3">
							<div class="w-2.5 h-2.5 rounded-full bg-success animate-pulse flex-shrink-0"></div>
							<div>
								<p class="text-sm font-medium text-textMain">/api/ping</p>
								<p class="text-xs text-textSec">Backend API</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-success">200 OK</p>
							<p class="text-xs text-textSec">18ms</p>
						</div>
					</div>
					<div
						class="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 border border-[#334155]/40"
						style="min-height:52px"
					>
						<div class="flex items-center gap-3">
							<div class="w-2.5 h-2.5 rounded-full bg-success animate-pulse flex-shrink-0"></div>
							<div>
								<p class="text-sm font-medium text-textMain">/ (root)</p>
								<p class="text-xs text-textSec">Frontend</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-success">200 OK</p>
							<p class="text-xs text-textSec">91ms</p>
						</div>
					</div>
					<div
						class="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 border border-secondary/20"
						style="min-height:52px"
					>
						<div class="flex items-center gap-3">
							<div class="w-2.5 h-2.5 rounded-full bg-secondary flex-shrink-0"></div>
							<div>
								<p class="text-sm font-medium text-textMain">/api/db-health</p>
								<p class="text-xs text-textSec">Supabase</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-secondary">200 OK</p>
							<p class="text-xs text-textSec">412ms</p>
						</div>
					</div>
					<div
						class="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/50 border border-[#334155]/40"
						style="min-height:52px"
					>
						<div class="flex items-center gap-3">
							<div class="w-2.5 h-2.5 rounded-full bg-success animate-pulse flex-shrink-0"></div>
							<div>
								<p class="text-sm font-medium text-textMain">CF Edge Check</p>
								<p class="text-xs text-textSec">Cloudflare</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-success">200 OK</p>
							<p class="text-xs text-textSec">8ms</p>
						</div>
					</div>
					<div class="pt-2 border-t border-[#1e293b] flex items-center justify-between">
						<span class="text-xs text-textSec">Posl. kontrola: před 12s</span>
						<button
							class="text-xs text-primary font-medium flex items-center gap-1 py-2 px-3"
							style="min-height:44px"
						>
							<i class="fa-solid fa-rotate-right"></i>Obnovit
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
				<h3 class="text-sm font-semibold text-textMain">Historie dostupnosti</h3>
				<div class="flex items-center gap-2">
					<span class="text-xs text-textSec">90 dní</span>
					<i
						class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {utOpen
							? 'rotate-180'
							: ''}"
					></i>
				</div>
			</button>
			{#if utOpen}
				<div class="px-4 pb-4">
					<div class="flex flex-wrap items-center gap-3 mb-4 text-xs text-textSec">
						<div class="flex items-center gap-1">
							<span class="w-2.5 h-2.5 rounded-sm bg-success inline-block"></span>Provoz
						</div>
						<div class="flex items-center gap-1">
							<span class="w-2.5 h-2.5 rounded-sm bg-secondary inline-block"></span>Degradace
						</div>
						<div class="flex items-center gap-1">
							<span class="w-2.5 h-2.5 rounded-sm bg-error inline-block"></span>Výpadek
						</div>
					</div>
					<div class="space-y-4">
						<div>
							<div class="flex items-center justify-between mb-1.5">
								<div class="flex items-center gap-1.5">
									<i class="fa-solid fa-desktop text-textSec text-xs"></i>
									<span class="text-xs font-medium text-textMain">Frontend</span>
								</div>
								<span class="text-xs font-semibold text-success">99.99%</span>
							</div>
							<div class="flex gap-px items-end w-full overflow-hidden h-5" id="bar-frontend-m"></div>
							<div class="flex justify-between mt-1">
								<span class="text-xs text-textSec">90d</span>
								<span class="text-xs text-textSec">dnes</span>
							</div>
						</div>
						<div>
							<div class="flex items-center justify-between mb-1.5">
								<div class="flex items-center gap-1.5">
									<i class="fa-solid fa-server text-textSec text-xs"></i>
									<span class="text-xs font-medium text-textMain">Backend API</span>
								</div>
								<span class="text-xs font-semibold text-success">99.95%</span>
							</div>
							<div class="flex gap-px items-end w-full overflow-hidden h-5" id="bar-backend-m"></div>
							<div class="flex justify-between mt-1">
								<span class="text-xs text-textSec">90d</span>
								<span class="text-xs text-textSec">dnes</span>
							</div>
						</div>
						<div>
							<div class="flex items-center justify-between mb-1.5">
								<div class="flex items-center gap-1.5">
									<i class="fa-solid fa-database text-textSec text-xs"></i>
									<span class="text-xs font-medium text-textMain">Databáze</span>
								</div>
								<span class="text-xs font-semibold text-success">99.97%</span>
							</div>
							<div class="flex gap-px items-end w-full overflow-hidden h-5" id="bar-db-m"></div>
							<div class="flex justify-between mt-1">
								<span class="text-xs text-textSec">90d</span>
								<span class="text-xs text-textSec">dnes</span>
							</div>
						</div>
						<div>
							<div class="flex items-center justify-between mb-1.5">
								<div class="flex items-center gap-1.5">
									<i class="fa-solid fa-cloud text-textSec text-xs"></i>
									<span class="text-xs font-medium text-textMain">Edge CDN</span>
								</div>
								<span class="text-xs font-semibold text-secondary">99.82%</span>
							</div>
							<div class="flex gap-px items-end w-full overflow-hidden h-5" id="bar-cf-m"></div>
							<div class="flex justify-between mt-1">
								<span class="text-xs text-textSec">90d</span>
								<span class="text-xs text-textSec">dnes</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</section>

		<!-- Incidents -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<div class="p-4 border-b border-[#1e293b] flex items-center justify-between">
				<h3 class="text-sm font-semibold text-textMain">Výpadky & Incidenty</h3>
				<div class="flex gap-1.5">
					<button
						class="px-2.5 py-1.5 text-xs bg-[#1e293b] text-textMain rounded-lg border border-[#334155] font-medium"
						style="min-height:36px">Všechny</button
					>
					<button
						class="px-2.5 py-1.5 text-xs text-textSec hover:bg-[#1e293b] rounded-lg transition-colors"
						style="min-height:36px">Aktivní</button
					>
					<button
						class="px-2.5 py-1.5 text-xs text-textSec hover:bg-[#1e293b] rounded-lg transition-colors"
						style="min-height:36px">Vyřešené</button
					>
				</div>
			</div>
			<div class="p-4 space-y-3">
				<div class="p-4 rounded-xl bg-[#1e293b]/60 border border-secondary/30">
					<div class="flex items-start gap-3">
						<div
							class="w-7 h-7 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center flex-shrink-0 mt-0.5"
						>
							<i class="fa-solid fa-triangle-exclamation text-secondary text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2 flex-wrap">
								<span class="text-sm font-semibold text-textMain leading-tight"
									>Zvýšená latence Edge CDN</span
								>
								<span
									class="px-1.5 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full border border-secondary/20 font-medium flex-shrink-0"
									>Aktivní</span
								>
							</div>
							<p class="text-xs text-textSec mt-1.5 leading-relaxed">
								Cloudflare edge uzly v regionu EU reportují zvýšenou latenci.
							</p>
							<div class="flex flex-wrap items-center gap-3 mt-2">
								<span class="text-xs text-textSec"><i class="fa-solid fa-clock mr-1"></i>2h 18m</span>
								<span class="text-xs text-textSec"
									><i class="fa-solid fa-cloud mr-1"></i>Cloudflare Edge</span
								>
								<span class="text-xs text-textSec">Dnes, 08:14</span>
							</div>
						</div>
					</div>
				</div>

				<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
					<div class="flex items-start gap-3">
						<div
							class="w-7 h-7 rounded-full bg-success/10 border border-success/30 flex items-center justify-center flex-shrink-0 mt-0.5"
						>
							<i class="fa-solid fa-check text-success text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2 flex-wrap">
								<span class="text-sm font-medium text-textSec line-through leading-tight"
									>Backend API restart (500 errors)</span
								>
								<span
									class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full border border-success/20 font-medium flex-shrink-0"
									>Vyřešeno</span
								>
							</div>
							<p class="text-xs text-textSec mt-1.5 leading-relaxed">OOM crash. Automatický restart za 43s.</p>
							<div class="flex flex-wrap items-center gap-3 mt-2">
								<span class="text-xs text-textSec"
									><i class="fa-solid fa-stopwatch mr-1"></i>43s</span
								>
								<span class="text-xs text-textSec"><i class="fa-solid fa-server mr-1"></i>Fly.io</span>
								<span class="text-xs text-textSec">Včera, 22:45</span>
							</div>
						</div>
					</div>
				</div>

				<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
					<div class="flex items-start gap-3">
						<div
							class="w-7 h-7 rounded-full bg-success/10 border border-success/30 flex items-center justify-center flex-shrink-0 mt-0.5"
						>
							<i class="fa-solid fa-check text-success text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2 flex-wrap">
								<span class="text-sm font-medium text-textSec line-through leading-tight"
									>Supabase DB pool exhausted</span
								>
								<span
									class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full border border-success/20 font-medium flex-shrink-0"
									>Vyřešeno</span
								>
							</div>
							<p class="text-xs text-textSec mt-1.5 leading-relaxed">
								Pool dosáhl limitu 100. Zvýšen limit + queue.
							</p>
							<div class="flex flex-wrap items-center gap-3 mt-2">
								<span class="text-xs text-textSec"
									><i class="fa-solid fa-stopwatch mr-1"></i>7m 12s</span
								>
								<span class="text-xs text-textSec"
									><i class="fa-solid fa-database mr-1"></i>Supabase</span
								>
								<span class="text-xs text-textSec">20. 5.</span>
							</div>
						</div>
					</div>
				</div>

				<div class="p-4 rounded-xl bg-[#1e293b]/40 border border-[#334155]/40">
					<div class="flex items-start gap-3">
						<div
							class="w-7 h-7 rounded-full bg-success/10 border border-success/30 flex items-center justify-center flex-shrink-0 mt-0.5"
						>
							<i class="fa-solid fa-check text-success text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2 flex-wrap">
								<span class="text-sm font-medium text-textSec line-through leading-tight"
									>Frontend deployment timeout</span
								>
								<span
									class="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full border border-success/20 font-medium flex-shrink-0"
									>Vyřešeno</span
								>
							</div>
							<p class="text-xs text-textSec mt-1.5 leading-relaxed">CI/CD pipeline se zasekla. Ruční deploy.</p>
							<div class="flex flex-wrap items-center gap-3 mt-2">
								<span class="text-xs text-textSec"
									><i class="fa-solid fa-stopwatch mr-1"></i>18m 5s</span
								>
								<span class="text-xs text-textSec"
									><i class="fa-solid fa-desktop mr-1"></i>Vercel</span
								>
								<span class="text-xs text-textSec">15. 5.</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- SLA Goals Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				class="w-full flex items-center justify-between p-4"
				style="min-height:52px"
				onclick={() => (slaOpen = !slaOpen)}
			>
				<h3 class="text-sm font-semibold text-textMain">SLA Cíle (tento měsíc)</h3>
				<i
					class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {slaOpen
						? 'rotate-180'
						: ''}"
				></i>
			</button>
			{#if slaOpen}
				<div class="px-4 pb-4 space-y-4">
					<div>
						<div class="flex justify-between items-center mb-1.5">
							<span class="text-sm text-textSec">Frontend</span>
							<span class="text-sm font-semibold text-success">99.99%</span>
						</div>
						<div class="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-success rounded-full" style="width:100%"></div>
						</div>
						<p class="text-xs text-textSec mt-1">Cíl: 99.9% ✓</p>
					</div>
					<div>
						<div class="flex justify-between items-center mb-1.5">
							<span class="text-sm text-textSec">Backend API</span>
							<span class="text-sm font-semibold text-success">99.95%</span>
						</div>
						<div class="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-success rounded-full" style="width:99.95%"></div>
						</div>
						<p class="text-xs text-textSec mt-1">Cíl: 99.9% ✓</p>
					</div>
					<div>
						<div class="flex justify-between items-center mb-1.5">
							<span class="text-sm text-textSec">Databáze</span>
							<span class="text-sm font-semibold text-success">99.97%</span>
						</div>
						<div class="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-success rounded-full" style="width:99.97%"></div>
						</div>
						<p class="text-xs text-textSec mt-1">Cíl: 99.5% ✓</p>
					</div>
					<div>
						<div class="flex justify-between items-center mb-1.5">
							<span class="text-sm text-textSec">Edge CDN</span>
							<span class="text-sm font-semibold text-secondary">99.82%</span>
						</div>
						<div class="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-secondary rounded-full" style="width:99.82%"></div>
						</div>
						<p class="text-xs text-secondary mt-1">Cíl: 99.9% ✗ (pod cílem)</p>
					</div>
				</div>
			{/if}
		</section>

		<!-- Quick Stats -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4 mb-24">
			<h3 class="text-sm font-semibold text-textMain mb-4">Rychlé statistiky</h3>
			<div class="grid grid-cols-2 gap-3">
				<div class="bg-[#1e293b]/50 rounded-xl p-3 text-center">
					<p class="text-2xl font-bold text-textMain">8</p>
					<p class="text-xs text-textSec mt-1">Výpadky (30d)</p>
				</div>
				<div class="bg-[#1e293b]/50 rounded-xl p-3 text-center">
					<p class="text-2xl font-bold text-textMain">6m 34s</p>
					<p class="text-xs text-textSec mt-1">MTTR průměr</p>
				</div>
				<div class="bg-[#1e293b]/50 rounded-xl p-3 text-center">
					<p class="text-2xl font-bold text-textMain">8.4d</p>
					<p class="text-xs text-textSec mt-1">MTBF průměr</p>
				</div>
				<div class="bg-[#1e293b]/50 rounded-xl p-3 text-center">
					<p class="text-2xl font-bold text-error">18m 5s</p>
					<p class="text-xs text-textSec mt-1">Nejdelší výpadek</p>
				</div>
				<div class="bg-[#1e293b]/50 rounded-xl p-3 text-center">
					<p class="text-2xl font-bold text-textMain">60s</p>
					<p class="text-xs text-textSec mt-1">Check interval</p>
				</div>
				<div class="bg-[#1e293b]/50 rounded-xl p-3 text-center">
					<p class="text-2xl font-bold text-textMain">12</p>
					<p class="text-xs text-textSec mt-1">Alerty odesláno</p>
				</div>
			</div>
		</section>
	</div>

	<!-- Mobile Bottom Navigation -->
	<nav
		class="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-[#1e293b] flex items-center justify-around px-2 py-2"
	>
		<a
			href="{base}/"
			class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-textMain transition-colors"
			style="min-width:52px;min-height:52px;justify-content:center"
		>
			<i class="fa-solid fa-gauge-high text-lg"></i>
			<span class="text-xs">Dashboard</span>
		</a>
		<a
			href="{base}/dostupnost"
			class="flex flex-col items-center gap-1 px-3 py-2 text-primary"
			style="min-width:52px;min-height:52px;justify-content:center"
		>
			<i class="fa-solid fa-server text-lg"></i>
			<span class="text-xs font-semibold">Dostupnost</span>
		</a>
		<a
			href="{base}/chyby"
			class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-textMain transition-colors"
			style="min-width:52px;min-height:52px;justify-content:center"
		>
			<i class="fa-solid fa-triangle-exclamation text-lg"></i>
			<span class="text-xs">Chyby</span>
		</a>
		<a
			href="{base}/performance"
			class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-textMain transition-colors"
			style="min-width:52px;min-height:52px;justify-content:center"
		>
			<i class="fa-solid fa-bolt text-lg"></i>
			<span class="text-xs">Perf.</span>
		</a>
		<a
			href="{base}/nastaveni"
			class="flex flex-col items-center gap-1 px-3 py-2 text-textSec hover:text-textMain transition-colors"
			style="min-width:52px;min-height:52px;justify-content:center"
		>
			<i class="fa-solid fa-gear text-lg"></i>
			<span class="text-xs">Více</span>
		</a>
	</nav>
</div>
