<script lang="ts">
	import { onMount } from 'svelte';
	import '../layout.css';
	import { currentLocale, switchLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getCurrentUser, type User } from '$lib/repositories/userRepository';
	import { getLanguages, type Language } from '$lib/repositories/languageRepository';
	import { getUploadedFiles, type UploadedFile } from '$lib/repositories/fileRepository';
	import { getProcessingState, type ProcessingState } from '$lib/repositories/processingRepository';

	let langDropdownOpen = $state(false);
	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);
	let logAccordionOpen = $state(false);

	let langOptions = $state<Language[]>([]);
	let user = $state<User | null>(null);
	let uploadedFiles = $state<UploadedFile[]>([]);
	let processingState = $state<ProcessingState | null>(null);
	let overallPct = $state(0);

	let currentLangInfo = $derived(langOptions.find((l) => l.code === currentLocale) ?? langOptions[0]);
	let currentFile = $derived(uploadedFiles.find((f) => f.id === processingState?.currentFileId));

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale; // reactive dependency
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	function getFileById(id: string): UploadedFile | undefined {
		return uploadedFiles.find((f) => f.id === id);
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

	let animationInterval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		getLanguages().then((langs) => { langOptions = langs; });
		getCurrentUser().then((u) => { user = u; });
		getUploadedFiles().then((files) => { uploadedFiles = files; });
		getProcessingState().then((ps) => {
			processingState = ps;
			overallPct = ps.overallProgress;
			animationInterval = setInterval(() => {
				if (overallPct >= 75) {
					clearInterval(animationInterval);
					return;
				}
				overallPct = Math.min(overallPct + 0.5, 75);
			}, 300);
		});
		return () => {
			document.removeEventListener('click', handleClickOutside);
			if (animationInterval) clearInterval(animationInterval);
		};
	});
</script>

<svelte:head>
	<title>{tx('step3.meta.title')}</title>
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
				<!-- Language dropdown -->
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

				<!-- User dropdown -->
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
					<div
						class="lang-dropdown-menu"
						class:open={userDropdownOpen}
						style="min-width:200px"
					>
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
							<p class="text-[10px] text-text-muted uppercase tracking-wider mb-1">
								{tx('common.nav.language')}
							</p>
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
	<main
		class="w-full max-w-[1100px] mx-auto px-4 lg:px-6 pb-24 flex flex-col gap-4 lg:gap-6 mt-4 lg:mt-0"
	>
		<!-- Page Header -->
		<div class="flex flex-col gap-1 mb-0 lg:mb-2">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<h1 class="text-2xl lg:text-3xl font-bold text-white">{tx('step1.header.title')}</h1>
					<p class="text-text-muted text-sm mt-1">
						{tx('step1.header.description')}
					</p>
				</div>
				<!-- Processing badge -->
				<div
					class="flex items-center gap-2 bg-navy-card border border-blue-800/50 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 self-start sm:self-auto"
				>
					<div class="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
					<span class="text-[10px] lg:text-xs font-semibold text-brand-blue">
						<span class="hidden lg:inline">{tx('step3.badge.inProgressDesktop')}</span>
						<span class="inline lg:hidden">{tx('step3.badge.inProgressMobile')}</span>
					</span>
				</div>
			</div>
		</div>

		<!-- Mobile: Status Card on top -->
		<div
			class="lg:hidden bg-navy-card rounded-2xl border border-gray-800 p-4 shadow-card flex flex-col gap-4"
		>
			<div class="flex items-center justify-between">
				<h3 class="font-semibold text-base text-white">{tx('step3.status.title')}</h3>
				<span
					class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 uppercase tracking-wider flex items-center gap-1"
				>
					<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i> {tx('step3.status.inProgress')}
				</span>
			</div>
			<div class="flex items-center gap-4">
				<div class="relative flex items-center justify-center flex-shrink-0">
					<div class="pulse-ring absolute w-16 h-16 rounded-full border-2 border-brand-blue/20"></div>
					<div
						class="w-14 h-14 rounded-full bg-brand-blue/10 border-2 border-brand-blue/40 flex items-center justify-center"
					>
						<i class="fa-solid fa-shield-halved text-brand-blue text-2xl"></i>
					</div>
					<div
						class="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center"
					>
						<i class="fa-solid fa-circle-notch spin-slow text-white text-[9px]"></i>
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<p class="font-bold text-white text-sm">{tx('step3.status.cleaningInProgress')}</p>
					<p class="text-text-muted text-xs mt-0.5">
						{tx('step3.status.processingFile', { filename: currentFile?.name ?? '' })}
					</p>
				</div>
			</div>
			<!-- Live Stats -->
			<div class="grid grid-cols-3 gap-2 w-full">
				<div class="bg-navy-main/60 rounded-xl p-2.5 text-center border border-gray-800">
					<p class="text-lg font-black text-white">{processingState?.totalFiles ?? 0}</p>
					<p class="text-[10px] text-text-muted mt-0.5">{tx('common.stats.files')}</p>
				</div>
				<div class="bg-navy-main/60 rounded-xl p-2.5 text-center border border-brand-green/20">
					<p class="text-lg font-black text-brand-green">{processingState?.fieldsRemoved ?? 0}</p>
					<p class="text-[10px] text-text-muted mt-0.5">{tx('step3.stats.fieldsDeleted')}</p>
				</div>
				<div class="bg-navy-main/60 rounded-xl p-2.5 text-center border border-gray-800">
					<p class="text-lg font-black text-brand-blue">
						{processingState?.filesCompleted ?? 0}<span class="text-xs font-semibold">/{processingState?.totalFiles ?? 0}</span>
					</p>
					<p class="text-[10px] text-text-muted mt-0.5">{tx('step3.stats.done')}</p>
				</div>
			</div>
		</div>

		<!-- Main Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-[55%_43%] gap-4 lg:gap-6">
			<!-- Left Column — Files Card -->
			<div class="flex flex-col gap-4 lg:gap-5">
				<div
					class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 flex flex-col gap-4 shadow-card"
				>
					<div class="flex items-center justify-between">
						<h3 class="font-semibold text-base lg:text-lg text-white">{tx('step1.files.title')}</h3>
						<span
							class="text-[10px] lg:text-xs font-bold px-2.5 lg:px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 uppercase tracking-wider flex items-center gap-1.5"
						>
							<i class="fa-solid fa-circle-notch spin-slow text-[10px]"></i>
							{tx('step3.status.processing')}
						</span>
					</div>

					<!-- Overall Progress -->
					<div class="bg-navy-main/60 rounded-xl p-3 lg:p-4 border border-blue-900/30">
						<div class="flex items-center justify-between mb-1.5 lg:mb-2">
							<span class="text-xs font-semibold text-text-muted">{tx('step3.progress.overall')}</span>
							<span class="text-xs font-bold text-brand-blue">{Math.round(overallPct)}%</span>
						</div>
						<div class="w-full h-2.5 bg-navy-lighter rounded-full overflow-hidden">
							<div
								class="h-full rounded-full bg-gradient-to-r from-brand-blue to-blue-400"
								style="width:{overallPct}%; transition: width 0.6s ease;"
							></div>
						</div>
						<div class="flex items-center justify-between mt-1.5 lg:mt-2">
							<span class="text-[10px] lg:text-[11px] text-text-muted">
								{tx('step3.progress.filesCompleted', {
									done: processingState?.filesCompleted ?? 0,
									total: processingState?.totalFiles ?? 0
								})}
							</span>
							<span class="text-[10px] lg:text-[11px] text-text-muted">
								{tx('step3.progress.timeRemaining', { time: `${processingState?.timeRemainingSeconds ?? 0}s` })}
							</span>
						</div>
					</div>

					<!-- File List -->
					<div class="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
						{#each processingState?.files ?? [] as fileState}
							{@const file = getFileById(fileState.fileId)}
							{#if file}
								{#if fileState.status === 'done'}
									<div
										class="flex items-center gap-3 px-3 py-2.5 lg:py-2.5 rounded-xl border border-brand-green/20 cursor-default"
										style="background:rgba(10,22,40,0.6)"
									>
										<div
											class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0"
										>
											<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} text-brand-green text-sm"></i>
										</div>
										<div class="flex-1 min-w-0">
											<p class="text-sm font-medium text-white truncate">{file.name}</p>
											<div class="flex items-center gap-2 mt-0.5">
												<span class="text-[10px] lg:text-[11px] text-text-muted">{file.size}</span>
												<span class="w-1 h-1 rounded-full bg-gray-600"></span>
												<span
													class="text-[10px] lg:text-[11px] text-brand-green font-medium flex items-center gap-1"
												>
													<i class="fa-solid fa-circle-check text-[9px]"></i>
													{#if fileState.gpsRemoved}
														<span class="hidden lg:inline">{tx('step3.files.gpsAndFieldsRemoved', { count: fileState.fieldsRemoved ?? 0 })}</span>
														<span class="inline lg:hidden">{tx('step3.files.gpsAndFieldsRemovedMobile', { count: fileState.fieldsRemoved ?? 0 })}</span>
													{:else}
														{fileState.fieldsRemoved ?? 0} {tx('step3.files.fieldsRemoved')}
													{/if}
												</span>
											</div>
										</div>
										<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
											<span
												class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
												>{file.extension}</span
											>
											<div
												class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center"
											>
												<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
											</div>
										</div>
									</div>
								{:else if fileState.status === 'in_progress'}
									<div
										class="flex items-center gap-3 px-3 py-2.5 lg:py-2.5 rounded-xl border border-brand-blue/30 cursor-default"
										style="background:rgba(59,130,246,0.05)"
									>
										<div
											class="w-9 h-9 rounded-lg {file.type === 'video' ? 'bg-brand-orange/10 border border-brand-orange/20' : 'bg-brand-blue/10 border border-brand-blue/20'} flex items-center justify-center flex-shrink-0"
										>
											<i class="fa-solid {file.type === 'video' ? 'fa-video text-brand-orange' : 'fa-image text-brand-blue'} text-sm"></i>
										</div>
										<div class="flex-1 min-w-0">
											<p class="text-sm font-medium text-white truncate">{file.name}</p>
											<div class="flex flex-col gap-1 mt-1">
												<div class="flex items-center justify-between">
													<span
														class="text-[10px] lg:text-[11px] text-brand-blue font-medium flex items-center gap-1"
													>
														<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i>
														{tx('step3.files.processing')}
													</span>
													<span class="text-[10px] lg:text-[11px] text-brand-blue font-bold">{fileState.progress ?? 0}%</span>
												</div>
												<div class="w-full h-1.5 bg-navy-lighter rounded-full overflow-hidden">
													<div
														class="h-full rounded-full bg-gradient-to-r from-brand-blue to-blue-400"
														style="width:{fileState.progress ?? 0}%"
													></div>
												</div>
											</div>
										</div>
										<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
											<span
												class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
												>{file.extension}</span
											>
											<i class="fa-solid fa-circle-notch spin-slow text-brand-blue text-sm"></i>
										</div>
									</div>
								{:else}
									<div
										class="flex items-center gap-3 px-3 py-2.5 lg:py-2.5 rounded-xl border border-gray-800 cursor-default opacity-50"
										style="background:rgba(10,22,40,0.6)"
									>
										<div
											class="w-9 h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center flex-shrink-0"
										>
											<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} text-brand-blue text-sm"></i>
										</div>
										<div class="flex-1 min-w-0">
											<p class="text-sm font-medium text-white truncate">{file.name}</p>
											<div class="flex items-center gap-2 mt-0.5">
												<span class="text-[10px] lg:text-[11px] text-text-muted">{file.size}</span>
												<span class="w-1 h-1 rounded-full bg-gray-600"></span>
												<span
													class="text-[10px] lg:text-[11px] text-text-muted flex items-center gap-1"
												>
													<i class="fa-solid fa-clock text-[9px]"></i> {tx('step3.files.waitingInQueue')}
												</span>
											</div>
										</div>
										<span
											class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted flex-shrink-0"
											>{file.extension}</span
										>
									</div>
								{/if}
							{/if}
						{/each}
					</div>

					<!-- Action Buttons -->
					<div class="flex gap-3 mt-1">
						<button
							disabled
							class="flex-1 py-3.5 lg:py-3.5 rounded-xl bg-brand-green/40 text-white/50 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
						>
							<i class="fa-solid fa-wand-magic-sparkles"></i> {tx('step1.actions.startCleaning')}
						</button>
						<a
							href="/step4"
							class="px-5 py-3.5 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red font-semibold text-sm hover:bg-brand-red/20 transition-all flex items-center gap-2"
						>
							<i class="fa-solid fa-stop"></i> {tx('step3.actions.stop')}
						</a>
					</div>
					<a
						href="/step5"
						class="text-xs text-text-muted hover:text-brand-green transition-colors flex items-center gap-1 mt-1"
					>
						<i class="fa-solid fa-arrow-right text-[10px]"></i> {tx('step3.actions.orGoToResults')}
					</a>
				</div>
			</div>

			<!-- Right Column (desktop only) — Status Card -->
			<div class="hidden lg:flex flex-col gap-5">
				<div
					class="bg-navy-card rounded-2xl border border-gray-800 p-6 shadow-card flex flex-col gap-5"
				>
					<div class="flex items-center justify-between">
						<h3 class="font-semibold text-lg text-white">{tx('step3.status.title')}</h3>
						<span
							class="text-xs font-bold px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 uppercase tracking-wider flex items-center gap-1.5"
						>
							<i class="fa-solid fa-circle-notch spin-slow text-[10px]"></i>
							{tx('step3.status.inProgress')}
						</span>
					</div>

					<!-- Animated Processing Visual -->
					<div class="flex flex-col items-center justify-center py-4 gap-4">
						<div class="relative flex items-center justify-center">
							<div
								class="pulse-ring absolute w-24 h-24 rounded-full border-2 border-brand-blue/20"
							></div>
							<div
								class="w-20 h-20 rounded-full bg-brand-blue/10 border-2 border-brand-blue/40 flex items-center justify-center"
							>
								<i class="fa-solid fa-shield-halved text-brand-blue text-4xl"></i>
							</div>
							<div
								class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center"
							>
								<i class="fa-solid fa-circle-notch spin-slow text-white text-[10px]"></i>
							</div>
						</div>
						<div class="text-center">
							<p class="font-bold text-white text-base">{tx('step3.status.cleaningInProgress')}</p>
							<p class="text-text-muted text-xs mt-1">
								{tx('step3.status.processingFileLong', { filename: currentFile?.name ?? '' })}
							</p>
						</div>
					</div>

					<!-- Live Stats -->
					<div class="grid grid-cols-3 gap-3 w-full">
						<div class="bg-navy-main/60 rounded-xl p-3 text-center border border-gray-800">
							<p class="text-xl font-black text-white">{processingState?.totalFiles ?? 0}</p>
							<p class="text-[10px] text-text-muted mt-0.5">{tx('common.stats.files')}</p>
						</div>
						<div class="bg-navy-main/60 rounded-xl p-3 text-center border border-brand-green/20">
							<p class="text-xl font-black text-brand-green">{processingState?.fieldsRemoved ?? 0}</p>
							<p class="text-[10px] text-text-muted mt-0.5">{tx('common.stats.fieldsRemoved')}</p>
						</div>
						<div class="bg-navy-main/60 rounded-xl p-3 text-center border border-gray-800">
							<p class="text-xl font-black text-brand-blue">
								{processingState?.filesCompleted ?? 0}<span class="text-sm font-semibold">/{processingState?.totalFiles ?? 0}</span>
							</p>
							<p class="text-[10px] text-text-muted mt-0.5">{tx('step3.stats.done')}</p>
						</div>
					</div>

					<!-- Activity Log -->
					<div class="flex flex-col gap-1">
						<p class="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
							{tx('step3.log.title')}
						</p>
						<div
							class="bg-navy-main/80 rounded-xl border border-gray-800 p-3 flex flex-col gap-1.5 max-h-[160px] overflow-y-auto font-mono"
						>
							{#each processingState?.log ?? [] as entry}
								{@const logFile = getFileById(entry.fileId)}
								{@const logFileState = processingState?.files.find((f) => f.fileId === entry.fileId)}
								<div class="flex items-start gap-2" class:opacity-40={entry.status === 'waiting'}>
									<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">{entry.timestamp}</span>
									{#if entry.status === 'success'}
										<span class="text-[11px] text-brand-green">
											✓ {logFile?.name ?? ''} —
											{#if logFileState?.gpsRemoved}
												{tx('step3.log.gpsSuccess', { count: logFileState.fieldsRemoved ?? 0 })}
											{:else}
												{logFileState?.fieldsRemoved ?? 0} {tx('step3.files.fieldsRemoved')} {entry.detail ?? ''}
											{/if}
										</span>
									{:else if entry.status === 'in_progress'}
										<span class="text-[11px] text-brand-blue flex items-center gap-1">
											<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i>
											{logFile?.name ?? ''} — {tx('step3.log.inProgress', { pct: logFileState?.progress ?? 0 })}
										</span>
									{:else}
										<span class="text-[11px] text-text-muted">{logFile?.name ?? ''} — {tx('step3.log.waiting')}</span>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Mobile: Activity Log accordion -->
		<div
			class="lg:hidden bg-navy-card rounded-2xl border border-gray-800 shadow-card overflow-hidden"
		>
			<button
				onclick={() => (logAccordionOpen = !logAccordionOpen)}
				class="w-full flex items-center justify-between px-4 py-3.5"
			>
				<div class="flex items-center gap-2">
					<i class="fa-solid fa-terminal text-text-muted text-sm"></i>
					<span class="text-sm font-semibold text-white">{tx('step3.log.title')}</span>
				</div>
				<i
					class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform"
					style="transform: {logAccordionOpen ? 'rotate(180deg)' : ''}"
				></i>
			</button>
			{#if logAccordionOpen}
				<div class="px-4 pb-4">
					<div
						class="bg-navy-main/80 rounded-xl border border-gray-800 p-3 flex flex-col gap-1.5 font-mono"
					>
						{#each processingState?.log ?? [] as entry}
							{@const logFile = getFileById(entry.fileId)}
							{@const logFileState = processingState?.files.find((f) => f.fileId === entry.fileId)}
							<div class="flex items-start gap-2" class:opacity-40={entry.status === 'waiting'}>
								<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">{entry.timestamp}</span>
								{#if entry.status === 'success'}
									<span class="text-[11px] text-brand-green">
										✓ {logFile?.name ?? ''} —
										{#if logFileState?.gpsRemoved}
											{tx('step3.files.gpsAndFieldsRemoved', { count: logFileState.fieldsRemoved ?? 0 })}
										{:else}
											{logFileState?.fieldsRemoved ?? 0} {tx('step3.files.fieldsRemoved')} {entry.detail ?? ''}
										{/if}
									</span>
								{:else if entry.status === 'in_progress'}
									<span class="text-[11px] text-brand-blue flex items-center gap-1">
										<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i>
										{logFile?.name ?? ''} — {tx('step3.log.inProgress', { pct: logFileState?.progress ?? 0 })}
									</span>
								{:else}
									<span class="text-[11px] text-text-muted">{logFile?.name ?? ''} — {tx('step3.log.waiting')}</span>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</main>
</div>
