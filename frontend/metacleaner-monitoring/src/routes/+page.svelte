<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import {
		getDashboardStats,
		getDashboardAlerts,
		getResponseTimeStat
	} from '$lib/repositories/dashboardRepository';

	const stats = getDashboardStats();
	const alerts = getDashboardAlerts();
	const rt = getResponseTimeStat();

	const uf = stats.find((s) => s.key === 'uptimeFrontend')!;
	const ub = stats.find((s) => s.key === 'uptimeBackend')!;
	const er = stats.find((s) => s.key === 'errorRate')!;
	const db = stats.find((s) => s.key === 'dbHealth')!;

	const severityConfig: Record<
		string,
		{ border: string; strip: string; dot: string; opacity: string }
	> = {
		error: {
			border: 'border-error/20 lg:border-border/50',
			strip: 'bg-error',
			dot: 'bg-error',
			opacity: ''
		},
		warning: {
			border: 'border-secondary/20 lg:border-border/50',
			strip: 'bg-secondary',
			dot: 'bg-secondary',
			opacity: ''
		},
		resolved: {
			border: 'border-border/30',
			strip: 'bg-success',
			dot: 'bg-success',
			opacity: 'opacity-75'
		}
	};

	onMount(() => {
		const Plotly = (window as any).Plotly;
		if (!Plotly) return;

		const chartConfig = {
			responsive: true,
			displayModeBar: false,
			displaylogo: false
		};

		const chartLayout = {
			margin: { t: 10, r: 10, b: 30, l: 40 },
			plot_bgcolor: 'transparent',
			paper_bgcolor: 'transparent',
			font: { color: chartColors.textSec, family: 'Inter, sans-serif' },
			xaxis: {
				showgrid: true,
				gridcolor: chartColors.surface,
				zeroline: false,
				tickfont: { size: 10 }
			},
			yaxis: {
				showgrid: true,
				gridcolor: chartColors.surface,
				zeroline: false,
				tickfont: { size: 10 }
			},
			showlegend: false,
			autosize: true
		};

		const xTime = Array.from({ length: 50 }, (_, i) => `10:${i < 10 ? '0' + i : i}`);

		// 1. Response Time chart
		const yResponse = Array.from({ length: 50 }, () => Math.random() * 50 + 200);
		yResponse[15] = 800;
		yResponse[35] = 600;
		Plotly.newPlot(
			'chart-response-time',
			[
				{
					x: xTime,
					y: yResponse,
					type: 'scatter',
					mode: 'lines',
					line: { color: chartColors.primary, width: 2, shape: 'spline', smoothing: 0.8 },
					fill: 'tozeroy',
					fillcolor: 'rgba(34, 197, 94, 0.1)'
				}
			],
			chartLayout,
			chartConfig
		);

		// 2. Errors chart
		const yErrors = Array.from({ length: 50 }, () =>
			Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0
		);
		Plotly.newPlot(
			'chart-errors',
			[
				{
					x: xTime,
					y: yErrors,
					type: 'bar',
					marker: { color: chartColors.error, cornerradius: 2 }
				}
			],
			chartLayout,
			chartConfig
		);

		// 3. Resources chart
		const yCpu = Array.from({ length: 50 }, () => Math.random() * 20 + 30);
		const yRam = Array.from({ length: 50 }, () => Math.random() * 10 + 60);
		Plotly.newPlot(
			'chart-resources',
			[
				{
					x: xTime,
					y: yCpu,
					name: 'CPU',
					type: 'scatter',
					mode: 'lines',
					line: { color: chartColors.blue, width: 2, shape: 'spline' },
					fill: 'tozeroy',
					fillcolor: 'rgba(59, 130, 246, 0.1)'
				},
				{
					x: xTime,
					y: yRam,
					name: 'RAM',
					type: 'scatter',
					mode: 'lines',
					line: { color: chartColors.purple, width: 2, shape: 'spline' },
					fill: 'tozeroy',
					fillcolor: 'rgba(139, 92, 246, 0.1)'
				}
			],
			chartLayout,
			chartConfig
		);

		// 4. DB Latency chart
		const yDbLat = Array.from({ length: 50 }, () => Math.random() * 10 + 40);
		Plotly.newPlot(
			'chart-db',
			[
				{
					x: xTime,
					y: yDbLat,
					type: 'scatter',
					mode: 'lines',
					line: { color: chartColors.secondary, width: 2, shape: 'spline' }
				}
			],
			chartLayout,
			chartConfig
		);

		const handleResize = () => {
			['chart-response-time', 'chart-errors', 'chart-resources', 'chart-db'].forEach((id) => {
				const el = document.getElementById(id);
				if (el) Plotly.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- Desktop sticky page header -->
<header
	class="hidden lg:flex sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-surface px-6 py-4 items-center justify-between gap-4"
>
	<div>
		<h1 class="text-2xl font-bold text-textMain">{t('dashboard_header_title')}</h1>
		<p class="text-sm text-textSec mt-1">{t('dashboard_header_subtitle')}</p>
	</div>
	<div class="flex items-center gap-3">
		<div
			class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium"
		>
			<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
			{t('common_status_allSystemsOperational')}
		</div>
		<button
			class="px-4 py-2 bg-surface hover:bg-surface-hover text-white rounded-lg text-sm font-medium transition-colors border border-border"
		>
			<i class="fa-solid fa-download mr-2"></i>{t('common_actions_export')}
		</button>
	</div>
</header>

<!-- Mobile page title area -->
<div class="lg:hidden p-4 space-y-3">
	<div>
		<h1 class="text-2xl font-bold text-textMain">{t('dashboard_header_titleMobile')}</h1>
		<p class="text-sm text-textSec mt-1">{t('dashboard_header_subtitleMobile')}</p>
	</div>
	<div
		class="flex items-center gap-2 px-3 py-2.5 bg-success/10 border border-success/20 rounded-xl text-success text-sm font-medium w-full"
	>
		<div class="w-2.5 h-2.5 rounded-full bg-success animate-pulse shrink-0"></div>
		{t('common_status_allSystemsOperational')}
	</div>
</div>

<!-- Main content -->
<div class="p-4 lg:p-6 max-w-7xl mx-auto space-y-5 lg:space-y-6">

	<!-- Quick Stats -->
	<section class="grid grid-cols-1 lg:grid-cols-4 gap-4">
		<!-- Uptime Frontend -->
		<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-5 shadow-sm">
			<div class="flex justify-between items-start mb-3 lg:mb-4">
				<h3 class="text-textSec text-sm font-medium">{t(uf.labelKey)}</h3>
				<i class="fa-solid {uf.icon} {uf.iconClass} bg-surface lg:bg-transparent p-2 lg:p-0 rounded-lg lg:rounded-none"></i>
			</div>
			<div class="flex items-end gap-2">
				<span class="text-3xl font-bold text-textMain tracking-tight">{uf.value}</span>
			</div>
			<div class="mt-3 lg:mt-2 h-1.5 lg:h-1 w-full bg-surface rounded-full overflow-hidden">
				<div class="h-full {uf.barClass} {uf.barWidth} rounded-full"></div>
			</div>
		</div>

		<!-- Uptime Backend -->
		<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-5 shadow-sm">
			<div class="flex justify-between items-start mb-3 lg:mb-4">
				<h3 class="text-textSec text-sm font-medium">{t(ub.labelKey)}</h3>
				<i class="fa-solid {ub.icon} {ub.iconClass} bg-surface lg:bg-transparent p-2 lg:p-0 rounded-lg lg:rounded-none"></i>
			</div>
			<div class="flex items-end gap-2">
				<span class="text-3xl font-bold text-textMain tracking-tight">{ub.value}</span>
			</div>
			<div class="mt-3 lg:mt-2 h-1.5 lg:h-1 w-full bg-surface rounded-full overflow-hidden">
				<div class="h-full {ub.barClass} {ub.barWidth} rounded-full"></div>
			</div>
		</div>

		<!-- Error Rate -->
		<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-5 shadow-sm">
			<div class="flex justify-between items-start mb-3 lg:mb-4">
				<h3 class="text-textSec text-sm font-medium">{t(er.labelKey)}</h3>
				<i class="fa-solid {er.icon} {er.iconClass}"></i>
			</div>
			<div class="flex items-end gap-2">
				<span class="text-3xl font-bold text-textMain tracking-tight">{er.value}</span>
				{#if er.trend}
					<span class="text-sm font-medium text-success mb-1 flex items-center bg-success/10 px-1.5 py-0.5 rounded lg:bg-transparent lg:px-0 lg:py-0">{er.trend}</span>
				{/if}
			</div>
			{#if er.subtextMobile}
				<p class="text-xs lg:text-sm text-textSec mt-2 lg:mt-2">{t(er.subtextMobile)}</p>
			{/if}
		</div>

		<!-- DB Health -->
		<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-5 shadow-sm">
			<div class="flex justify-between items-start mb-3 lg:mb-4">
				<h3 class="text-textSec text-sm font-medium">{t(db.labelKey)}</h3>
				<i class="fa-solid {db.icon} {db.iconClass} bg-surface lg:bg-transparent p-2 lg:p-0 rounded-lg lg:rounded-none"></i>
			</div>
			<div class="flex items-end gap-2">
				<span class="text-3xl font-bold text-success tracking-tight lg:text-textMain">{t('common_status_healthy')}</span>
			</div>
			<p class="text-xs lg:text-sm text-textSec mt-2 lg:mt-2">
				<span class="lg:hidden">{t(db.subtextMobile!)}</span>
				<span class="hidden lg:inline">{t(db.subtextDesktop!)}</span>
			</p>
		</div>
	</section>

	<!-- Charts Row 1: Response Time + Errors -->
	<section class="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
		<!-- Response Time -->
		<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-4 lg:p-5 shadow-sm">
			<div class="flex justify-between items-start lg:items-center mb-4 lg:mb-6">
				<div>
					<h3 class="text-base lg:text-lg font-semibold text-textMain">{t('dashboard_charts_responseTime')}</h3>
					<div class="flex items-baseline gap-1 mt-1 lg:hidden">
						<span class="text-2xl font-bold text-textMain">{rt.value}</span>
						<span class="text-sm text-textSec">{rt.unit} ({rt.percentile})</span>
					</div>
				</div>
				<span class="hidden lg:block text-2xl font-bold text-textMain"
					>{rt.value} <span class="text-sm text-textSec font-normal">{rt.unit}</span></span
				>
			</div>
			<div id="chart-response-time" class="h-[200px] lg:h-[250px] w-full"></div>
		</div>

		<!-- Errors -->
		<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-4 lg:p-5 shadow-sm">
			<div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 mb-4 lg:mb-6">
				<h3 class="text-base lg:text-lg font-semibold text-textMain">
					{t('dashboard_charts_errors')}
					<span class="hidden lg:inline">{t('dashboard_charts_errorsSuffix')}</span>
				</h3>
				<div class="relative lg:static">
					<select
						class="w-full lg:w-auto appearance-none bg-surface border border-border text-sm text-textMain rounded-xl lg:rounded-md px-4 lg:px-3 py-3 lg:py-1.5 pr-10 lg:pr-3 focus:outline-none touch-target lg:min-h-0"
					>
						<option>{t('common_status_all')}</option>
						<option>5xx</option>
						<option>{t('dashboard_filters_jsErrors')}</option>
					</select>
					<div
						class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-textSec lg:hidden"
					>
						<i class="fa-solid fa-chevron-down text-xs"></i>
					</div>
				</div>
			</div>
			<div id="chart-errors" class="h-[200px] lg:h-[250px] w-full"></div>
		</div>
	</section>

	<!-- Charts Row 2: Server Resources + DB -->
	<section class="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
		<!-- Server Resources -->
		<div class="bg-card border border-surface rounded-2xl lg:rounded-xl p-4 lg:p-5 shadow-sm">
			<div class="flex justify-between items-center mb-4 lg:mb-6">
				<h3 class="text-base lg:text-lg font-semibold text-textMain">{t('dashboard_charts_serverResources')}</h3>
				<div
					class="flex gap-4 text-sm bg-surface/50 lg:bg-transparent p-2 lg:p-0 rounded-lg lg:rounded-none"
				>
					<div class="flex items-center gap-2">
						<span class="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full lg:rounded bg-blue"></span>
						<span class="text-textMain lg:text-textSec font-medium lg:font-normal">CPU</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full lg:rounded bg-purple"></span>
						<span class="text-textMain lg:text-textSec font-medium lg:font-normal">RAM</span>
					</div>
				</div>
			</div>
			<div id="chart-resources" class="h-[200px] lg:h-[250px] w-full"></div>
		</div>

		<!-- DB Latency (desktop only) -->
		<div class="hidden lg:block bg-card border border-surface rounded-xl p-5">
			<div class="flex justify-between items-center mb-6">
				<h3 class="text-lg font-semibold text-textMain">{t('dashboard_charts_dbLatency')}</h3>
				<span class="px-2 py-1 bg-badge rounded text-xs text-textMain">Supabase</span>
			</div>
			<div id="chart-db" class="h-[250px] w-full"></div>
		</div>
	</section>

	<!-- Alerts / Incidents -->
	<section class="bg-card border border-surface rounded-2xl lg:rounded-xl p-4 lg:p-5 shadow-sm">
		<div class="flex justify-between items-center mb-4 lg:mb-6">
			<h3 class="text-base lg:text-lg font-semibold text-textMain">
				{t('dashboard_alerts_title')}
				<span class="hidden lg:inline">{t('dashboard_alerts_titleSuffix')}</span>
			</h3>
			<button class="text-sm font-medium text-textSec hover:text-textMain transition-colors">
				<span class="lg:hidden">{t('common_status_all')}</span>
				<span class="hidden lg:inline">{t('common_actions_showAll')}</span>
			</button>
		</div>

		<div class="space-y-3">
			{#each alerts as alert (alert.id)}
				{@const sc = severityConfig[alert.severity]}
				{#if alert.severity === 'resolved'}
					<div class="flex gap-3 lg:gap-4 p-3.5 lg:p-4 rounded-xl lg:rounded-lg bg-background border {sc.border} {sc.opacity}">
						<div class="w-1.5 h-1.5 rounded-full {sc.dot} mt-1.5 shrink-0"></div>
						<div class="flex-1 min-w-0">
							<div class="flex justify-between items-start gap-2 mb-1">
								<h4 class="text-textSec font-medium text-sm leading-tight truncate line-through">{alert.title}</h4>
								<span class="text-xs text-textSec whitespace-nowrap">
									<span class="lg:hidden">{alert.timeMobile}</span>
									<span class="hidden lg:inline">{alert.timeDesktop}</span>
								</span>
							</div>
							<p class="text-sm text-textSec line-clamp-1">
								<span class="lg:hidden">{alert.descriptionMobile}</span>
								<span class="hidden lg:inline">{alert.descriptionDesktop}</span>
							</p>
						</div>
					</div>
				{:else}
					<div class="flex gap-3 lg:gap-4 p-3.5 lg:p-4 rounded-xl lg:rounded-lg bg-surface/60 lg:bg-surface/50 border {sc.border} relative overflow-hidden">
						<div class="absolute left-0 top-0 bottom-0 w-1 {sc.strip} lg:hidden"></div>
						<div class="hidden lg:block w-2 h-2 rounded-full {sc.dot} mt-2 shrink-0"></div>
						<div class="flex-1 min-w-0">
							<div class="flex justify-between items-start gap-2 mb-1">
								<h4 class="text-textMain font-medium text-sm leading-tight truncate">{alert.title}</h4>
								<span class="text-xs text-textSec whitespace-nowrap bg-background lg:bg-transparent px-2 lg:px-0 py-0.5 lg:py-0 rounded-md lg:rounded-none">
									<span class="lg:hidden">{alert.timeMobile}</span>
									<span class="hidden lg:inline">{alert.timeDesktop}</span>
								</span>
							</div>
							<p class="text-sm text-textSec line-clamp-2">
								<span class="lg:hidden">{alert.descriptionMobile}</span>
								<span class="hidden lg:inline">{alert.descriptionDesktop}</span>
							</p>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</section>
</div>
