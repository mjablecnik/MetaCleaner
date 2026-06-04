<script lang="ts">
	import '../layout.css';
	import { onMount } from 'svelte';
	import { currentLocale, switchLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getCurrentUser, type User } from '$lib/repositories/userRepository';
	import { getLanguages, type Language } from '$lib/repositories/languageRepository';
	import { getUploadedFiles, type UploadedFile } from '$lib/repositories/fileRepository';
	import { getErrorState, type ErrorState } from '$lib/repositories/processingRepository';

	let langDropdownOpen = $state(false);
	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);

	let detailAccordionOpen = $state(true);
	let typeAccordionOpen = $state(true);
	let logAccordionOpen = $state(true);

	let bannerVisible = $state(true);
	let selectedErrorType = $state('cleaning');

	let langOptions = $state<Language[]>([]);
	let user = $state<User | null>(null);
	let uploadedFiles = $state<UploadedFile[]>([]);
	let errorState = $state<ErrorState | null>(null);

	let currentLangInfo = $derived(langOptions.find((l) => l.code === currentLocale) ?? langOptions[0]);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale; // reactive dependency
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	function getFileById(id: string): UploadedFile | undefined {
		return uploadedFiles.find((f) => f.id === id);
	}

	function getFileLogStatus(fileId: string): 'success' | 'error' | 'skipped' | undefined {
		const entry = errorState?.log.find((l) => l.fileId === fileId);
		return entry?.status as 'success' | 'error' | 'skipped' | undefined;
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
		getErrorState().then((es) => { errorState = es; });
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<svelte:head>
	<title>{tx('step4.meta.title')}</title>
</svelte:head>

<div class="flex flex-col min-h-screen bg-navy-main text-white font-sans">
	<!-- Navigation -->
	<nav class="w-full sticky lg:static top-0 bg-navy-main border-b border-gray-800/50 lg:border-0 z-50">
		<div class="max-w-[1100px] mx-auto px-4 lg:px-6 py-4 lg:py-6 flex justify-between items-center">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-2.5 lg:gap-3">
				<div class="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue">
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
						<div class="w-7 h-7 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center">
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
					<div class="lang-dropdown-menu" class:open={hamburgerMenuOpen} style="min-width:220px">
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
	<main class="w-full max-w-[1100px] mx-auto px-4 lg:px-6 pb-24 flex flex-col gap-4 lg:gap-6 mt-4 lg:mt-0">

		<!-- Page Header -->
		<div class="flex flex-col gap-1 mb-0 lg:mb-2">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<h1 class="text-2xl lg:text-3xl font-bold text-white">{tx('step1.header.title')}</h1>
					<p class="text-text-muted text-sm mt-1">{tx('step1.header.description')}</p>
				</div>
				<div class="flex items-center gap-2 bg-navy-card border border-red-800/50 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 self-start sm:self-auto">
					<div class="w-2 h-2 rounded-full bg-brand-red"></div>
					<span class="text-[10px] lg:text-xs font-semibold text-brand-red">
						<span class="hidden lg:inline">{tx('step4.badge.errorDesktop')}</span>
						<span class="inline lg:hidden">{tx('step4.badge.errorMobile')}</span>
					</span>
				</div>
			</div>
		</div>

		<!-- Error Banner -->
		{#if bannerVisible}
			<div class="w-full bg-brand-red/10 border border-brand-red/30 rounded-2xl px-4 lg:px-5 py-3.5 lg:py-4 flex items-start gap-3 lg:gap-4 shadow-glow-red">
				<div class="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-brand-red/15 border border-brand-red/30 flex items-center justify-center flex-shrink-0 mt-0.5">
					<i class="fa-solid fa-triangle-exclamation text-brand-red text-base lg:text-lg"></i>
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 flex-wrap">
						<p class="text-sm font-bold text-white">{tx('step4.error.processFailedTitle')}</p>
						<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-red/20 text-brand-red border border-brand-red/30 tracking-wider">{errorState?.errorCode}</span>
					</div>
					<p class="text-xs text-text-muted mt-1 leading-relaxed">
						<span class="hidden lg:inline">{tx('step4.error.descriptionDesktop')}</span>
						<span class="inline lg:hidden">{tx('step4.error.descriptionMobile')}</span>
					</p>
				</div>
				<button
					onclick={() => (bannerVisible = false)}
					class="flex-shrink-0 text-text-muted hover:text-white transition-colors mt-0.5 p-1"
					aria-label="close"
				>
					<i class="fa-solid fa-xmark text-sm"></i>
				</button>
			</div>
		{/if}

		<!-- Mobile: Error Visual Card -->
		<div class="lg:hidden bg-navy-card rounded-2xl border border-gray-800 p-5 flex flex-col items-center gap-3 shadow-card">
			<div class="relative flex items-center justify-center mt-1">
				<div class="pulse-ring absolute w-20 h-20 rounded-full border-2 border-brand-red/20"></div>
				<div class="w-16 h-16 rounded-full bg-brand-red/10 border-2 border-brand-red/40 flex items-center justify-center shake">
					<i class="fa-solid fa-triangle-exclamation text-brand-red text-3xl"></i>
				</div>
				<div class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-red flex items-center justify-center">
					<i class="fa-solid fa-xmark text-white text-[9px]"></i>
				</div>
			</div>
			<div class="text-center">
				<p class="font-bold text-white text-sm">{tx('step4.error.cleaningFailed')}</p>
				<p class="text-text-muted text-xs mt-1 leading-relaxed">
					{tx('step4.detail.file')} <span class="text-brand-red font-semibold">{getFileById(errorState?.failedFileId ?? '')?.name ?? ''}</span> {tx('step4.error.couldNotProcess')}.
				</p>
			</div>
			<div class="w-full bg-navy-main/60 rounded-xl p-3 border border-red-900/30">
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-semibold text-text-muted">{tx('step3.progress.overall')}</span>
					<span class="text-xs font-bold text-brand-red">{tx('step4.error.interrupted')}</span>
				</div>
				<div class="w-full h-2 bg-navy-lighter rounded-full overflow-hidden">
					<div class="h-full rounded-full bg-gradient-to-r from-brand-red to-red-400" style="width:{errorState ? Math.round(errorState.filesCompleted / errorState.totalFiles * 100) : 0}%"></div>
				</div>
				<div class="flex items-center justify-between mt-2">
					<span class="text-[11px] text-text-muted">{tx('step3.progress.filesCompleted', { done: errorState?.filesCompleted ?? 0, total: errorState?.totalFiles ?? 0 })}</span>
					<span class="text-[11px] text-brand-red font-medium flex items-center gap-1">
						<i class="fa-solid fa-circle-xmark text-[9px]"></i> {tx('step4.error.failedShort')}
					</span>
				</div>
			</div>
		</div>

		<!-- Main Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-[55%_43%] gap-4 lg:gap-6">

			<!-- Left Column — Files Card -->
			<div class="flex flex-col gap-4 lg:gap-5">
				<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 flex flex-col gap-4 shadow-card">
					<div class="flex items-center justify-between">
						<h3 class="font-semibold text-base lg:text-lg text-white">{tx('step1.files.title')}</h3>
						<span class="text-[10px] lg:text-xs font-bold px-2.5 lg:px-3 py-1 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase tracking-wider flex items-center gap-1.5">
							<i class="fa-solid fa-circle-xmark text-[10px]"></i> {tx('step4.badge.errorMobile')}
						</span>
					</div>

					<!-- Overall Progress - Failed (desktop only) -->
					<div class="hidden lg:block bg-navy-main/60 rounded-xl p-4 border border-red-900/30">
						<div class="flex items-center justify-between mb-2">
							<span class="text-xs font-semibold text-text-muted">{tx('step3.progress.overall')}</span>
							<span class="text-xs font-bold text-brand-red">{tx('step4.error.interrupted')}</span>
						</div>
						<div class="w-full h-2.5 bg-navy-lighter rounded-full overflow-hidden">
							<div class="h-full rounded-full bg-gradient-to-r from-brand-red to-red-400" style="width:{errorState ? Math.round(errorState.filesCompleted / errorState.totalFiles * 100) : 0}%"></div>
						</div>
						<div class="flex items-center justify-between mt-2">
							<span class="text-[11px] text-text-muted">{tx('step3.progress.filesCompleted', { done: errorState?.filesCompleted ?? 0, total: errorState?.totalFiles ?? 0 })}</span>
							<span class="text-[11px] text-brand-red font-medium flex items-center gap-1">
								<i class="fa-solid fa-circle-xmark text-[9px]"></i> {tx('step4.error.processingFailed')}
							</span>
						</div>
					</div>

					<!-- File List -->
					<div class="flex flex-col gap-2 lg:max-h-[320px] lg:overflow-y-auto pr-1">
						{#each uploadedFiles as file}
							{@const fileStatus = getFileLogStatus(file.id)}
							{#if fileStatus === 'success'}
								<div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-main/60 border border-brand-green/20 cursor-default">
									<div class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
										<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} text-brand-green text-sm"></i>
									</div>
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium text-white truncate">{file.name}</p>
										<div class="flex items-center gap-1.5 lg:gap-2 mt-0.5">
											<span class="text-[10px] lg:text-[11px] text-text-muted">{file.size}</span>
											<span class="w-1 h-1 rounded-full bg-gray-600"></span>
											<span class="text-[10px] lg:text-[11px] text-brand-green font-medium flex items-center gap-1">
												<i class="fa-solid fa-circle-check text-[9px]"></i>
												{#if file.hasGps}
													<span class="hidden lg:inline">{tx('step3.files.gpsAndFieldsRemoved', { count: file.metadataFieldCount })}</span>
													<span class="inline lg:hidden">{tx('step3.files.gpsAndFieldsRemovedMobile', { count: file.metadataFieldCount })}</span>
												{:else}
													{file.metadataFieldCount} {tx('step3.files.fieldsRemoved')}
												{/if}
											</span>
										</div>
									</div>
									<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
										<span class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted">{file.extension}</span>
										<div class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
											<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
										</div>
									</div>
								</div>
							{:else if fileStatus === 'error'}
								<div class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-brand-red/30 cursor-default bg-brand-red/5">
									<div class="w-9 h-9 rounded-lg bg-brand-red/10 border border-brand-red/20 flex items-center justify-center flex-shrink-0">
										<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} text-brand-red text-sm"></i>
									</div>
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium text-white truncate">{file.name}</p>
										<div class="flex items-center gap-1.5 lg:gap-2 mt-0.5">
											<span class="text-[10px] lg:text-[11px] text-text-muted">{file.size}</span>
											<span class="w-1 h-1 rounded-full bg-gray-600"></span>
											<span class="text-[10px] lg:text-[11px] text-brand-red font-medium flex items-center gap-1">
												<i class="fa-solid fa-circle-xmark text-[9px]"></i>
												<span class="hidden lg:inline">{tx('step4.error.processingFailed')}</span>
												<span class="inline lg:hidden">{tx('step4.error.failedShort')}</span>
											</span>
										</div>
									</div>
									<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
										<span class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted">{file.extension}</span>
										<div class="w-6 h-6 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center">
											<i class="fa-solid fa-xmark text-brand-red text-[10px]"></i>
										</div>
									</div>
								</div>
							{:else}
								<div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-main/60 border border-gray-800 cursor-default opacity-50">
									<div class="w-9 h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center flex-shrink-0">
										<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} text-brand-blue text-sm"></i>
									</div>
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium text-white truncate">{file.name}</p>
										<div class="flex items-center gap-1.5 lg:gap-2 mt-0.5">
											<span class="text-[10px] lg:text-[11px] text-text-muted">{file.size}</span>
											<span class="w-1 h-1 rounded-full bg-gray-600"></span>
											<span class="text-[10px] lg:text-[11px] text-text-muted flex items-center gap-1">
												<i class="fa-solid fa-ban text-[9px]"></i> {tx('step4.error.skipped')}
											</span>
										</div>
									</div>
									<span class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted flex-shrink-0">{file.extension}</span>
								</div>
							{/if}
						{/each}
					</div>

					<!-- Action Buttons -->
					<div class="flex gap-3 mt-1">
						<a href="/step3" class="flex-1 py-3.5 rounded-xl bg-brand-green hover:bg-green-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-glow-green">
							<i class="fa-solid fa-rotate-right"></i> {tx('step4.actions.tryAgain')}
						</a>
						<button class="px-4 lg:px-5 py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm hover:bg-gray-800 hover:text-white transition-all flex items-center gap-2">
							<i class="fa-solid fa-trash"></i>
							<span class="hidden lg:inline">{tx('step4.actions.clearAll')}</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Right Column (desktop only) — Error State Card -->
			<div class="hidden lg:flex flex-col gap-5">
				<div class="bg-navy-card rounded-2xl border border-gray-800 p-6 shadow-card flex flex-col gap-5">
					<div class="flex items-center justify-between">
						<h3 class="font-semibold text-lg text-white">{tx('step1.status.title')}</h3>
						<span class="text-xs font-bold px-3 py-1 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase tracking-wider flex items-center gap-1.5">
							<i class="fa-solid fa-circle-xmark text-[10px]"></i> {tx('step4.badge.errorMobile')}
						</span>
					</div>

					<!-- Error Visual -->
					<div class="flex flex-col items-center justify-center py-4 gap-4">
						<div class="relative flex items-center justify-center">
							<div class="pulse-ring absolute w-24 h-24 rounded-full border-2 border-brand-red/20"></div>
							<div class="w-20 h-20 rounded-full bg-brand-red/10 border-2 border-brand-red/40 flex items-center justify-center shake">
								<i class="fa-solid fa-triangle-exclamation text-brand-red text-4xl"></i>
							</div>
							<div class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-red flex items-center justify-center">
								<i class="fa-solid fa-xmark text-white text-[10px]"></i>
							</div>
						</div>
						<div class="text-center">
							<p class="font-bold text-white text-base">{tx('step4.error.cleaningFailed')}</p>
							<p class="text-text-muted text-xs mt-1 max-w-[220px] mx-auto leading-relaxed">
								{tx('step4.detail.file')} <span class="text-brand-red font-semibold">{getFileById(errorState?.failedFileId ?? '')?.name ?? ''}</span> {tx('step4.error.couldNotProcess')}.
							</p>
						</div>
					</div>

					<!-- Error Detail Box -->
					<div class="bg-navy-main/80 rounded-xl border border-brand-red/20 p-4 flex flex-col gap-3">
						<div class="flex items-center justify-between">
							<p class="text-xs font-semibold text-text-muted uppercase tracking-wider">{tx('step4.detail.title')}</p>
							<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-red/15 text-brand-red border border-brand-red/25 tracking-wider">{errorState?.errorCode}</span>
						</div>
						<div class="flex flex-col gap-2">
							<div class="flex items-start gap-2.5">
								<i class="fa-solid fa-circle-info text-text-muted text-xs mt-0.5 flex-shrink-0"></i>
								<p class="text-xs text-text-muted leading-relaxed">{tx('step4.detail.description')}</p>
							</div>
							<div class="h-px bg-gray-800 my-1"></div>
							<div class="grid grid-cols-2 gap-2">
								<div class="flex flex-col gap-0.5">
									<span class="text-[10px] text-text-muted uppercase tracking-wider">{tx('step4.detail.errorCode')}</span>
									<span class="text-xs font-mono font-semibold text-white">{errorState?.errorHexCode}</span>
								</div>
								<div class="flex flex-col gap-0.5">
									<span class="text-[10px] text-text-muted uppercase tracking-wider">{tx('step4.detail.errorTime')}</span>
									<span class="text-xs font-mono font-semibold text-white">{errorState?.errorTime}</span>
								</div>
								<div class="flex flex-col gap-0.5">
									<span class="text-[10px] text-text-muted uppercase tracking-wider">{tx('step4.detail.file')}</span>
									<span class="text-xs font-mono font-semibold text-white truncate">{getFileById(errorState?.failedFileId ?? '')?.name ?? ''}</span>
								</div>
								<div class="flex flex-col gap-0.5">
									<span class="text-[10px] text-text-muted uppercase tracking-wider">{tx('step4.detail.phase')}</span>
									<span class="text-xs font-mono font-semibold text-white">{errorState?.phase}</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Error Type Selector -->
					<div class="flex flex-col gap-2">
						<p class="text-xs font-semibold text-text-muted uppercase tracking-wider">{tx('step4.type.title')}</p>
						<div class="flex flex-col gap-1.5">
							{#each errorState?.errorTypes ?? [] as errType}
								<button
									onclick={() => (selectedErrorType = errType.id)}
									class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all w-full border {selectedErrorType === errType.id ? 'border-brand-red/30 bg-brand-red/10' : 'border-gray-700 bg-navy-main/60'}"
								>
									<div
										class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border {selectedErrorType === errType.id ? 'border-brand-red/25 bg-brand-red/15' : 'border-gray-700 bg-navy-lighter'}"
									>
										<i
											class="fa-solid {errType.icon} text-xs {selectedErrorType === errType.id ? 'text-brand-red' : 'text-text-muted'}"
										></i>
									</div>
									<div class="flex-1 min-w-0">
										<p class="text-xs font-semibold {selectedErrorType === errType.id ? 'text-text-main' : 'text-text-muted'}">{tx(`step4.type.${errType.id}.title`)}</p>
										<p class="text-[10px] text-text-muted">{tx(`step4.type.${errType.id}.description`)}</p>
									</div>
									<i
										class="fa-solid text-xs {selectedErrorType === errType.id ? 'text-brand-red' : 'text-gray-700'}"
										class:fa-circle-dot={selectedErrorType === errType.id}
										class:fa-circle={selectedErrorType !== errType.id}
									></i>
								</button>
							{/each}
						</div>
					</div>

					<!-- Error Log -->
					<div class="flex flex-col gap-1">
						<p class="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">{tx('step4.log.title')}</p>
						<div class="bg-navy-main/80 rounded-xl border border-gray-800 p-3 flex flex-col gap-1.5 max-h-[130px] overflow-y-auto font-mono">
							{#each errorState?.log ?? [] as logEntry}
								{@const file = getFileById(logEntry.fileId)}
								{#if logEntry.status === 'success'}
									<div class="flex items-start gap-2">
										<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">{logEntry.timestamp}</span>
										<span class="text-[11px] text-brand-green">✓ {file?.name} — {file?.hasGps ? tx('step3.files.gpsAndFieldsRemoved', { count: file.metadataFieldCount }) : `${file?.metadataFieldCount} ${tx('step3.files.fieldsRemoved')}`}</span>
									</div>
								{:else if logEntry.status === 'error'}
									<div class="flex items-start gap-2">
										<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">{logEntry.timestamp}</span>
										<span class="text-[11px] text-brand-red">✗ {file?.name} — {logEntry.errorCode}</span>
									</div>
								{:else}
									<div class="flex items-start gap-2 opacity-40">
										<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">{logEntry.timestamp}</span>
										<span class="text-[11px] text-text-muted">{file?.name} — {tx('step4.error.skipped').toLowerCase()}</span>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Mobile: Error Detail Accordion -->
		<div class="lg:hidden bg-navy-card rounded-2xl border border-gray-800 shadow-card overflow-hidden">
			<button
				onclick={() => (detailAccordionOpen = !detailAccordionOpen)}
				class="w-full flex items-center justify-between px-4 py-4"
			>
				<div class="flex items-center gap-2">
					<i class="fa-solid fa-circle-info text-brand-red text-sm"></i>
					<span class="font-semibold text-sm text-white">{tx('step4.detail.title')}</span>
					<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-red/15 text-brand-red border border-brand-red/25 tracking-wider">{errorState?.errorCode}</span>
				</div>
				<i
					class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform"
					style="transform: {detailAccordionOpen ? 'rotate(180deg)' : ''}"
				></i>
			</button>
			{#if detailAccordionOpen}
				<div class="px-4 pb-4 flex flex-col gap-3">
					<div class="flex items-start gap-2">
						<i class="fa-solid fa-circle-info text-text-muted text-xs mt-0.5 flex-shrink-0"></i>
						<p class="text-xs text-text-muted leading-relaxed">{tx('step4.detail.description')}</p>
					</div>
					<div class="h-px bg-gray-800"></div>
					<div class="grid grid-cols-2 gap-3 pl-5">
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] text-text-muted uppercase tracking-wider">{tx('step4.detail.errorCode')}</span>
							<span class="text-xs font-mono font-semibold text-white">{errorState?.errorHexCode}</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] text-text-muted uppercase tracking-wider">{tx('step4.detail.errorTime')}</span>
							<span class="text-xs font-mono font-semibold text-white">{errorState?.errorTime}</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] text-text-muted uppercase tracking-wider">{tx('step4.detail.file')}</span>
							<span class="text-xs font-mono font-semibold text-white truncate">{getFileById(errorState?.failedFileId ?? '')?.name ?? ''}</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] text-text-muted uppercase tracking-wider">{tx('step4.detail.phase')}</span>
							<span class="text-xs font-mono font-semibold text-white">{errorState?.phase}</span>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Mobile: Error Type Accordion -->
		<div class="lg:hidden bg-navy-card rounded-2xl border border-gray-800 shadow-card overflow-hidden">
			<button
				onclick={() => (typeAccordionOpen = !typeAccordionOpen)}
				class="w-full flex items-center justify-between px-4 py-4"
			>
				<div class="flex items-center gap-2">
					<i class="fa-solid fa-tag text-text-muted text-sm"></i>
					<span class="font-semibold text-sm text-white">{tx('step4.type.title')}</span>
				</div>
				<i
					class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform"
					style="transform: {typeAccordionOpen ? 'rotate(180deg)' : ''}"
				></i>
			</button>
			{#if typeAccordionOpen}
				<div class="px-4 pb-4 flex flex-col gap-2">
					{#each errorState?.errorTypes ?? [] as errType}
						<button
							onclick={() => (selectedErrorType = errType.id)}
							class="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all w-full border {selectedErrorType === errType.id ? 'border-brand-red/30 bg-brand-red/10' : 'border-gray-700 bg-navy-main/60'}"
						>
							<div
								class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border {selectedErrorType === errType.id ? 'border-brand-red/25 bg-brand-red/15' : 'border-gray-700 bg-navy-lighter'}"
							>
								<i
									class="fa-solid {errType.icon} text-xs {selectedErrorType === errType.id ? 'text-brand-red' : 'text-text-muted'}"
								></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-xs font-semibold {selectedErrorType === errType.id ? 'text-text-main' : 'text-text-muted'}">{tx(`step4.type.${errType.id}.title`)}</p>
								<p class="text-[10px] text-text-muted">{tx(`step4.type.${errType.id}.description`)}</p>
							</div>
							<i
								class="fa-solid text-xs {selectedErrorType === errType.id ? 'text-brand-red' : 'text-gray-700'}"
								class:fa-circle-dot={selectedErrorType === errType.id}
								class:fa-circle={selectedErrorType !== errType.id}
							></i>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Mobile: Error Log Accordion -->
		<div class="lg:hidden bg-navy-card rounded-2xl border border-gray-800 shadow-card overflow-hidden">
			<button
				onclick={() => (logAccordionOpen = !logAccordionOpen)}
				class="w-full flex items-center justify-between px-4 py-4"
			>
				<div class="flex items-center gap-2">
					<i class="fa-solid fa-terminal text-text-muted text-sm"></i>
					<span class="font-semibold text-sm text-white">{tx('step4.log.title')}</span>
				</div>
				<i
					class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform"
					style="transform: {logAccordionOpen ? 'rotate(180deg)' : ''}"
				></i>
			</button>
			{#if logAccordionOpen}
				<div class="px-4 pb-4">
					<div class="bg-navy-main/80 rounded-xl border border-gray-800 p-3 flex flex-col gap-1.5 font-mono">
						{#each errorState?.log ?? [] as logEntry}
							{@const file = getFileById(logEntry.fileId)}
							{#if logEntry.status === 'success'}
								<div class="flex items-start gap-2">
									<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">{logEntry.timestamp}</span>
									<span class="text-[11px] text-brand-green">✓ {file?.name} — {file?.hasGps ? tx('step3.files.gpsAndFieldsRemovedMobile', { count: file.metadataFieldCount }) : `${file?.metadataFieldCount} ${tx('step3.files.fieldsRemoved')}`}</span>
								</div>
							{:else if logEntry.status === 'error'}
								<div class="flex items-start gap-2">
									<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">{logEntry.timestamp}</span>
									<span class="text-[11px] text-brand-red">✗ {file?.name} — {logEntry.errorCode}</span>
								</div>
							{:else}
								<div class="flex items-start gap-2 opacity-40">
									<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">{logEntry.timestamp}</span>
									<span class="text-[11px] text-text-muted">{file?.name} — {tx('step4.error.skipped').toLowerCase()}</span>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		</div>

	</main>
</div>
