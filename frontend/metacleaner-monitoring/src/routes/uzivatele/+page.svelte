<script lang="ts">
	import { onMount } from 'svelte';
	import { chartColors } from '$lib/theme/chartColors';
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';
	import {
		getUsers,
		getUserTabs,
		userStatusConfig,
		userRoleColors,
		type User,
		type UserTab
	} from '$lib/repositories/usersRepository';

	type TabKey = 'all' | 'online' | 'new' | 'inactive';

	const users = getUsers();
	const tabs = getUserTabs();

	let activeTab = $state<TabKey>('all');
	let searchOpen = $state(false);

	const filteredUsers = $derived(() => {
		if (activeTab === 'online') return users.filter((u: User) => u.status === 'online');
		if (activeTab === 'new') return users.slice(0, 4);
		if (activeTab === 'inactive') return users.filter((u: User) => u.status === 'offline');
		return users;
	});

	function switchTab(tab: TabKey) {
		activeTab = tab;
	}

	function toggleSearch() {
		searchOpen = !searchOpen;
	}

	onMount(() => {
		const Plotly = (window as any).Plotly;
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
			xaxis: { gridcolor: gridColor, linecolor: gridColor, tickcolor: 'transparent', tickfont: { color: textSec, size: 10 }, zeroline: false, showgrid: false },
			yaxis: { gridcolor: gridColor, linecolor: gridColor, tickcolor: 'transparent', tickfont: { color: textSec, size: 10 }, zeroline: false }
		};

		const mobileLayout = {
			...commonLayout,
			font: { ...commonLayout.font, size: 10 },
			margin: { t: 5, r: 8, b: 28, l: 36 },
			xaxis: { ...commonLayout.xaxis, tickfont: { color: textSec, size: 9 } },
			yaxis: { ...commonLayout.yaxis, tickfont: { color: textSec, size: 9 } }
		};

		// Registrations data
		const regValues = [22,31,18,28,45,38,52,29,35,41,27,48,33,56,44,38,29,51,37,42,31,58,47,39,28,44,62,35,48,67];
		const daysDesktop = regValues.map((_, i) => {
			const d = new Date(2024, 4, i + 1);
			return `${d.getDate()}.${d.getMonth() + 1}.`;
		});
		const daysMobile = regValues.map((_, i) => (i % 5 === 0 || i === 29 ? daysDesktop[i] : ''));

		// Sessions data (24h)
		const sessionValues = [45, 38, 28, 22, 19, 25, 62, 145, 210, 258, 285, 291, 274, 262, 248, 271, 290, 310, 285, 249, 221, 185, 148, 98];
		const hoursDesktop = sessionValues.map((_, i) => `${i}:00`);
		const hoursMobile = sessionValues.map((_, i) => (i % 4 === 0 ? `${i}:00` : ''));

		// Desktop charts
		const desktopReg = document.getElementById('chart-registrations-d');
		if (desktopReg) {
			Plotly.newPlot('chart-registrations-d', [{
				x: daysDesktop,
				y: regValues,
				type: 'bar',
				marker: { color: regValues.map((_, i) => i === 29 ? '#22c55e' : 'rgba(34,197,94,0.35)'), line: { width: 0 } },
				hovertemplate: '<b>%{x}</b><br>%{y} registrací<extra></extra>'
			}], { ...commonLayout }, chartConfig);
		}

		const desktopSess = document.getElementById('chart-sessions-d');
		if (desktopSess) {
			Plotly.newPlot('chart-sessions-d', [{
				x: hoursDesktop,
				y: sessionValues,
				type: 'scatter',
				mode: 'lines',
				line: { color: chartColors.blue, width: 2.5, shape: 'spline', smoothing: 0.8 },
				fill: 'tozeroy',
				fillcolor: 'rgba(59,130,246,0.1)',
				hovertemplate: '<b>%{x}</b><br>%{y} uživatelů<extra></extra>'
			}], { ...commonLayout }, chartConfig);
		}

		// Mobile charts
		const mobileReg = document.getElementById('chart-registrations-m');
		if (mobileReg) {
			Plotly.newPlot('chart-registrations-m', [{
				x: daysMobile,
				y: regValues,
				type: 'bar',
				marker: { color: regValues.map((_, i) => i === 29 ? '#22c55e' : 'rgba(34,197,94,0.35)'), line: { width: 0 } },
				hovertemplate: '<b>%{x}</b><br>%{y} registrací<extra></extra>'
			}], { ...mobileLayout }, chartConfig);
		}

		const mobileSess = document.getElementById('chart-sessions-m');
		if (mobileSess) {
			Plotly.newPlot('chart-sessions-m', [{
				x: hoursMobile,
				y: sessionValues,
				type: 'scatter',
				mode: 'lines',
				line: { color: chartColors.blue, width: 2.5, shape: 'spline', smoothing: 0.8 },
				fill: 'tozeroy',
				fillcolor: 'rgba(59,130,246,0.1)',
				hovertemplate: '<b>%{x}</b><br>%{y} uživatelů<extra></extra>'
			}], { ...mobileLayout }, chartConfig);
		}
	});
</script>

<!-- ===================== DESKTOP ===================== -->
<div class="hidden lg:flex flex-col min-h-screen">

	<!-- Desktop Header -->
	<header class="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-surface px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-textMain">{t('users_header_title')}</h1>
			<p class="text-sm text-textSec mt-1">{t('users_header_subtitle')}</p>
		</div>
		<div class="flex items-center gap-3">
			<div class="relative">
				<i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-textSec text-sm"></i>
				<input type="text" placeholder={t('users_search_placeholder')} class="pl-9 pr-4 py-2 bg-surface border border-border text-white text-sm rounded-lg focus:outline-none focus:border-primary w-64 placeholder-textSec" />
			</div>
			<button class="px-4 py-2 bg-surface hover:bg-surface-hover text-white rounded-lg text-sm font-medium transition-colors border border-border">
				<i class="fa-solid fa-download mr-2"></i>{t('common_actions_export')}
			</button>
		</div>
	</header>

	<div class="p-6 max-w-7xl mx-auto space-y-6 w-full">

		<!-- Stats Cards -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-start mb-4">
					<h3 class="text-textSec text-sm font-medium">{t('users_stats_totalUsers')}</h3>
					<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
						<i class="fa-solid fa-users text-primary text-sm"></i>
					</div>
				</div>
				<div class="text-3xl font-bold text-textMain">12 847</div>
				<div class="flex items-center gap-1 mt-2">
					<i class="fa-solid fa-arrow-trend-up text-success text-xs"></i>
					<span class="text-xs text-success">+8.4%</span>
					<span class="text-xs text-textSec ml-1">{t('users_stats_vsLastMonth')}</span>
				</div>
			</div>

			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-start mb-4">
					<h3 class="text-textSec text-sm font-medium">{t('users_stats_currentlyLoggedIn')}</h3>
					<div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
						<i class="fa-solid fa-circle-dot text-blue-400 text-sm"></i>
					</div>
				</div>
				<div class="text-3xl font-bold text-textMain">342</div>
				<div class="flex items-center gap-2 mt-2">
					<div class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
					<span class="text-xs text-textSec">{t('users_stats_activeSessionsNow')}</span>
				</div>
			</div>

			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-start mb-4">
					<h3 class="text-textSec text-sm font-medium">{t('users_stats_newRegistrations')}</h3>
					<div class="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
						<i class="fa-solid fa-user-plus text-secondary text-sm"></i>
					</div>
				</div>
				<div class="text-3xl font-bold text-textMain">1 024</div>
				<div class="flex items-center gap-1 mt-2">
					<i class="fa-solid fa-arrow-trend-up text-success text-xs"></i>
					<span class="text-xs text-success">+12.1%</span>
					<span class="text-xs text-textSec ml-1">{t('users_stats_vsPreviousPeriod')}</span>
				</div>
			</div>

			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-start mb-4">
					<h3 class="text-textSec text-sm font-medium">{t('users_stats_avgSessionDuration')}</h3>
					<div class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
						<i class="fa-solid fa-clock text-purple-400 text-sm"></i>
					</div>
				</div>
				<div class="text-3xl font-bold text-textMain">8m 24s</div>
				<div class="flex items-center gap-1 mt-2">
					<i class="fa-solid fa-arrow-trend-down text-error text-xs"></i>
					<span class="text-xs text-error">-1.2%</span>
					<span class="text-xs text-textSec ml-1">{t('users_stats_vsLastMonth')}</span>
				</div>
			</div>
		</section>

		<!-- Charts Row -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-center mb-6">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('users_charts_registrations')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('users_charts_registrationsSubtitle')}</p>
					</div>
					<span class="px-2.5 py-1 bg-badge rounded-md text-xs text-textSec border border-border">{t('common_timeRange_last30d')}</span>
				</div>
				<div id="chart-registrations-d" class="h-[220px] w-full"></div>
			</div>

			<div class="bg-card border border-surface rounded-xl p-5">
				<div class="flex justify-between items-center mb-6">
					<div>
						<h3 class="text-lg font-semibold text-textMain">{t('users_charts_activeSessions')}</h3>
						<p class="text-xs text-textSec mt-0.5">{t('users_charts_activeSessionsSubtitle')}</p>
					</div>
					<div class="flex items-center gap-2 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md">
						<div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
						<span class="text-xs text-blue-400 font-medium">Live</span>
					</div>
				</div>
				<div id="chart-sessions-d" class="h-[220px] w-full"></div>
			</div>
		</section>

		<!-- Tabs + Table -->
		<section class="bg-card border border-surface rounded-xl">
			<!-- Tab bar -->
			<div class="flex items-center justify-between px-5 pt-5 pb-0 border-b border-surface">
				<div class="flex gap-1">
					{#each tabs as tab (tab.key)}
						<button
							onclick={() => switchTab(tab.key)}
							class="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors {activeTab === tab.key ? 'text-textMain border-primary' : 'text-textSec border-transparent hover:text-textMain'}"
						>
							{t(tab.labelKey)}
							<span class="ml-2 px-2 py-0.5 text-xs rounded-full {activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-badge text-textSec'}">{tab.count}</span>
						</button>
					{/each}
				</div>
				<div class="flex items-center gap-2 pb-3">
					<button class="px-3 py-1.5 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors flex items-center gap-2">
						<i class="fa-solid fa-filter text-xs"></i> {t('common_actions_filter')}
					</button>
					<button class="px-3 py-1.5 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors flex items-center gap-2">
						<i class="fa-solid fa-sort text-xs"></i> {t('users_actions_sort')}
					</button>
				</div>
			</div>

			<!-- Table -->
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="text-left border-b border-surface">
							<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider">{t('users_table_user')}</th>
							<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider">{t('common_table_status')}</th>
							<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider hidden md:table-cell">{t('users_table_registered')}</th>
							<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider hidden lg:table-cell">{t('users_table_lastLogin')}</th>
							<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider hidden lg:table-cell">{t('users_table_sessions')}</th>
							<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider hidden xl:table-cell">{t('common_table_location')}</th>
							<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider">{t('common_table_role')}</th>
							<th class="px-5 py-3"></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-surface/50">
						{#each filteredUsers() as u (u.id)}
							{@const s = userStatusConfig[u.status]}
							{@const r = userRoleColors[u.role] ?? userRoleColors['Viewer']}
							<tr class="hover:bg-surface/30 transition-colors group">
								<td class="px-5 py-3.5">
									<div class="flex items-center gap-3">
										<div class="relative flex-shrink-0">
											<img src={u.avatar} alt={u.name} class="w-9 h-9 rounded-full object-cover border border-border" />
											<span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full {s.dot} border-2 border-card"></span>
										</div>
										<div>
											<div class="text-textMain font-medium text-sm">{u.name}</div>
											<div class="text-textSec text-xs">{u.email}</div>
										</div>
									</div>
								</td>
								<td class="px-5 py-3.5">
									<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium {s.bg} {s.text}">
										<span class="w-1.5 h-1.5 rounded-full {s.dot}"></span>
										{t(s.labelKey)}
									</span>
								</td>
								<td class="px-5 py-3.5 text-textSec text-xs hidden md:table-cell">{u.registered}</td>
								<td class="px-5 py-3.5 text-textSec text-xs hidden lg:table-cell">{u.lastLogin}</td>
								<td class="px-5 py-3.5 text-textMain text-xs font-medium hidden lg:table-cell">{u.sessions}</td>
								<td class="px-5 py-3.5 hidden xl:table-cell">
									<div class="flex items-center gap-1.5 text-xs text-textSec">
										<i class="fa-solid fa-location-dot text-[10px]"></i>
										{u.location}
									</div>
								</td>
								<td class="px-5 py-3.5">
									<span class="px-2.5 py-1 rounded-md text-xs font-medium {r}">{u.role}</span>
								</td>
								<td class="px-5 py-3.5 text-right">
									<button class="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-badge border border-border text-textSec text-xs rounded-md hover:text-textMain">
										<i class="fa-solid fa-ellipsis-h"></i>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			<div class="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-surface gap-3">
				<p class="text-sm text-textSec">{t('common_pagination_showing', { from: '1', to: '10', total: '12 847' })}</p>
				<div class="flex items-center gap-1">
					<button class="px-3 py-1.5 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors">
						<i class="fa-solid fa-chevron-left text-xs"></i>
					</button>
					<button class="px-3 py-1.5 bg-primary text-white text-sm rounded-lg font-medium">1</button>
					<button class="px-3 py-1.5 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors">2</button>
					<button class="px-3 py-1.5 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors">3</button>
					<span class="text-textSec px-1">…</span>
					<button class="px-3 py-1.5 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors">1285</button>
					<button class="px-3 py-1.5 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors">
						<i class="fa-solid fa-chevron-right text-xs"></i>
					</button>
				</div>
			</div>
		</section>

	</div>
</div>

<!-- ===================== MOBILE ===================== -->
<div class="flex flex-col lg:hidden min-h-screen pb-20">

	<!-- Mobile Top Header -->
	<header class="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-surface px-4 py-3 flex items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				<div class="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xs">M</div>
				<span class="text-base font-bold text-textMain tracking-tight">Monitorly</span>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<button onclick={toggleSearch} class="w-10 h-10 flex items-center justify-center rounded-lg bg-badge border border-border text-textSec hover:text-textMain transition-colors">
				<i class="fa-solid fa-search text-sm"></i>
			</button>
			<button class="w-10 h-10 flex items-center justify-center rounded-lg bg-badge border border-border text-textSec hover:text-textMain transition-colors">
				<i class="fa-solid fa-download text-sm"></i>
			</button>
		</div>
	</header>

	<!-- Expandable Search Bar -->
	{#if searchOpen}
		<div class="bg-background/95 backdrop-blur-md border-b border-surface px-4 py-3">
			<div class="relative">
				<i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-textSec text-sm"></i>
				<input type="text" placeholder={t('users_search_placeholder')} class="w-full pl-9 pr-10 py-3 bg-surface border border-border text-white text-sm rounded-xl focus:outline-none focus:border-primary placeholder-textSec" />
				<button onclick={toggleSearch} class="absolute right-3 top-1/2 -translate-y-1/2 text-textSec hover:text-textMain">
					<i class="fa-solid fa-xmark text-sm"></i>
				</button>
			</div>
		</div>
	{/if}

	<!-- Page Title -->
	<div class="px-4 pt-5 pb-2">
		<h1 class="text-xl font-bold text-textMain">{t('users_header_title')}</h1>
		<p class="text-xs text-textSec mt-0.5">{t('users_header_subtitle')}</p>
	</div>

	<!-- Main Content -->
	<div class="flex-1 px-4 space-y-4">

		<!-- Stats Cards — 2x2 Grid -->
		<section class="grid grid-cols-2 gap-3">
			<div class="bg-card border border-surface rounded-xl p-4">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-xs font-medium leading-tight">{t('users_stats_totalUsers')}</h3>
					<div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid fa-users text-primary text-xs"></i>
					</div>
				</div>
				<div class="text-2xl font-bold text-textMain">12 847</div>
				<div class="flex items-center gap-1 mt-1.5">
					<i class="fa-solid fa-arrow-trend-up text-success text-xs"></i>
					<span class="text-xs text-success font-medium">+8.4%</span>
				</div>
			</div>

			<div class="bg-card border border-surface rounded-xl p-4">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-xs font-medium leading-tight">{t('users_stats_currentlyLoggedIn')}</h3>
					<div class="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid fa-circle-dot text-blue-400 text-xs"></i>
					</div>
				</div>
				<div class="text-2xl font-bold text-textMain">342</div>
				<div class="flex items-center gap-1.5 mt-1.5">
					<div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
					<span class="text-xs text-textSec">{t('users_stats_liveNow')}</span>
				</div>
			</div>

			<div class="bg-card border border-surface rounded-xl p-4">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-xs font-medium leading-tight">{t('users_stats_newRegistrationsShort')}</h3>
					<div class="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid fa-user-plus text-secondary text-xs"></i>
					</div>
				</div>
				<div class="text-2xl font-bold text-textMain">1 024</div>
				<div class="flex items-center gap-1 mt-1.5">
					<i class="fa-solid fa-arrow-trend-up text-success text-xs"></i>
					<span class="text-xs text-success font-medium">+12.1%</span>
				</div>
			</div>

			<div class="bg-card border border-surface rounded-xl p-4">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-xs font-medium leading-tight">{t('users_stats_sessionDurationShort')}</h3>
					<div class="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid fa-clock text-purple-400 text-xs"></i>
					</div>
				</div>
				<div class="text-2xl font-bold text-textMain">8m 24s</div>
				<div class="flex items-center gap-1 mt-1.5">
					<i class="fa-solid fa-arrow-trend-down text-error text-xs"></i>
					<span class="text-xs text-error font-medium">-1.2%</span>
				</div>
			</div>
		</section>

		<!-- Registrations Chart -->
		<section class="bg-card border border-surface rounded-xl p-4">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-sm font-semibold text-textMain">{t('users_charts_registrations')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('common_timeRange_last30d')}</p>
				</div>
				<span class="px-2.5 py-1 bg-badge rounded-md text-xs text-textSec border border-border">{t('common_timeRange_last30d')}</span>
			</div>
			<div id="chart-registrations-m" class="h-[180px] w-full"></div>
		</section>

		<!-- Sessions Chart -->
		<section class="bg-card border border-surface rounded-xl p-4">
			<div class="flex justify-between items-center mb-4">
				<div>
					<h3 class="text-sm font-semibold text-textMain">{t('users_charts_activeSessions')}</h3>
					<p class="text-xs text-textSec mt-0.5">{t('users_charts_activeSessionsSubtitle')}</p>
				</div>
				<div class="flex items-center gap-2 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md">
					<div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
					<span class="text-xs text-blue-400 font-medium">Live</span>
				</div>
			</div>
			<div id="chart-sessions-m" class="h-[180px] w-full"></div>
		</section>

		<!-- User Card List -->
		<section class="bg-card border border-surface rounded-xl overflow-hidden">

			<!-- Tabs — horizontally scrollable -->
			<div class="border-b border-surface">
				<div class="flex overflow-x-auto px-3 pt-3 gap-1" style="-webkit-overflow-scrolling: touch; scrollbar-width: none;">
					{#each tabs as tab (tab.key)}
						<button
							onclick={() => switchTab(tab.key)}
							class="flex-shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap {activeTab === tab.key ? 'text-textMain border-primary' : 'text-textSec border-transparent hover:text-textMain'}"
						>
							{t(tab.labelKey)}
							<span class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full {activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-badge text-textSec'}">{tab.count}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Filter / Sort row -->
			<div class="flex items-center justify-between px-4 py-2.5 border-b border-surface/60">
				<p class="text-xs text-textSec">{t('common_pagination_showing', { from: '1', to: '10', total: '12 847' })}</p>
				<div class="flex items-center gap-2">
					<button class="flex items-center gap-1.5 px-3 py-1.5 bg-badge border border-border text-textSec text-xs rounded-lg hover:text-textMain transition-colors min-h-[36px]">
						<i class="fa-solid fa-filter text-xs"></i> {t('common_actions_filter')}
					</button>
					<button class="flex items-center gap-1.5 px-3 py-1.5 bg-badge border border-border text-textSec text-xs rounded-lg hover:text-textMain transition-colors min-h-[36px]">
						<i class="fa-solid fa-sort text-xs"></i> {t('users_actions_sort')}
					</button>
				</div>
			</div>

			<!-- User Cards -->
			<div class="divide-y divide-surface/50">
				{#each filteredUsers() as u (u.id)}
					{@const s = userStatusConfig[u.status]}
					{@const r = userRoleColors[u.role] ?? userRoleColors['Viewer']}
					<div class="flex items-center gap-3 px-4 py-3.5 hover:bg-surface/30 active:bg-surface/50 transition-colors min-h-[72px]">
						<div class="relative flex-shrink-0">
							<img src={u.avatar} alt={u.name} class="w-11 h-11 rounded-full object-cover border border-border" />
							<span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full {s.dot} border-2 border-card"></span>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between gap-2 mb-0.5">
								<span class="text-textMain font-semibold text-sm truncate">{u.name}</span>
								<span class="px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0 {r}">{u.role}</span>
							</div>
							<div class="text-textSec text-xs truncate mb-1">{u.email}</div>
							<div class="flex items-center gap-2">
								<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium {s.bg} {s.text}">
									<span class="w-1.5 h-1.5 rounded-full {s.dot}"></span>
									{t(s.labelKey)}
								</span>
								<span class="text-textSec text-xs">{u.lastLogin}</span>
								<span class="text-textSec text-xs ml-auto">
									<i class="fa-solid fa-location-dot text-[9px] mr-0.5"></i>{u.location.split(',')[0]}
								</span>
							</div>
						</div>
						<button class="w-9 h-9 flex items-center justify-center rounded-lg bg-badge border border-border text-textSec hover:text-white transition-colors flex-shrink-0 ml-1">
							<i class="fa-solid fa-ellipsis-vertical text-xs"></i>
						</button>
					</div>
				{/each}
			</div>

			<!-- Pagination -->
			<div class="flex items-center justify-between px-4 py-3 border-t border-surface">
				<button class="flex items-center gap-2 px-4 py-2 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors min-h-[44px]">
					<i class="fa-solid fa-chevron-left text-xs"></i>
					<span>{t('common_pagination_previous')}</span>
				</button>
				<div class="flex items-center gap-1">
					<button class="w-9 h-9 bg-primary text-white text-sm rounded-lg font-medium">1</button>
					<button class="w-9 h-9 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors">2</button>
					<button class="w-9 h-9 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors">3</button>
					<span class="text-textSec px-1 text-sm">…</span>
				</div>
				<button class="flex items-center gap-2 px-4 py-2 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors min-h-[44px]">
					<span>{t('common_pagination_next')}</span>
					<i class="fa-solid fa-chevron-right text-xs"></i>
				</button>
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
		<a href="{base}/uzivatele" class="flex flex-col items-center gap-1 px-3 py-1.5 text-primary min-w-[44px]">
			<i class="fa-solid fa-users text-base"></i>
			<span class="text-xs font-semibold">{t('layout_nav_users')}</span>
		</a>
		<a href="{base}/nastaveni" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-gear text-base"></i>
			<span class="text-xs">{t('layout_nav_settings')}</span>
		</a>
	</nav>
</div>
