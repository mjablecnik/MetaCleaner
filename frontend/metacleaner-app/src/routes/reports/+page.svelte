<script lang="ts">
	import '../layout.css';
	import { onMount } from 'svelte';
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getCurrentUser, type User } from '$lib/repositories/userRepository';
	import { getReports, getSummaryStats, type Report, type ReportSummaryStats } from '$lib/repositories/reportRepository';

	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);
	let activeFilter = $state('all');
	let searchQuery = $state('');
	let showToast = $state(false);
	let toastMessage = $state('');
	let toastTimer: ReturnType<typeof setTimeout>;

	let user = $state<User | null>(null);
	let reports = $state<Report[]>([]);
	let stats = $state<ReportSummaryStats | null>(null);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	let filteredReports = $derived(
		reports.filter((r) => {
			if (activeFilter === 'image' && r.type !== 'image') return false;
			if (activeFilter === 'video' && r.type !== 'video') return false;
			if (activeFilter === 'gps' && !r.gps) return false;
			if (searchQuery) {
				const q = searchQuery.toLowerCase();
				const text = `${r.id} ${r.date} ${r.fileTypes} ${r.reportId}`.toLowerCase();
				if (!text.includes(q)) return false;
			}
			return true;
		})
	);

	function setFilter(type: string) {
		activeFilter = type;
	}

	function fileCountLabel(n: number): string {
		if (n === 1) return tx('reports.fileCount.one');
		if (n >= 2 && n <= 4) return tx('reports.fileCount.few', { count: n });
		return tx('reports.fileCount.many', { count: n });
	}

	function tagStyle(tag: string): string {
		if (tag === 'GPS') return 'bg-brand-red/10 border-brand-red/20 text-brand-red';
		if (tag === 'EXIF') return 'bg-brand-orange/10 border-brand-orange/20 text-brand-orange';
		if (tag === 'XMP') return 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue';
		return 'bg-navy-lighter text-text-muted';
	}

	function iconStyle(color: string): string {
		if (color === 'green') return 'bg-brand-green/10 border-brand-green/20 text-brand-green';
		if (color === 'orange') return 'bg-brand-orange/10 border-brand-orange/20 text-brand-orange';
		return 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue';
	}

	function downloadReport(id: string) {
		toastMessage = tx('reports.toast.downloading') + ' ' + id;
		showToast = true;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			showToast = false;
		}, 2500);
	}

	function handleClickOutside(e: MouseEvent) {
		const t = e.target as Element;
		if (!t.closest('#userDropdown')) userDropdownOpen = false;
		if (!t.closest('#hamburgerDropdown')) hamburgerMenuOpen = false;
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		getCurrentUser().then((u) => { user = u; });
		getReports().then((r) => { reports = r; });
		getSummaryStats().then((s) => { stats = s; });
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<svelte:head>
	<title>{tx('reports.meta.title')}</title>
</svelte:head>

<div class="flex flex-col min-h-screen bg-navy-main text-white font-sans">
	<!-- Navigation -->
	<nav
		class="w-full sticky lg:static top-0 bg-navy-main border-b border-gray-800/50 lg:border-0 z-50"
	>
		<div
			class="max-w-[1100px] mx-auto px-4 lg:px-6 py-4 lg:py-6 flex justify-between items-center"
		>
			<!-- Logo -->
			<div class="flex items-center gap-2 lg:gap-3">
				<!-- Mobile: back arrow -->
				<a
					href="/step5"
					class="flex lg:hidden w-8 h-8 rounded-lg bg-navy-lighter border border-gray-700 items-center justify-center text-text-muted"
				>
					<i class="fa-solid fa-arrow-left text-xs"></i>
				</a>
				<a href="/" class="flex items-center gap-2 lg:gap-3">
					<div
						class="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
					>
						<i class="fa-solid fa-shield-halved text-sm lg:text-xl"></i>
					</div>
					<span class="text-base lg:text-xl font-bold tracking-tight">{tx('common.brandName')}</span>
				</a>
			</div>

			<!-- Desktop right side -->
			<div class="hidden lg:flex items-center gap-3">
				<a
					href="/step5"
					class="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-lighter border border-gray-700 text-sm font-semibold text-text-muted hover:text-white hover:bg-gray-800 transition-colors"
				>
					<i class="fa-solid fa-arrow-left text-xs"></i>
					<span>{tx('reports.nav.backToCleaning')}</span>
				</a>

				<div id="userDropdown" class="relative inline-block">
					<button
						onclick={() => (userDropdownOpen = !userDropdownOpen)}
						class="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-navy-lighter border border-gray-700 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
					>
						<div
							class="w-7 h-7 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center"
						>
							<i class="fa-solid fa-user text-brand-blue text-xs"></i>
						</div>
						<span class="hidden md:block">{user?.name ?? ''}</span>
						<i
							class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform"
							style="transform: {userDropdownOpen ? 'rotate(180deg)' : 'none'}"
						></i>
					</button>
					<div class="lang-dropdown-menu" class:open={userDropdownOpen} style="min-width:200px">
						<div class="px-4 py-3 border-b border-gray-700">
							<p class="text-xs text-text-muted">{tx('common.nav.loggedInAs')}</p>
							<p class="text-sm font-semibold text-white mt-0.5">{user?.email ?? ''}</p>
						</div>
						<div class="lang-option" role="button" tabindex="0">
							<i class="fa-solid fa-gear text-text-muted text-sm"></i>
							<span>{tx('common.nav.settings')}</span>
						</div>
						<div class="lang-option" style="color:#ef4444" role="button" tabindex="0">
							<i class="fa-solid fa-right-from-bracket text-sm" style="color:#ef4444"></i>
							<span>{tx('common.nav.logout')}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Mobile hamburger -->
			<div id="hamburgerDropdown" class="flex lg:hidden items-center">
				<div class="relative inline-block">
					<button
						onclick={() => (hamburgerMenuOpen = !hamburgerMenuOpen)}
						class="w-10 h-10 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center"
					>
						<i class="fa-solid fa-user text-brand-blue text-sm"></i>
					</button>
					<div
						class="lang-dropdown-menu"
						class:open={hamburgerMenuOpen}
						style="min-width:220px"
					>
						<div class="px-4 py-3 border-b border-gray-700">
							<p class="text-xs text-text-muted">{tx('common.nav.loggedInAs')}</p>
							<p class="text-sm font-semibold text-white mt-0.5 truncate">{user?.email ?? ''}</p>
						</div>
						<div class="lang-option" role="button" tabindex="0">
							<i class="fa-solid fa-gear text-text-muted text-sm"></i>
							<span>{tx('common.nav.settings')}</span>
						</div>
						<div class="lang-option" style="color:#ef4444" role="button" tabindex="0">
							<i class="fa-solid fa-right-from-bracket text-sm" style="color:#ef4444"></i>
							<span>{tx('common.nav.logout')}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main -->
	<main
		class="w-full max-w-[1100px] mx-auto px-4 lg:px-6 pb-28 lg:pb-24 flex flex-col gap-4 lg:gap-6 mt-4 lg:mt-0"
	>
		<!-- Page Header -->
		<div
			class="fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-0 lg:mb-2"
		>
			<div class="flex items-center gap-3 lg:gap-4">
				<div
					class="w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-brand-blue/10 border-2 border-brand-blue/40 flex items-center justify-center flex-shrink-0"
				>
					<i class="fa-solid fa-clock-rotate-left text-brand-blue text-lg lg:text-3xl"></i>
				</div>
				<div>
					<h1 class="text-xl lg:text-3xl font-bold text-white leading-tight">
						{tx('reports.header.title')}
					</h1>
					<p class="text-text-muted text-xs lg:text-sm mt-0.5 lg:mt-1">
						<span class="hidden lg:inline">{tx('reports.header.subtitle')} · </span>{tx('reports.header.totalReports', { count: stats?.totalReports ?? 0 })}
					</p>
				</div>
			</div>
			<div class="flex items-center gap-3 self-start sm:self-auto">
				<a
					href="/"
					class="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl bg-brand-green text-white font-bold text-sm hover:bg-green-400 transition-all shadow-glow-green"
				>
					<i class="fa-solid fa-plus text-xs"></i>
					<span class="hidden sm:inline">{tx('reports.header.newCleaning')}</span>
					<span class="inline sm:hidden">{tx('reports.header.newShort')}</span>
				</a>
			</div>
		</div>

		<!-- Summary Stats -->
		<div class="fade-in-up delay-1 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
			<div
				class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1"
			>
				<div
					class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mb-1 lg:mb-2"
				>
					<i class="fa-solid fa-file-lines text-brand-blue text-sm lg:text-base"></i>
				</div>
				<p class="text-xl lg:text-2xl font-black text-white">{stats?.totalReports ?? 0}</p>
				<p class="text-[11px] lg:text-xs text-text-muted leading-tight">{tx('reports.stats.totalReports')}</p>
			</div>
			<div
				class="bg-navy-card rounded-2xl border border-brand-green/20 p-4 lg:p-5 shadow-card flex flex-col gap-1"
			>
				<div
					class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mb-1 lg:mb-2"
				>
					<i class="fa-solid fa-eraser text-brand-green text-sm lg:text-base"></i>
				</div>
				<p class="text-xl lg:text-2xl font-black text-brand-green">{stats?.fieldsRemoved.toLocaleString() ?? 0}</p>
				<p class="text-[11px] lg:text-xs text-text-muted leading-tight">
					<span class="hidden lg:inline">{tx('reports.stats.fieldsRemoved')}</span>
					<span class="inline lg:hidden">{tx('reports.stats.fieldsRemovedShort')}</span>
				</p>
			</div>
			<div
				class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1"
			>
				<div
					class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center mb-1 lg:mb-2"
				>
					<i class="fa-solid fa-file-circle-check text-brand-orange text-sm lg:text-base"></i>
				</div>
				<p class="text-xl lg:text-2xl font-black text-brand-orange">{stats?.filesProcessed ?? 0}</p>
				<p class="text-[11px] lg:text-xs text-text-muted leading-tight">{tx('reports.stats.filesProcessed')}</p>
			</div>
			<div
				class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1"
			>
				<div
					class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mb-1 lg:mb-2"
				>
					<i class="fa-solid fa-location-dot text-brand-red text-sm lg:text-base"></i>
				</div>
				<p class="text-xl lg:text-2xl font-black text-brand-red">{stats?.gpsRemoved ?? 0}</p>
				<p class="text-[11px] lg:text-xs text-text-muted leading-tight">
					<span class="hidden lg:inline">{tx('reports.stats.gpsRemoved')}</span>
					<span class="inline lg:hidden">{tx('reports.stats.gpsRemovedShort')}</span>
				</p>
			</div>
		</div>

		<!-- Filters & Search — Desktop -->
		<div
			class="fade-in-up delay-2 hidden lg:block bg-navy-card rounded-2xl border border-gray-800 p-4 shadow-card"
		>
			<div
				class="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between"
			>
				<div class="flex items-center gap-2 flex-wrap">
					<span class="text-xs text-text-muted font-semibold uppercase tracking-wider mr-1"
						>{tx('reports.filter.label')}</span
					>
					<button
						onclick={() => setFilter('all')}
						class="filter-btn text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-700 text-text-muted"
						class:active={activeFilter === 'all'}
					>{tx('reports.filter.all')}</button>
					<button
						onclick={() => setFilter('success')}
						class="filter-btn text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-700 text-text-muted"
						class:active={activeFilter === 'success'}
					>
						<i class="fa-solid fa-circle-check text-brand-green mr-1"></i>{tx('reports.filter.successful')}
					</button>
					<button
						onclick={() => setFilter('gps')}
						class="filter-btn text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-700 text-text-muted"
						class:active={activeFilter === 'gps'}
					>
						<i class="fa-solid fa-location-dot text-brand-red mr-1"></i>{tx('reports.filter.containedGps')}
					</button>
					<button
						onclick={() => setFilter('image')}
						class="filter-btn text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-700 text-text-muted"
						class:active={activeFilter === 'image'}
					>
						<i class="fa-solid fa-image text-brand-blue mr-1"></i>{tx('reports.filter.photos')}
					</button>
					<button
						onclick={() => setFilter('video')}
						class="filter-btn text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-700 text-text-muted"
						class:active={activeFilter === 'video'}
					>
						<i class="fa-solid fa-video text-brand-orange mr-1"></i>{tx('reports.filter.video')}
					</button>
				</div>
				<div class="relative w-full md:w-64">
					<i
						class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs"
					></i>
					<input
						bind:value={searchQuery}
						type="text"
						placeholder={tx('reports.search.placeholder')}
						class="w-full pl-8 pr-4 py-2 rounded-lg bg-navy-main border border-gray-700 text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-blue transition-colors"
					/>
				</div>
			</div>
		</div>

		<!-- Search — Mobile -->
		<div class="fade-in-up delay-2 lg:hidden relative">
			<i
				class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs"
			></i>
			<input
				bind:value={searchQuery}
				type="text"
				placeholder={tx('reports.search.placeholder')}
				class="w-full pl-9 pr-4 py-3 rounded-xl bg-navy-card border border-gray-700 text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-blue transition-colors"
			/>
		</div>

		<!-- Filters — Mobile scrollable pills -->
		<div class="fade-in-up delay-2 lg:hidden">
			<div class="filters-scroll">
				<button
					onclick={() => setFilter('all')}
					class="filter-btn text-xs font-semibold px-3 py-2 rounded-lg border border-gray-700 text-text-muted whitespace-nowrap"
					class:active={activeFilter === 'all'}
				>{tx('reports.filter.all')}</button>
				<button
					onclick={() => setFilter('success')}
					class="filter-btn text-xs font-semibold px-3 py-2 rounded-lg border border-gray-700 text-text-muted whitespace-nowrap"
					class:active={activeFilter === 'success'}
				>
					<i class="fa-solid fa-circle-check text-brand-green mr-1"></i>{tx('reports.filter.successful')}
				</button>
				<button
					onclick={() => setFilter('gps')}
					class="filter-btn text-xs font-semibold px-3 py-2 rounded-lg border border-gray-700 text-text-muted whitespace-nowrap"
					class:active={activeFilter === 'gps'}
				>
					<i class="fa-solid fa-location-dot text-brand-red mr-1"></i>{tx('reports.filter.containedGpsShort')}
				</button>
				<button
					onclick={() => setFilter('image')}
					class="filter-btn text-xs font-semibold px-3 py-2 rounded-lg border border-gray-700 text-text-muted whitespace-nowrap"
					class:active={activeFilter === 'image'}
				>
					<i class="fa-solid fa-image text-brand-blue mr-1"></i>{tx('reports.filter.photosShort')}
				</button>
				<button
					onclick={() => setFilter('video')}
					class="filter-btn text-xs font-semibold px-3 py-2 rounded-lg border border-gray-700 text-text-muted whitespace-nowrap"
					class:active={activeFilter === 'video'}
				>
					<i class="fa-solid fa-video text-brand-orange mr-1"></i>{tx('reports.filter.video')}
				</button>
			</div>
		</div>

		<!-- Reports Table — Desktop -->
		<div
			class="fade-in-up delay-3 hidden lg:block bg-navy-card rounded-2xl border border-gray-800 shadow-card overflow-hidden"
		>
			<!-- Table Header -->
			<div class="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
				<h3 class="font-semibold text-base text-white">{tx('reports.table.title')}</h3>
				<div class="flex items-center gap-2">
					<span class="text-xs text-text-muted"
						>{tx('reports.table.shown', { filtered: filteredReports.length, total: reports.length })}</span
					>
				</div>
			</div>
			<!-- Column Headers -->
			<div
				class="grid grid-cols-12 gap-2 px-6 py-3 border-b border-gray-800/60 bg-navy-main/40"
			>
				<div class="col-span-1 text-[10px] text-text-muted uppercase tracking-wider font-semibold">
					{tx('reports.table.id')}
				</div>
				<div
					class="col-span-3 text-[10px] text-text-muted uppercase tracking-wider font-semibold flex items-center gap-1"
				>
					{tx('reports.table.date')} <i class="fa-solid fa-sort sort-icon text-gray-600"></i>
				</div>
				<div
					class="col-span-2 text-[10px] text-text-muted uppercase tracking-wider font-semibold flex items-center gap-1"
				>
					{tx('reports.table.files')} <i class="fa-solid fa-sort sort-icon text-gray-600"></i>
				</div>
				<div
					class="col-span-2 text-[10px] text-text-muted uppercase tracking-wider font-semibold flex items-center gap-1"
				>
					{tx('reports.table.fields')} <i class="fa-solid fa-sort sort-icon text-gray-600"></i>
				</div>
				<div class="col-span-2 text-[10px] text-text-muted uppercase tracking-wider font-semibold">
					{tx('reports.table.tags')}
				</div>
				<div class="col-span-1 text-[10px] text-text-muted uppercase tracking-wider font-semibold">
					{tx('reports.table.status')}
				</div>
				<div
					class="col-span-1 text-[10px] text-text-muted uppercase tracking-wider font-semibold text-right"
				>
					{tx('reports.table.actions')}
				</div>
			</div>
			<!-- Table Body -->
			<div>
				{#each filteredReports as r}
					<div
						class="report-row grid grid-cols-12 gap-2 px-6 py-4 border-b border-gray-800/40 items-center last:border-0"
					>
						<div class="col-span-1">
							<span class="text-[10px] font-mono text-text-muted">{r.id}</span>
						</div>
						<div class="col-span-3">
							<p class="text-sm font-semibold text-white">{r.date}</p>
							<p class="text-[10px] text-text-muted">{r.time} · {r.duration}</p>
						</div>
						<div class="col-span-2 flex items-center gap-2">
							<div
								class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 {iconStyle(r.iconColor)}"
							>
								<i
									class="fa-solid {r.type === 'video' ? 'fa-video' : 'fa-file-lines'} text-[10px]"
								></i>
							</div>
							<div>
								<p class="text-xs font-semibold text-white">{fileCountLabel(r.fileCount)}</p>
								<p class="text-[10px] text-text-muted">{r.fileTypes}</p>
							</div>
						</div>
						<div class="col-span-2">
							<p
								class="text-sm font-bold {r.fieldsColor === 'orange'
									? 'text-brand-orange'
									: 'text-white'}">{r.fields}</p>
							<p class="text-[10px] text-text-muted">{tx('reports.table.fieldsRemoved')}</p>
						</div>
						<div class="col-span-2 flex flex-wrap gap-1">
							{#each r.tags as tag}
								<span
									class="text-[9px] px-1.5 py-0.5 rounded border font-semibold {tagStyle(tag)}"
									>{tag}</span
								>
							{/each}
						</div>
						<div class="col-span-1">
							<div class="flex items-center gap-1.5">
								<div class="w-2 h-2 rounded-full bg-brand-green flex-shrink-0"></div>
								<span class="text-[10px] text-brand-green font-semibold hidden lg:block">OK</span>
							</div>
						</div>
						<div class="col-span-1 flex items-center justify-end gap-1">
							<a
								href="/report"
								title={tx('reports.table.viewReport')}
								class="w-7 h-7 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center hover:bg-brand-blue/20 transition-colors"
							>
								<i class="fa-solid fa-eye text-brand-blue text-[10px]"></i>
							</a>
							<button
								onclick={() => downloadReport(r.reportId)}
								title={tx('reports.table.downloadPdf')}
								class="w-7 h-7 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center hover:bg-brand-green/20 transition-colors"
							>
								<i class="fa-solid fa-download text-brand-green text-[10px]"></i>
							</button>
						</div>
					</div>
				{/each}
				{#if filteredReports.length === 0}
					<div class="px-6 py-12 text-center">
						<i class="fa-solid fa-search text-text-muted text-2xl mb-3"></i>
						<p class="text-text-muted text-sm">{tx('reports.table.noResults')}</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Reports List — Mobile -->
		<div
			class="fade-in-up delay-3 lg:hidden flex flex-col gap-0 bg-navy-card rounded-2xl border border-gray-800 shadow-card overflow-hidden"
		>
			<div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
				<h3 class="font-semibold text-sm text-white">{tx('reports.table.title')}</h3>
				<span class="text-xs text-text-muted">{tx('reports.table.shown', { filtered: filteredReports.length, total: reports.length })}</span>
			</div>
			<div>
				{#each filteredReports as r, i}
					<div
						class="report-card px-4 py-3 {i < filteredReports.length - 1
							? 'border-b border-gray-800/50'
							: ''}"
					>
						<div class="flex items-start justify-between gap-2">
							<div class="flex items-start gap-3 flex-1 min-w-0">
								<div
									class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 {iconStyle(r.iconColor)}"
								>
									<i class="fa-solid {r.type === 'video' ? 'fa-video' : 'fa-image'} text-sm"></i>
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 flex-wrap">
										<span class="text-sm font-bold text-white">{r.date}</span>
										<span class="text-[10px] font-mono text-text-muted">{r.id}</span>
										<div class="w-2 h-2 rounded-full bg-brand-green flex-shrink-0"></div>
									</div>
									<p class="text-xs text-text-muted mt-0.5">
										{r.time} · {r.duration} · {fileCountLabel(r.fileCount)} · {r.fileTypes}
									</p>
									<div class="flex items-center gap-1.5 mt-2 flex-wrap">
										{#each r.tags as tag}
											<span
												class="text-[10px] px-1.5 py-0.5 rounded border font-semibold {tagStyle(tag)}"
												>{tag}</span
											>
										{/each}
										<span
											class="text-[10px] ml-1 {r.fieldsColor === 'orange'
												? 'text-brand-orange font-bold'
												: 'text-text-muted'}">{r.fields} {tx('reports.table.fieldsMobile')}</span
										>
									</div>
								</div>
							</div>
							<div class="flex flex-col gap-1.5 flex-shrink-0">
								<a
									href="/report"
									class="w-9 h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center"
								>
									<i class="fa-solid fa-eye text-brand-blue text-xs"></i>
								</a>
								<button
									onclick={() => downloadReport(r.reportId)}
									class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center"
								>
									<i class="fa-solid fa-download text-brand-green text-xs"></i>
								</button>
							</div>
						</div>
					</div>
				{/each}
				{#if filteredReports.length === 0}
					<div class="px-4 py-10 text-center">
						<i class="fa-solid fa-search text-text-muted text-xl mb-3"></i>
						<p class="text-text-muted text-sm">{tx('reports.table.noResults')}</p>
					</div>
				{/if}
			</div>
		</div>
	</main>

	<!-- Mobile Fixed Bottom CTA -->
	<div
		class="lg:hidden fixed bottom-0 left-0 right-0 px-4 py-4 z-40"
		style="background: linear-gradient(to top, #0a1628 70%, transparent);"
	>
		<a
			href="/"
			class="flex w-full py-4 rounded-2xl bg-brand-green text-white font-bold text-base shadow-glow-green items-center justify-center gap-2"
		>
			<i class="fa-solid fa-plus"></i>
			<span>{tx('reports.header.newCleaning')}</span>
		</a>
	</div>
</div>

<!-- Toast — Desktop (bottom-right) -->
<div class="toast-desktop" class:show={showToast}>
	<i class="fa-solid fa-circle-check text-brand-green"></i>
	<span class="text-sm font-semibold text-white">{toastMessage}</span>
</div>

<!-- Toast — Mobile (bottom-center) -->
<div class="toast-mobile" class:show={showToast}>
	<i class="fa-solid fa-circle-check text-brand-green"></i>
	<span class="text-sm font-semibold text-white">{toastMessage}</span>
</div>

<style>
	.report-row {
		transition: background 0.15s;
	}
	.report-row:hover {
		background: rgba(30, 41, 59, 0.5);
	}
	.report-card {
		transition: background 0.15s;
	}
	.report-card:active {
		background: rgba(30, 41, 59, 0.6);
	}
	.filter-btn {
		transition: all 0.15s;
	}
	.filter-btn.active {
		background: #3b82f6;
		color: #fff;
		border-color: #3b82f6;
	}
	.sort-icon {
		cursor: pointer;
		transition: color 0.15s;
	}
	.sort-icon:hover {
		color: #fff;
	}
	.filters-scroll {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding-bottom: 2px;
	}
	.filters-scroll::-webkit-scrollbar {
		display: none;
	}
	/* Toast desktop */
	.toast-desktop {
		display: none;
		position: fixed;
		bottom: 32px;
		right: 32px;
		z-index: 999;
		background: #111d33;
		border: 1px solid #22c55e;
		border-radius: 12px;
		padding: 14px 20px;
		align-items: center;
		gap: 12px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
		transform: translateY(100px);
		opacity: 0;
		transition: all 0.3s ease;
	}
	.toast-desktop.show {
		display: flex;
		transform: translateY(0);
		opacity: 1;
	}
	/* Toast mobile */
	.toast-mobile {
		display: none;
		position: fixed;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%) translateY(100px);
		z-index: 999;
		background: #111d33;
		border: 1px solid #22c55e;
		border-radius: 12px;
		padding: 12px 18px;
		align-items: center;
		gap: 10px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
		opacity: 0;
		transition: all 0.3s ease;
		white-space: nowrap;
	}
	.toast-mobile.show {
		display: flex;
		transform: translateX(-50%) translateY(0);
		opacity: 1;
	}
	@media (min-width: 1024px) {
		.toast-mobile {
			display: none !important;
		}
	}
	@media (max-width: 1023px) {
		.toast-desktop {
			display: none !important;
		}
	}
</style>
