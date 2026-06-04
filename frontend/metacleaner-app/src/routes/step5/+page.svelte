<script lang="ts">
	import '../layout.css';
	import { onMount } from 'svelte';
	import { currentLocale, switchLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getCurrentUser, type User } from '$lib/repositories/userRepository';
	import { getLanguages, type Language } from '$lib/repositories/languageRepository';
	import { getUploadedFiles, type UploadedFile } from '$lib/repositories/fileRepository';
	import { getResults, type ProcessingResults } from '$lib/repositories/processingRepository';

	let langDropdownOpen = $state(false);
	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);
	let metaAccordionOpen = $state(true);
	let activeMetaTab = $state<'before' | 'after'>('before');

	let langOptions = $state<Language[]>([]);
	let user = $state<User | null>(null);
	let uploadedFiles = $state<UploadedFile[]>([]);
	let results = $state<ProcessingResults | null>(null);

	let currentLangInfo = $derived(langOptions.find((l) => l.code === currentLocale) ?? langOptions[0]);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	function getFileById(id: string): UploadedFile | undefined {
		return uploadedFiles.find((f) => f.id === id);
	}

	function getFileIconStyle(file: UploadedFile): { bg: string; text: string; border: string } {
		if (file.type === 'video') return { bg: 'bg-brand-orange/10', text: 'text-brand-orange', border: 'border-brand-orange/20' };
		if (file.extension === 'PNG') return { bg: 'bg-brand-blue/10', text: 'text-brand-blue', border: 'border-brand-blue/20' };
		return { bg: 'bg-brand-green/10', text: 'text-brand-green', border: 'border-brand-green/20' };
	}

	function setLang(lang: string) {
		switchLocale(lang);
		langDropdownOpen = false;
		hamburgerMenuOpen = false;
	}

	function handleClickOutside(e: MouseEvent) {
		const t = e.target as Element;
		if (!t.closest('#langDropdown')) langDropdownOpen = false;
		if (!t.closest('#userDropdown')) userDropdownOpen = false;
		if (!t.closest('#hamburgerDropdown')) hamburgerMenuOpen = false;
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		getLanguages().then((langs) => { langOptions = langs; });
		getCurrentUser().then((u) => { user = u; });
		getUploadedFiles().then((files) => { uploadedFiles = files; });
		getResults().then((r) => { results = r; });
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<svelte:head>
	<title>{tx('step5.meta.title')}</title>
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
			<a href="/" class="flex items-center gap-2.5 lg:gap-3">
				<div
					class="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
				>
					<i class="fa-solid fa-shield-halved text-base lg:text-xl"></i>
				</div>
				<span class="text-lg lg:text-xl font-bold tracking-tight">{tx('common.brandName')}</span>
			</a>

			<!-- Desktop right side -->
			<div class="hidden lg:flex items-center gap-3">
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
						<div class="lang-option lang-option-danger" role="button" tabindex="0">
							<i class="fa-solid fa-right-from-bracket text-sm text-brand-red"></i>
							<span>{tx('common.nav.logout')}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Mobile hamburger -->
			<div id="hamburgerDropdown" class="flex lg:hidden items-center gap-2">
				<div class="relative inline-block">
					<button
						onclick={() => (hamburgerMenuOpen = !hamburgerMenuOpen)}
						class="flex items-center justify-center w-11 h-11 rounded-lg bg-navy-lighter border border-gray-700 text-white"
					>
						<i class="fa-solid {hamburgerMenuOpen ? 'fa-xmark' : 'fa-bars'} text-base"></i>
					</button>
					<div
						class="lang-dropdown-menu"
						class:open={hamburgerMenuOpen}
						style="min-width:220px"
					>
						<div class="px-4 py-3 border-b border-gray-700">
							<p class="text-xs text-text-muted">{tx('common.nav.loggedInAs')}</p>
							<p class="text-sm font-semibold text-white mt-0.5 truncate">
								{user?.email ?? ''}
							</p>
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
											<span class="lang-check"
												><i class="fa-solid fa-check text-xs"></i></span
											>
										{/if}
									</div>
								{/each}
							</div>
						</div>
						<div class="lang-option" role="button" tabindex="0">
							<i class="fa-solid fa-gear text-text-muted text-sm"></i>
							<span>{tx('common.nav.settings')}</span>
						</div>
						<div class="lang-option lang-option-danger" role="button" tabindex="0">
							<i class="fa-solid fa-right-from-bracket text-sm text-brand-red"></i>
							<span>{tx('common.nav.logout')}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main -->
	<main
		class="w-full max-w-[1100px] mx-auto px-4 lg:px-6 pb-8 lg:pb-24 flex flex-col gap-4 lg:gap-6 mt-4 lg:mt-0"
	>
		<!-- Success Header -->
		<div
			class="fade-in-up flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-0 lg:mb-2"
		>
			<div class="flex items-center gap-3 lg:gap-4">
				<div
					class="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-brand-green/10 border-2 border-brand-green/40 flex items-center justify-center check-pop flex-shrink-0"
				>
					<i class="fa-solid fa-circle-check text-brand-green text-2xl lg:text-3xl"></i>
				</div>
				<div>
					<h1 class="text-xl lg:text-3xl font-bold text-white leading-tight">
						{tx('step5.header.title')}
					</h1>
					<p class="text-text-muted text-xs lg:text-sm mt-0.5 lg:mt-1">
						<span class="hidden lg:inline"
							>{tx('step5.header.descriptionDesktop', { count: results?.filesProcessed ?? 4 })}</span
						>
						<span class="inline lg:hidden">{tx('step5.header.descriptionMobile', { count: results?.filesProcessed ?? 4 })}</span>
					</p>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<a
					href="/"
					class="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue font-semibold text-sm hover:bg-brand-blue/20 transition-all"
				>
					<i class="fa-solid fa-arrow-up-from-bracket"></i>
					<span>{tx('step5.actions.uploadNew')}</span>
				</a>
				<div
					class="flex items-center gap-2 bg-brand-green/10 border border-brand-green/30 rounded-xl px-4 py-2.5"
				>
					<div class="w-2 h-2 rounded-full bg-brand-green"></div>
					<span class="text-xs font-semibold text-brand-green">{tx('step5.badge.success')}</span>
				</div>
			</div>
		</div>

		<!-- Summary Stats Row -->
		<div class="fade-in-up delay-1 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1">
				<div
					class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mb-1.5 lg:mb-2"
				>
					<i class="fa-solid fa-file-circle-check text-brand-green text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-white">{results?.filesProcessed ?? 4}</p>
				<p class="text-[11px] lg:text-xs text-text-muted">{tx('step5.stats.filesProcessed')}</p>
			</div>
			<div
				class="bg-navy-card rounded-2xl border border-brand-green/20 p-4 lg:p-5 shadow-card flex flex-col gap-1"
			>
				<div
					class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mb-1.5 lg:mb-2"
				>
					<i class="fa-solid fa-eraser text-brand-green text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-brand-green">{results?.fieldsRemoved ?? 87}</p>
				<p class="text-[11px] lg:text-xs text-text-muted">{tx('step5.stats.fieldsRemoved')}</p>
			</div>
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1">
				<div
					class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mb-1.5 lg:mb-2"
				>
					<i class="fa-solid fa-location-dot text-brand-blue text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-brand-blue">{results?.gpsLocationsRemoved ?? 3}</p>
				<p class="text-[11px] lg:text-xs text-text-muted">{tx('step5.stats.gpsRemoved')}</p>
			</div>
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1">
				<div
					class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center mb-1.5 lg:mb-2"
				>
					<i class="fa-solid fa-clock text-brand-orange text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-white">{results?.totalTimeSeconds ?? 28}s</p>
				<p class="text-[11px] lg:text-xs text-text-muted">{tx('step5.stats.totalTime')}</p>
			</div>
		</div>

		<!-- Metadata Overview — Desktop (side-by-side panels) -->
		<div
			class="fade-in-up delay-2 hidden lg:block bg-navy-card rounded-2xl border border-gray-800 p-6 shadow-card"
		>
			<h3 class="font-semibold text-lg text-white mb-6">{tx('step5.metadata.title')}</h3>
			<div class="grid grid-cols-2 gap-6">
				<!-- Before -->
				<div
					class="bg-navy-main/60 rounded-2xl border border-brand-red/40 p-6 flex flex-col gap-4"
				>
					<div class="flex items-center gap-3 mb-2">
						<div
							class="w-10 h-10 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red"
						>
							<i class="fa-solid fa-triangle-exclamation"></i>
						</div>
						<div>
							<span class="text-xs font-bold uppercase tracking-wider text-brand-red"
								>{tx('step5.metadata.before')}</span
							>
							<p class="text-sm font-semibold text-white">{tx('step5.metadata.beforeDesc')}</p>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-location-dot text-brand-red"></i> {tx('step5.metadata.gps')}</span
							>
							<span class="text-xs font-mono text-white">{tx('step5.metadata.filesCount', { count: results?.beforeBreakdown.gpsLocations ?? 3 })}</span>
						</div>
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-camera text-brand-red"></i> {tx('step5.metadata.exif')}</span
							>
							<span class="text-xs font-mono text-white">{tx('step5.metadata.fieldsCount', { count: results?.beforeBreakdown.exifFields ?? 52 })}</span>
						</div>
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-tag text-brand-red"></i> {tx('step5.metadata.xmp')}</span
							>
							<span class="text-xs font-mono text-white">{tx('step5.metadata.fieldsCount', { count: results?.beforeBreakdown.xmpFields ?? 19 })}</span>
						</div>
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-ellipsis text-brand-red"></i> {tx('step5.metadata.other')}</span
							>
							<span class="text-xs font-mono text-white">{tx('step5.metadata.fieldsCount', { count: results?.beforeBreakdown.otherFields ?? 13 })}</span>
						</div>
					</div>
					<p class="text-xs text-brand-red/80 flex items-center gap-2 mt-1">
						<i class="fa-solid fa-circle-exclamation"></i> {tx('step5.metadata.totalExposed', { count: results?.fieldsRemoved ?? 87 })}
					</p>
				</div>
				<!-- After -->
				<div
					class="bg-navy-main/60 rounded-2xl border border-brand-green/40 p-6 flex flex-col gap-4"
				>
					<div class="flex items-center gap-3 mb-2">
						<div
							class="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green"
						>
							<i class="fa-solid fa-shield-halved"></i>
						</div>
						<div>
							<span class="text-xs font-bold uppercase tracking-wider text-brand-green"
								>{tx('step5.metadata.after')}</span
							>
							<p class="text-sm font-semibold text-white">{tx('step5.metadata.afterDesc')}</p>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-location-dot text-brand-green"></i> {tx('step5.metadata.gps')}</span
							>
							<span class="text-xs font-mono text-brand-green flex items-center gap-1"
								><i class="fa-solid fa-check"></i> {tx('step5.metadata.removed')}</span
							>
						</div>
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-camera text-brand-green"></i> {tx('step5.metadata.exif')}</span
							>
							<span class="text-xs font-mono text-brand-green flex items-center gap-1"
								><i class="fa-solid fa-check"></i> {tx('step5.metadata.removed')}</span
							>
						</div>
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-tag text-brand-green"></i> {tx('step5.metadata.xmp')}</span
							>
							<span class="text-xs font-mono text-brand-green flex items-center gap-1"
								><i class="fa-solid fa-check"></i> {tx('step5.metadata.removed')}</span
							>
						</div>
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-ellipsis text-brand-green"></i> {tx('step5.metadata.other')}</span
							>
							<span class="text-xs font-mono text-brand-green flex items-center gap-1"
								><i class="fa-solid fa-check"></i> {tx('step5.metadata.removed')}</span
							>
						</div>
					</div>
					<p class="text-xs text-brand-green/80 flex items-center gap-2 mt-1">
						<i class="fa-solid fa-circle-check"></i> {tx('step5.metadata.allClean')}
					</p>
				</div>
			</div>
		</div>

		<!-- Metadata Overview — Mobile (accordion with tabs) -->
		<div
			class="fade-in-up delay-2 lg:hidden bg-navy-card rounded-2xl border border-gray-800 shadow-card overflow-hidden"
		>
			<button
				onclick={() => (metaAccordionOpen = !metaAccordionOpen)}
				class="w-full flex items-center justify-between px-5 py-4 min-h-[52px]"
			>
				<span class="font-semibold text-base text-white">{tx('step5.metadata.title')}</span>
				<i
					class="fa-solid fa-chevron-down text-text-muted text-sm transition-transform"
					style="transform: {metaAccordionOpen ? 'rotate(180deg)' : ''}"
				></i>
			</button>
			{#if metaAccordionOpen}
				<div class="flex flex-col gap-4 px-4 pb-5">
					<!-- Tabs -->
					<div class="flex rounded-xl bg-navy-main/60 p-1 gap-1">
						<button
							onclick={() => (activeMetaTab = 'before')}
							class="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
							style={activeMetaTab === 'before'
								? 'color:#ef4444;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3)'
								: 'color:#94a3b8;background:transparent;border:1px solid transparent'}
						>
							<i class="fa-solid fa-triangle-exclamation mr-1"></i> {tx('step5.metadata.before')}
						</button>
						<button
							onclick={() => (activeMetaTab = 'after')}
							class="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
							style={activeMetaTab === 'after'
								? 'color:#22c55e;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3)'
								: 'color:#94a3b8;background:transparent;border:1px solid transparent'}
						>
							<i class="fa-solid fa-shield-halved mr-1"></i> {tx('step5.metadata.after')}
						</button>
					</div>

					<!-- Before Panel -->
					{#if activeMetaTab === 'before'}
						<div class="flex flex-col gap-2">
							<p class="text-xs text-white font-semibold mb-1">{tx('step5.metadata.beforeDesc')}</p>
							<div
								class="flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 rounded-xl px-3 py-2.5 mb-1"
							>
								<i
									class="fa-solid fa-circle-exclamation text-brand-red text-sm flex-shrink-0"
								></i>
								<p class="text-xs text-brand-red/90 font-medium">
									{tx('step5.metadata.highRiskWarning', { count: results?.fieldsRemoved ?? 87 })}
								</p>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-location-dot text-brand-red"></i> {tx('step5.metadata.gps')}</span
								>
								<span class="text-xs font-mono text-white">{tx('step5.metadata.filesCount', { count: results?.beforeBreakdown.gpsLocations ?? 3 })}</span>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-camera text-brand-red"></i> {tx('step5.metadata.exif')}</span
								>
								<span class="text-xs font-mono text-white">{tx('step5.metadata.fieldsCount', { count: results?.beforeBreakdown.exifFields ?? 52 })}</span>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-tag text-brand-red"></i> {tx('step5.metadata.xmp')}</span
								>
								<span class="text-xs font-mono text-white">{tx('step5.metadata.fieldsCount', { count: results?.beforeBreakdown.xmpFields ?? 19 })}</span>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-film text-brand-red"></i> {tx('step5.metadata.id3mp4')}</span
								>
								<span class="text-xs font-mono text-white">{tx('step5.metadata.fieldsCount', { count: results?.beforeBreakdown.id3mp4Fields ?? 23 })}</span>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-ellipsis text-brand-red"></i> {tx('step5.metadata.other')}</span
								>
								<span class="text-xs font-mono text-white">{tx('step5.metadata.fieldsCount', { count: results?.beforeBreakdown.otherFields ?? 13 })}</span>
							</div>
							<div class="mt-1">
								<div class="flex justify-between text-[10px] text-text-muted mb-1">
									<span>{tx('step5.metadata.totalRisk')}</span>
									<span class="text-brand-red font-bold">{tx('step5.metadata.riskHigh')}</span>
								</div>
								<div class="w-full h-2 rounded-full bg-navy-main overflow-hidden">
									<div
										class="h-full rounded-full bg-gradient-to-r from-brand-red to-brand-orange"
										style="width: 92%"
									></div>
								</div>
							</div>
						</div>
					{/if}

					<!-- After Panel -->
					{#if activeMetaTab === 'after'}
						<div class="flex flex-col gap-2">
							<p class="text-xs text-white font-semibold mb-1">{tx('step5.metadata.afterDesc')}</p>
							<div
								class="flex items-center gap-2 bg-brand-green/10 border border-brand-green/20 rounded-xl px-3 py-2.5 mb-1"
							>
								<i
									class="fa-solid fa-shield-halved text-brand-green text-sm flex-shrink-0"
								></i>
								<p class="text-xs text-brand-green/90 font-medium">
									{tx('step5.metadata.allRemovedSuccess')}
								</p>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-location-dot text-brand-green"></i> {tx('step5.metadata.gps')}</span
								>
								<span class="text-xs font-mono text-brand-green flex items-center gap-1"
									><i class="fa-solid fa-check"></i> {tx('step5.metadata.removed')}</span
								>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-camera text-brand-green"></i> {tx('step5.metadata.exif')}</span
								>
								<span class="text-xs font-mono text-brand-green flex items-center gap-1"
									><i class="fa-solid fa-check"></i> {tx('step5.metadata.removed')}</span
								>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-tag text-brand-green"></i> {tx('step5.metadata.xmp')}</span
								>
								<span class="text-xs font-mono text-brand-green flex items-center gap-1"
									><i class="fa-solid fa-check"></i> {tx('step5.metadata.removed')}</span
								>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-film text-brand-green"></i> {tx('step5.metadata.id3mp4')}</span
								>
								<span class="text-xs font-mono text-brand-green flex items-center gap-1"
									><i class="fa-solid fa-check"></i> {tx('step5.metadata.removed')}</span
								>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-ellipsis text-brand-green"></i> {tx('step5.metadata.other')}</span
								>
								<span class="text-xs font-mono text-brand-green flex items-center gap-1"
									><i class="fa-solid fa-check"></i> {tx('step5.metadata.removed')}</span
								>
							</div>
							<div class="mt-1">
								<div class="flex justify-between text-[10px] text-text-muted mb-1">
									<span>{tx('step5.metadata.totalRisk')}</span>
									<span class="text-brand-green font-bold">{tx('step5.metadata.riskNone')}</span>
								</div>
								<div class="w-full h-2 rounded-full bg-navy-main overflow-hidden">
									<div class="h-full rounded-full bg-brand-green" style="width: 0%"></div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- File Results Card -->
		<div
			class="fade-in-up delay-3 bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 shadow-card flex flex-col gap-4"
		>
			<div class="flex items-center justify-between">
				<h3 class="font-semibold text-base lg:text-lg text-white">{tx('step5.results.title')}</h3>
				<span
					class="text-[10px] font-bold px-2.5 lg:px-3 py-1 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 uppercase tracking-wider flex items-center gap-1.5"
				>
					<i class="fa-solid fa-circle-check text-[10px]"></i> {tx('step5.results.allDone')}
				</span>
			</div>

			<!-- Files Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
				{#if results}
					{#each results.fileResults as fileResult}
						{@const file = getFileById(fileResult.fileId)}
						{#if file}
							{@const iconStyle = getFileIconStyle(file)}
							<div class="file-row rounded-xl border border-brand-green/20 bg-navy-main/60 overflow-hidden">
								<div class="flex items-center gap-3 px-3 lg:px-4 py-3">
									<div
										class="w-9 h-9 rounded-lg {iconStyle.bg} {iconStyle.border} border flex items-center justify-center flex-shrink-0"
									>
										<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} {iconStyle.text} text-sm"></i>
									</div>
									<div class="flex-1 min-w-0">
										<p class="text-sm font-semibold text-white truncate">{file.name}</p>
										<p class="text-[11px] text-text-muted">{file.size} · {file.extension}{file.device ? ` · ${file.device}` : ''}</p>
									</div>
									<span
										class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
										>{file.extension}</span
									>
									<div
										class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center flex-shrink-0"
									>
										<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
									</div>
								</div>
								<div class="px-3 lg:px-4 pb-3 flex flex-wrap gap-1.5">
									{#if fileResult.gpsRemoved}
										<span
											class="text-[10px] px-2 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium"
											>{tx('step5.results.gpsRemoved')}</span
										>
									{/if}
									{#if fileResult.exifCount > 0}
										<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
											>EXIF ×{fileResult.exifCount}</span
										>
									{/if}
									{#if fileResult.xmpCount > 0}
										<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
											>XMP ×{fileResult.xmpCount}</span
										>
									{/if}
									{#if fileResult.id3Count > 0}
										<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
											>ID3 ×{fileResult.id3Count}</span
										>
									{/if}
									{#if fileResult.mp4AtomsCount > 0}
										<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
											>MP4 atoms ×{fileResult.mp4AtomsCount}</span
										>
									{/if}
									{#if fileResult.pngChunksCount > 0}
										<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
											>PNG chunks ×{fileResult.pngChunksCount}</span
										>
									{/if}
									<span
										class="text-[10px] px-2 py-0.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green font-medium"
										>{tx('step5.metadata.fieldsCount', { count: fileResult.totalFields })}</span
									>
								</div>
							</div>
						{/if}
					{/each}
				{/if}
			</div>

			<!-- Desktop Action Buttons -->
			<div class="hidden lg:flex gap-3 mt-1">
				<button
					class="flex-1 py-3.5 rounded-xl bg-brand-green text-white font-bold text-sm hover:bg-green-400 transition-all flex items-center justify-center gap-2 shadow-glow-green"
				>
					<i class="fa-solid fa-download"></i> {tx('step5.actions.downloadAll')}
				</button>
				<a
					href="/report"
					class="px-5 py-3.5 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue font-semibold text-sm hover:bg-brand-blue/20 transition-all flex items-center gap-2"
				>
					<i class="fa-solid fa-file-lines"></i> {tx('step5.actions.viewReport')}
				</a>
				<a
					href="/reports"
					class="px-5 py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm hover:bg-gray-800 hover:text-white transition-all flex items-center gap-2"
				>
					<i class="fa-solid fa-clock-rotate-left"></i> {tx('step5.actions.history')}
				</a>
			</div>
		</div>
	</main>

	<!-- Mobile Sticky Bottom CTA -->
	<div
		class="lg:hidden fixed bottom-0 left-0 right-0 bg-navy-main/95 backdrop-blur border-t border-gray-800 px-4 py-3 flex flex-col gap-2 z-50"
	>
		<button
			class="w-full py-4 rounded-xl bg-brand-green text-white font-bold text-sm flex items-center justify-center gap-2 shadow-glow-green active:scale-95 transition-transform"
		>
			<i class="fa-solid fa-download"></i> {tx('step5.actions.downloadAll')}
		</button>
		<div class="flex gap-2">
			<a
				href="/report"
				class="flex-1 py-3 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
			>
				<i class="fa-solid fa-file-lines"></i> {tx('step5.actions.viewReport')}
			</a>
			<a
				href="/reports"
				class="flex-1 py-3 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
			>
				<i class="fa-solid fa-clock-rotate-left"></i> {tx('step5.actions.history')}
			</a>
			<a
				href="/"
				class="flex-1 py-3 rounded-xl bg-navy-lighter border border-gray-700 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
			>
				<i class="fa-solid fa-arrow-up-from-bracket text-text-muted"></i>
				{tx('step5.actions.new')}
			</a>
		</div>
	</div>
</div>

<style>
	.file-row {
		transition: background 0.15s;
	}
	.file-row:hover {
		background: #1e293b;
	}
</style>
