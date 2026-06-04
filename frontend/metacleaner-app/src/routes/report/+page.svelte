<script lang="ts">
	import '../layout.css';
	import { onMount } from 'svelte';
	import { currentLocale, initLocale, switchLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import {
		getReportDetail,
		type ReportDetail,
		type ReportFileDetail,
		type MetadataField,
		type ReportIconColor
	} from '$lib/repositories/reportRepository';
	import { getCurrentUser, type User } from '$lib/repositories/userRepository';
	import { getLanguages, type Language } from '$lib/repositories/languageRepository';

	let langDropdownOpen = $state(false);
	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);
	let langOptions = $state<Language[]>([]);
	let currentLangInfo = $derived(langOptions.find((l) => l.code === currentLocale) ?? langOptions[0]);
	let accordionOpen = $state<boolean[]>([]);
	let reportDetail = $state<ReportDetail | null>(null);
	let user = $state<User | null>(null);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	function setLang(lang: string) {
		switchLocale(lang);
		langDropdownOpen = false;
		hamburgerMenuOpen = false;
	}

	function toggleAccordion(index: number) {
		accordionOpen[index] = !accordionOpen[index];
	}

	let allOpen = $derived(accordionOpen.length > 0 && accordionOpen.every((v) => v));

	function toggleAll() {
		const next = !allOpen;
		accordionOpen = accordionOpen.map(() => next);
	}

	function handleClickOutside(e: MouseEvent) {
		const t = e.target as Element;
		if (!t.closest('#langDropdown')) langDropdownOpen = false;
		if (!t.closest('#userDropdown')) userDropdownOpen = false;
		if (!t.closest('#hamburgerDropdown')) hamburgerMenuOpen = false;
	}

	const iconColors: Record<ReportIconColor, { bg: string; border: string; text: string }> = {
		green: { bg: 'bg-brand-green/10', border: 'border-brand-green/20', text: 'text-brand-green' },
		blue: { bg: 'bg-brand-blue/10', border: 'border-brand-blue/20', text: 'text-brand-blue' },
		orange: { bg: 'bg-brand-orange/10', border: 'border-brand-orange/20', text: 'text-brand-orange' }
	};

	const fileBarColors: Record<ReportIconColor, string> = {
		green: 'from-brand-green to-green-400',
		blue: 'from-brand-blue to-blue-400',
		orange: 'from-brand-orange to-orange-400'
	};

	const chartStyles: Record<string, { dot: string; text: string; bar: string; icon: string; txKey: string }> = {
		GPS: { dot: 'bg-brand-red', text: 'text-brand-red', bar: 'bg-brand-red', icon: 'fa-location-dot', txKey: 'report.chart.gpsData' },
		EXIF: { dot: 'bg-brand-orange', text: 'text-brand-orange', bar: 'bg-brand-orange', icon: 'fa-camera', txKey: 'report.chart.exifData' },
		XMP: { dot: 'bg-brand-blue', text: 'text-brand-blue', bar: 'bg-brand-blue', icon: 'fa-tag', txKey: 'report.chart.xmpData' }
	};

	const metaSections = [
		{ key: 'gps' as const, icon: 'fa-location-dot', iconClass: 'text-brand-red', txKey: 'report.chart.gpsData' },
		{ key: 'exif' as const, icon: 'fa-camera', iconClass: 'text-brand-orange', txKey: 'report.chart.exifData' },
		{ key: 'xmp' as const, icon: 'fa-tag', iconClass: 'text-brand-blue', txKey: 'report.chart.xmpData' }
	];

	function getMetaFields(file: ReportFileDetail, key: 'gps' | 'exif' | 'xmp'): MetadataField[] {
		if (key === 'gps') return file.metadata.gpsFields;
		if (key === 'exif') return file.metadata.exifFields;
		return file.metadata.xmpFields;
	}

	async function loadData() {
		const [detail, currentUser, langs] = await Promise.all([getReportDetail(), getCurrentUser(), getLanguages()]);
		accordionOpen = detail.files.map((_, i) => i === 0);
		reportDetail = detail;
		user = currentUser;
		langOptions = langs;
	}

	onMount(() => {
		initLocale();
		document.addEventListener('click', handleClickOutside);
		loadData();
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<svelte:head>
	<title>{tx('report.meta.title')}</title>
</svelte:head>

<div class="flex flex-col min-h-screen bg-navy-main text-white font-sans">
	<!-- Navigation -->
	<nav
		class="w-full sticky lg:static top-0 bg-navy-main border-b border-gray-800/50 lg:border-0 z-50 no-print"
	>
		<div
			class="max-w-[1100px] mx-auto px-4 lg:px-6 py-4 lg:py-5 flex justify-between items-center"
		>
			<!-- Logo / Back -->
			<div class="flex items-center gap-2 lg:gap-3">
				<!-- Mobile: back arrow + logo -->
				<a
					href="/step5"
					class="flex lg:hidden w-9 h-9 rounded-lg bg-navy-lighter border border-gray-700 items-center justify-center text-text-muted"
				>
					<i class="fa-solid fa-arrow-left text-sm"></i>
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
					<span>{tx('report.nav.backToResults')}</span>
				</a>

				<div id="langDropdown" class="relative inline-block">
					<button
						onclick={() => (langDropdownOpen = !langDropdownOpen)}
						class="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-lighter border border-gray-700 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
					>
						<span>{currentLangInfo?.flag ?? ''}</span>
						<span>{currentLangInfo?.label ?? ''}</span>
						<i
							class="fa-solid fa-chevron-down text-text-muted text-xs ml-1 transition-transform"
							style="transform: {langDropdownOpen ? 'rotate(180deg)' : 'none'}"
						></i>
					</button>
					<div class="lang-dropdown-menu" class:open={langDropdownOpen} style="min-width:160px">
						{#each langOptions as lang}
							<div
								class="lang-option"
								class:active={currentLocale === lang.code}
								onclick={() => setLang(lang.code)}
								role="button"
								tabindex="0"
							>
								<span>{lang.flag}</span>
								{lang.name}
								{#if currentLocale === lang.code}
									<span class="lang-check"><i class="fa-solid fa-check text-xs"></i></span>
								{/if}
							</div>
						{/each}
					</div>
				</div>

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

			<!-- Mobile: user avatar -->
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
						<div class="px-4 py-2 border-b border-gray-700">
							<p class="text-[10px] text-text-muted uppercase tracking-wider mb-1">{tx('common.nav.language')}</p>
							<div class="flex flex-col gap-0.5">
								{#each langOptions as lang}
									<div
										class="lang-option rounded-lg"
										class:active={currentLocale === lang.code}
										onclick={() => setLang(lang.code)}
										role="button"
										tabindex="0"
									>
										<span>{lang.flag}</span>
										{lang.name}
										{#if currentLocale === lang.code}
											<span class="lang-check"><i class="fa-solid fa-check text-xs"></i></span>
										{/if}
									</div>
								{/each}
							</div>
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
	<main class="w-full max-w-[1100px] mx-auto px-4 lg:px-6 pb-24 flex flex-col gap-4 lg:gap-6 pt-4 lg:pt-0">

		<!-- Report Header -->
		<div class="fade-in-up flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 mb-0 lg:mb-2">
			<div class="flex items-center gap-3 lg:gap-4">
				<div
					class="w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-brand-blue/10 border-2 border-brand-blue/40 flex items-center justify-center flex-shrink-0"
				>
					<i class="fa-solid fa-file-lines text-brand-blue text-xl lg:text-3xl"></i>
				</div>
				<div>
					<h1 class="text-xl lg:text-3xl font-bold text-white leading-tight">{tx('report.header.title')}</h1>
					<p class="text-text-muted text-xs lg:text-sm mt-0.5 lg:mt-1">
						{#if reportDetail}
							<span class="hidden lg:inline">{tx('report.header.generated')} </span>{tx('report.header.generatedDesc', { date: reportDetail.date, files: reportDetail.filesProcessed, fields: reportDetail.fieldsRemoved })}
						{/if}
					</p>
				</div>
			</div>
			<!-- Mobile: full-width PDF button -->
			<button
				class="no-print lg:hidden w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-green text-white font-bold text-sm shadow-glow-green active:scale-95 transition-transform"
			>
				<i class="fa-solid fa-file-pdf"></i>
				<span>{tx('report.actions.downloadPdf')}</span>
			</button>
			<!-- Desktop: action buttons -->
			<div class="no-print hidden lg:flex items-center gap-3 self-start lg:self-auto">
				<button
					class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green text-white font-bold text-sm hover:bg-green-400 transition-all shadow-glow-green"
				>
					<i class="fa-solid fa-file-pdf"></i>
					<span>{tx('report.actions.downloadPdfShort')}</span>
				</button>
				<button
					onclick={() => window.print()}
					class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm hover:bg-gray-800 hover:text-white transition-all"
				>
					<i class="fa-solid fa-print"></i>
					<span class="hidden sm:inline">{tx('report.actions.print')}</span>
				</button>
			</div>
		</div>

		<!-- Report Meta Info Bar -->
		<div class="fade-in-up delay-1 bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card">
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
				<div class="flex flex-col gap-0.5 lg:gap-1">
					<p class="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{tx('report.meta.reportId')}</p>
					<p class="text-xs lg:text-sm font-mono text-white">{reportDetail?.reportId ?? ''}</p>
				</div>
				<div class="flex flex-col gap-0.5 lg:gap-1">
					<p class="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{tx('report.meta.cleaningDate')}</p>
					<p class="text-xs lg:text-sm font-semibold text-white">{reportDetail?.date ?? ''}</p>
				</div>
				<div class="flex flex-col gap-0.5 lg:gap-1">
					<p class="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{tx('report.meta.user')}</p>
					<p class="text-xs lg:text-sm font-semibold text-white truncate">{user?.email ?? ''}</p>
				</div>
				<div class="flex flex-col gap-0.5 lg:gap-1">
					<p class="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{tx('report.meta.status')}</p>
					<div class="flex items-center gap-1.5 lg:gap-2">
						<div class="w-2 h-2 rounded-full bg-brand-green flex-shrink-0"></div>
						<p class="text-xs lg:text-sm font-semibold text-brand-green">
							<span class="hidden lg:inline">{tx('report.meta.statusSuccess')}</span>
							<span class="inline lg:hidden">{tx('report.meta.statusSuccessMobile')}</span>
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Summary Stats -->
		<div class="fade-in-up delay-1 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1">
				<div class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mb-1 lg:mb-2">
					<i class="fa-solid fa-file-circle-check text-brand-green text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-white">{reportDetail?.filesProcessed ?? ''}</p>
				<p class="text-[11px] lg:text-xs text-text-muted leading-tight">{tx('report.stats.filesProcessed')}</p>
			</div>
			<div class="bg-navy-card rounded-2xl border border-brand-green/20 p-4 lg:p-5 shadow-card flex flex-col gap-1">
				<div class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mb-1 lg:mb-2">
					<i class="fa-solid fa-eraser text-brand-green text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-brand-green">{reportDetail?.fieldsRemoved ?? ''}</p>
				<p class="text-[11px] lg:text-xs text-text-muted leading-tight">{tx('report.stats.fieldsRemoved')}</p>
			</div>
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1">
				<div class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mb-1 lg:mb-2">
					<i class="fa-solid fa-location-dot text-brand-blue text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-brand-blue">{reportDetail?.gpsLocationsRemoved ?? ''}</p>
				<p class="text-[11px] lg:text-xs text-text-muted leading-tight">{tx('report.stats.gpsRemoved')}</p>
			</div>
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1">
				<div class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center mb-1 lg:mb-2">
					<i class="fa-solid fa-clock text-brand-orange text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-white">{reportDetail ? reportDetail.totalTimeSeconds + 's' : ''}</p>
				<p class="text-[11px] lg:text-xs text-text-muted leading-tight">{tx('report.stats.totalTime')}</p>
			</div>
		</div>

		<!-- Charts Section -->
		<div class="fade-in-up delay-2 grid grid-cols-1 lg:grid-cols-2 gap-4">

			<!-- Metadata Distribution -->
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 shadow-card">
				<h3 class="font-semibold text-base lg:text-lg text-white mb-0.5 lg:mb-1">{tx('report.chart.distributionTitle')}</h3>
				<p class="text-[11px] lg:text-xs text-text-muted mb-4">{tx('report.chart.distributionDesc')}</p>
				<!-- Legend grid -->
				<div class="grid grid-cols-3 gap-2 mb-4">
					{#each reportDetail?.chartData ?? [] as point}
						{@const style = chartStyles[point.label] ?? chartStyles.XMP}
						<div class="flex flex-col items-center gap-1 bg-navy-main/60 rounded-xl p-3 border border-gray-800">
							<div class="flex items-center gap-1 lg:gap-1.5 mb-1">
								<div class="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full {style.dot}"></div>
								<span class="text-[9px] lg:text-[10px] text-text-muted font-semibold uppercase">{point.label}</span>
							</div>
							<p class="text-lg lg:text-xl font-black {style.text}">{point.fields}</p>
							<p class="text-[9px] lg:text-[10px] text-text-muted">{tx('report.chart.fields')}</p>
						</div>
					{/each}
				</div>
				<!-- Bar breakdown -->
				<div class="flex flex-col gap-2.5">
					{#each reportDetail?.chartData ?? [] as point}
						{@const style = chartStyles[point.label] ?? chartStyles.XMP}
						<div>
							<div class="flex justify-between mb-1">
								<span class="text-xs text-text-muted flex items-center gap-1 lg:gap-1.5">
									<i class="fa-solid {style.icon} {style.text} text-[10px]"></i>{tx(style.txKey)}
								</span>
								<span class="text-xs font-bold {style.text}">{point.fields} {tx('report.chart.fields')} · {point.percentage}%</span>
							</div>
							<div class="w-full h-2 rounded-full bg-navy-main/80">
								<div class="h-2 rounded-full {style.bar}" style="width:{point.percentage}%"></div>
							</div>
						</div>
					{/each}
				</div>
				<div class="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
					<span class="text-xs text-text-muted">{tx('report.chart.totalRemoved')}</span>
					<span class="text-sm font-black text-white">{reportDetail?.fieldsRemoved ?? ''} {tx('report.chart.fields')}</span>
				</div>
			</div>

			<!-- Per-File Breakdown -->
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 shadow-card">
				<h3 class="font-semibold text-base lg:text-lg text-white mb-0.5 lg:mb-1">{tx('report.chart.perFileTitle')}</h3>
				<p class="text-[11px] lg:text-xs text-text-muted mb-3 lg:mb-4">{tx('report.chart.perFileDesc')}</p>
				<div class="flex flex-col gap-2.5 lg:gap-3">
					{#each reportDetail?.files ?? [] as file}
						{@const colors = iconColors[file.iconColor]}
						{@const barGrad = fileBarColors[file.iconColor]}
						<div class="bg-navy-main/60 rounded-xl p-3 border border-gray-800">
							<div class="flex items-center gap-2.5 lg:gap-3 mb-2">
								<div class="w-7 h-7 rounded-lg {colors.bg} {colors.border} flex items-center justify-center flex-shrink-0">
									<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} {colors.text} text-[11px]"></i>
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-xs font-semibold text-white truncate">{file.name}</p>
									<p class="text-[10px] text-text-muted">{file.format} · {file.device}</p>
								</div>
								<span class="text-sm font-black {file.iconColor === 'orange' ? 'text-brand-orange' : 'text-white'}">{file.fieldsRemoved}</span>
							</div>
							<div class="w-full h-1.5 lg:h-2 rounded-full bg-navy-card mb-2">
								<div class="h-1.5 lg:h-2 rounded-full bg-gradient-to-r {barGrad}" style="width:{file.barWidthPercent}%"></div>
							</div>
							<div class="flex gap-1.5 flex-wrap">
								<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red">GPS ×{file.metadata.gpsFields.length}</span>
								<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">EXIF ×{file.metadata.exifFields.length}</span>
								<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-brand-blue">XMP ×{file.metadata.xmpFields.length}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Detailed File Reports -->
		<div class="fade-in-up delay-3 lg:bg-navy-card lg:rounded-2xl lg:border lg:border-gray-800 lg:p-6 lg:shadow-card flex flex-col gap-3 lg:gap-4">
			<div class="flex items-center justify-between">
				<h3 class="font-semibold text-base lg:text-lg text-white">{tx('report.files.title')}</h3>
				<button
					onclick={toggleAll}
					class="text-xs text-brand-blue font-semibold flex items-center gap-1 py-2 px-3 rounded-lg bg-brand-blue/10 border border-brand-blue/20 hover:bg-brand-blue/20 transition-colors"
				>
					<i class="fa-solid fa-list text-[10px]"></i>
					{allOpen ? tx('report.files.collapseAll') : tx('report.files.expandAll')}
				</button>
			</div>

			{#if reportDetail}
				{#each reportDetail.files as file, i}
					{@const fColors = iconColors[file.iconColor]}
					<div class="rounded-xl border border-brand-green/20 bg-navy-card lg:bg-navy-main/60 overflow-hidden shadow-card lg:shadow-none">
						<button
							onclick={() => toggleAccordion(i)}
							class="w-full flex items-center gap-3 px-4 py-3.5 lg:py-4 text-left hover:bg-navy-lighter/30 transition-colors"
						>
							<div class="w-9 h-9 rounded-lg {fColors.bg} {fColors.border} flex items-center justify-center flex-shrink-0">
								<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} {fColors.text} text-sm"></i>
							</div>
							<div class="flex-1 min-w-0">
								<!-- Mobile layout -->
								<div class="flex items-center gap-2 mb-0.5 lg:hidden">
									<p class="text-sm font-semibold text-white truncate">{file.name}</p>
									<span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-navy-lighter text-text-muted flex-shrink-0">{file.extension}</span>
								</div>
								<p class="text-[10px] text-text-muted lg:hidden">{file.sizeMB} MB · {file.device} · <span class="text-white font-semibold">{file.fieldsRemoved} {tx('report.chart.fields')}</span></p>
								<!-- Desktop layout -->
								<p class="hidden lg:block text-sm font-semibold text-white truncate">{file.name}</p>
								<p class="hidden lg:block text-[11px] text-text-muted">{file.sizeMB} MB · {file.format} · {file.device} · {file.fieldsRemoved} {tx('report.chart.fields')} {tx('report.files.removed')}</p>
							</div>
							<div class="hidden lg:flex items-center gap-2 flex-shrink-0">
								<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-lighter text-text-muted">{file.extension}</span>
								{#if file.hasGps}
									<span class="text-[10px] px-2 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium">GPS</span>
								{/if}
								<div class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
									<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
								</div>
							</div>
							<!-- Mobile: GPS + check -->
							<div class="flex lg:hidden items-center gap-2 flex-shrink-0">
								{#if file.hasGps}
									<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium">GPS</span>
								{/if}
								<div class="w-5 h-5 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
									<i class="fa-solid fa-check text-brand-green text-[9px]"></i>
								</div>
							</div>
							<i
								class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform ml-1"
								style="transform: {accordionOpen[i] ? 'rotate(180deg)' : 'none'}"
							></i>
						</button>
						{#if accordionOpen[i]}
							<div class="border-t border-gray-800">
								<div class="p-4 flex flex-col gap-3">
									<div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
										{#each metaSections as section}
											{@const fields = getMetaFields(file, section.key)}
											<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
												<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
													<i class="fa-solid {section.icon} {section.iconClass}"></i> {tx(section.txKey)}
												</p>
												<div class="flex flex-col gap-1.5">
													{#each fields as field}
														{#if field.moreCount !== undefined}
															<div class="flex justify-between">
																<span class="text-xs text-text-muted">+ {field.moreCount} {tx('report.files.more')}</span>
																<span class="text-xs font-mono text-brand-red line-through">{tx('report.files.removed')}</span>
															</div>
														{:else}
															<div class="flex justify-between">
																<span class="text-xs text-text-muted">{field.label}</span>
																<span class="text-xs font-mono text-brand-red line-through">{field.value}</span>
															</div>
														{/if}
													{/each}
												</div>
											</div>
										{/each}
									</div>
									<div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-green/5 border border-brand-green/20">
										<i class="fa-solid fa-circle-check text-brand-green text-sm"></i>
										<p class="text-xs text-brand-green font-medium">{tx('report.chart.totalRemoved')}: <strong>{file.fieldsRemoved} {tx('report.files.metadataFields')}</strong> · {tx('report.files.safeToShare')}</p>
									</div>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			{/if}
		</div>

		<!-- Footer -->
		<div class="fade-in-up delay-4 text-center text-text-muted text-sm mt-4 lg:mt-8 pb-4">
			<p>{tx('common.footer.copyright')}</p>
		</div>
	</main>
</div>

<style>
	@media print {
		.no-print {
			display: none !important;
		}
	}
</style>
