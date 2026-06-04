<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import './layout.css';
	import { currentLocale, switchLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getCurrentUser, type User } from '$lib/repositories/userRepository';
	import { getLanguages, type Language } from '$lib/repositories/languageRepository';

	// Dropdown / sheet state
	let langDropdownOpen = $state(false);
	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);
	let optionsSheetOpen = $state(false);
	let upgradeSheetOpen = $state(false);

	// Files
	let uploadedFiles = $state<File[]>([]);
	let hasFiles = $derived(uploadedFiles.length > 0);

	// Repository data
	let langOptions = $state<Language[]>([]);
	let user = $state<User | null>(null);

	let currentLangInfo = $derived(langOptions.find((l) => l.code === currentLocale) ?? langOptions[0]);

	// Translation helper — reads currentLocale so template expressions re-run on locale switch
	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale; // reactive dependency
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	function setLang(lang: string) {
		switchLocale(lang);
		langDropdownOpen = false;
		hamburgerMenuOpen = false;
	}

	function addFiles(fileList: FileList | null | undefined) {
		if (!fileList || fileList.length === 0) return;
		uploadedFiles = [...uploadedFiles, ...Array.from(fileList)];
	}

	function handleFileInput(e: Event) {
		addFiles((e.target as HTMLInputElement).files);
		(e.target as HTMLInputElement).value = '';
	}

	function clearFiles() {
		uploadedFiles = [];
	}

	function removeFile(index: number) {
		uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	}

	function getFileIconClass(file: File): string {
		if (file.type.startsWith('video/')) return 'fa-file-video text-brand-orange';
		return 'fa-file-image text-brand-blue';
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		addFiles(e.dataTransfer?.files);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleClickOutside(e: MouseEvent) {
		const t = e.target as Element;
		if (!t.closest('#langDropdown')) langDropdownOpen = false;
		if (!t.closest('#userDropdown')) userDropdownOpen = false;
		if (!t.closest('#hamburgerDropdown')) hamburgerMenuOpen = false;
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		getLanguages().then((langs) => {
			langOptions = langs;
		});
		getCurrentUser().then((u) => {
			user = u;
		});
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<svelte:head>
	<title>{tx('step1.meta.title')}</title>
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
			<div class="flex items-center gap-2.5 lg:gap-3">
				<div
					class="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
				>
					<i class="fa-solid fa-shield-halved text-base lg:text-xl"></i>
				</div>
				<span class="text-lg lg:text-xl font-bold tracking-tight">{tx('common.brandName')}</span>
			</div>

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
						<div class="lang-option lang-option-danger" role="button" tabindex="0">
							<i class="fa-solid fa-right-from-bracket text-sm text-brand-red"></i>
							<span>{tx('common.nav.logout')}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</nav>

	<!-- App Main -->
	<main class="w-full max-w-[1100px] mx-auto px-4 lg:px-6 pb-24 flex flex-col gap-4 lg:gap-6 mt-4 lg:mt-0">
		<!-- Page Header -->
		<div class="flex flex-col gap-1 mb-0 lg:mb-2">
			<h1 class="text-2xl lg:text-3xl font-bold text-white">{tx('step1.header.title')}</h1>
			<p class="text-text-muted text-sm mt-1">
				{tx('step1.header.description')}
			</p>
		</div>

		<!-- Main Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-[55%_43%] gap-4 lg:gap-6">
			<!-- Left Column -->
			<div class="flex flex-col gap-4 lg:gap-5">
				<!-- Upload Zone Card -->
				<div
					class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 flex flex-col gap-4 shadow-card"
				>
					<div class="flex items-center justify-between">
						<h3 class="font-semibold text-base lg:text-lg text-white">{tx('step1.upload.title')}</h3>
						<div class="flex gap-1 lg:gap-1.5 flex-wrap justify-end">
							{#each ['JPG', 'PNG', 'HEIC', 'MP4', 'MOV'] as ext}
								<span
									class="px-1.5 lg:px-2 py-0.5 lg:py-1 rounded bg-navy-lighter text-[9px] lg:text-[10px] font-bold text-white uppercase"
									>{ext}</span
								>
							{/each}
						</div>
					</div>

					<!-- Drop Zone -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="dashed-border-anim rounded-xl bg-navy-main/50 flex flex-col items-center justify-center gap-3 lg:gap-4 cursor-pointer hover:bg-navy-main/80 transition-colors py-8 lg:py-12 relative"
						onclick={() => document.getElementById('fileInput')?.click()}
						ondrop={handleDrop}
						ondragover={handleDragOver}
					>
						<div
							class="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-navy-lighter flex items-center justify-center text-brand-blue text-xl lg:text-2xl shadow-glow-blue"
						>
							<i class="fa-solid fa-file-arrow-up"></i>
						</div>
						<div class="text-center">
							<p class="hidden lg:block font-semibold text-white mb-1">
								{tx('step1.upload.dropDesktop')}
							</p>
							<p class="block lg:hidden font-semibold text-white text-sm mb-0.5">
								{tx('step1.upload.dropMobile')}
							</p>
							<p class="hidden lg:block text-xs text-text-muted">
								{tx('step1.upload.orClickDesktop')}
							</p>
							<p class="block lg:hidden text-xs text-text-muted">{tx('step1.upload.orDragMobile')}</p>
						</div>
						<div class="flex flex-wrap gap-1.5 lg:gap-2 justify-center mt-0 lg:mt-1">
							<span
								class="text-[10px] lg:text-[11px] text-text-muted bg-navy-lighter px-2.5 lg:px-3 py-1 rounded-full"
								>{tx('step1.upload.photos')}</span
							>
							<span
								class="text-[10px] lg:text-[11px] text-text-muted bg-navy-lighter px-2.5 lg:px-3 py-1 rounded-full"
								>{tx('step1.upload.videos')}</span
							>
							<span
								class="text-[10px] lg:text-[11px] text-text-muted bg-navy-lighter px-2.5 lg:px-3 py-1 rounded-full"
							>
								<span class="hidden lg:inline">{tx('step1.upload.maxSize')}</span>
								<span class="inline lg:hidden">{tx('step1.upload.maxSizeMobile')}</span>
							</span>
						</div>
						<input
							type="file"
							id="fileInput"
							multiple
							accept="image/*,video/*"
							onchange={handleFileInput}
							class="hidden"
						/>
					</div>

					<!-- File List -->
					{#if hasFiles}
						<div class="flex flex-col gap-2">
							<div class="flex items-center justify-between mb-1">
								<span class="text-sm font-semibold text-white">{tx('step1.files.title')}</span>
								<button
									onclick={clearFiles}
									class="text-xs text-text-muted hover:text-brand-red transition-colors flex items-center gap-1 min-h-[44px] lg:min-h-0 px-2 lg:px-0"
								>
									<i class="fa-solid fa-trash mr-1 lg:mr-0"></i>{tx('step1.files.clearAll')}
								</button>
							</div>
							<div class="flex flex-col gap-2 max-h-[180px] lg:max-h-[220px] overflow-y-auto pr-1">
								{#each uploadedFiles as file, i}
									<div
										class="group flex items-center gap-3 bg-navy-main/60 rounded-xl px-3 py-2.5 border border-gray-800 hover:bg-navy-lighter transition-colors"
									>
										<div
											class="w-8 h-8 rounded-lg bg-navy-card flex items-center justify-center text-sm"
										>
											<i class="fa-solid {getFileIconClass(file)}"></i>
										</div>
										<div class="flex-1 min-w-0">
											<p class="text-xs font-semibold text-white truncate">{file.name}</p>
											<p class="text-[10px] text-text-muted">{formatSize(file.size)}</p>
										</div>
										<button
											onclick={() => removeFile(i)}
											class="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-navy-lighter text-text-muted hover:text-white hover:bg-gray-700 transition-all"
										>
											<i class="fa-solid fa-xmark text-xs"></i>
										</button>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Action Buttons -->
					<div class="flex flex-col lg:flex-row gap-2.5 lg:gap-3 mt-1">
						<button
							disabled={!hasFiles}
							onclick={() => hasFiles && goto('/step2')}
							class="flex-1 py-3.5 lg:py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
							{hasFiles
								? 'bg-brand-green text-white hover:bg-green-500 shadow-glow-green cursor-pointer'
								: 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60'}"
						>
							<i class="fa-solid fa-wand-magic-sparkles"></i> {tx('step1.actions.startCleaning')}
						</button>
						<button
							onclick={() => (optionsSheetOpen = true)}
							class="lg:px-5 py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
						>
							<i class="fa-solid fa-sliders"></i> {tx('step1.actions.options')}
						</button>
					</div>
				</div>
			</div>

			<!-- Right Column -->
			<div class="flex flex-col gap-4 lg:gap-5">
				<!-- Status Card -->
				<div
					class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 shadow-card flex flex-col gap-4 lg:gap-5"
				>
					<div class="flex items-center justify-between">
						<h3 class="font-semibold text-base lg:text-lg text-white">{tx('step1.status.title')}</h3>
						<span
							class="text-[10px] lg:text-xs font-bold px-2.5 lg:px-3 py-1 rounded-full bg-navy-lighter text-text-muted uppercase tracking-wider"
						>
							{tx('step1.status.waitingForFiles')}
						</span>
					</div>

					<!-- Idle State -->
					<div class="flex flex-col items-center justify-center py-6 lg:py-8 gap-3 lg:gap-4">
						<div
							class="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-navy-lighter flex items-center justify-center"
						>
							<i class="fa-solid fa-shield-halved text-3xl lg:text-4xl text-gray-700"></i>
						</div>
						<div class="text-center">
							<p class="text-text-muted text-sm">
								{tx('step1.status.uploadPrompt')}
							</p>
						</div>
					</div>

					<!-- Processing State (hidden - shown during processing) -->
					<div class="hidden flex-col gap-4 lg:gap-5">
						<div class="flex flex-col items-center gap-3 lg:gap-4 py-3 lg:py-4">
							<div
								class="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-brand-blue/10 border-2 border-brand-blue/30 flex items-center justify-center relative"
							>
								<i class="fa-solid fa-gear text-brand-blue text-2xl lg:text-3xl spin-slow"></i>
							</div>
							<div class="text-center">
								<p class="font-semibold text-white text-sm">{tx('step1.status.processingFiles')}</p>
								<p class="text-xs text-text-muted mt-0.5 lg:mt-1">{tx('step1.status.removingMetadata')}</p>
							</div>
						</div>
						<div class="flex flex-col gap-2">
							<div class="flex justify-between text-xs text-text-muted mb-1 lg:mb-0">
								<span>{tx('step1.status.progress')}</span><span>0%</span>
							</div>
							<div class="h-2 lg:h-2 rounded-full bg-navy-lighter overflow-hidden">
								<div class="progress-bar h-2" style="width:0%"></div>
							</div>
						</div>
					</div>

					<!-- Done State (hidden - shown when complete) -->
					<div class="hidden flex-col gap-3 lg:gap-4">
						<div class="flex flex-col items-center gap-3 py-3 lg:py-4">
							<div
								class="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-brand-green/10 border-2 border-brand-green/30 flex items-center justify-center"
							>
								<i class="fa-solid fa-circle-check text-brand-green text-3xl lg:text-4xl"></i>
							</div>
							<div class="text-center">
								<p class="font-bold text-white text-lg">{tx('step1.status.done')}</p>
								<p class="text-xs text-text-muted mt-0.5 lg:mt-1">
									{tx('step1.status.allRemoved')}
								</p>
							</div>
						</div>
						<div class="grid grid-cols-3 gap-2 lg:gap-3">
							<div
								class="bg-navy-main/60 rounded-xl p-3 text-center border border-gray-800"
							>
								<p class="text-xl font-black text-white">0</p>
								<p class="text-[10px] text-text-muted mt-0.5">{tx('common.stats.files')}</p>
							</div>
							<div
								class="bg-navy-main/60 rounded-xl p-3 text-center border border-gray-800"
							>
								<p class="text-xl font-black text-brand-green">0</p>
								<p class="text-[10px] text-text-muted mt-0.5">{tx('common.stats.fieldsRemoved')}</p>
							</div>
							<div
								class="bg-navy-main/60 rounded-xl p-3 text-center border border-gray-800"
							>
								<p class="text-xl font-black text-brand-blue">0s</p>
								<p class="text-[10px] text-text-muted mt-0.5">{tx('common.stats.time')}</p>
							</div>
						</div>
						<button
							class="w-full py-3.5 lg:py-3.5 rounded-xl bg-brand-green text-white font-bold text-sm hover:bg-green-500 transition-all shadow-glow-green flex items-center justify-center gap-2"
						>
							<i class="fa-solid fa-download"></i> {tx('step1.actions.download')}
						</button>
						<button
							class="w-full py-3 rounded-xl bg-navy-lighter border border-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
						>
							<i class="fa-solid fa-rotate-left"></i> {tx('step1.actions.processMore')}
						</button>
					</div>
				</div>
			</div>
		</div>
	</main>

	<!-- Options Sheet Overlay -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="sheet-overlay"
		class:open={optionsSheetOpen}
		onclick={() => (optionsSheetOpen = false)}
	></div>

	<!-- Options Bottom Sheet -->
	<div class="bottom-sheet" class:open={optionsSheetOpen}>
		<div class="flex flex-col gap-0">
			<div class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-800">
				<h3 class="font-bold text-white text-base">{tx('options.title')}</h3>
				<button
					onclick={() => (optionsSheetOpen = false)}
					class="w-10 h-10 flex items-center justify-center rounded-full bg-navy-lighter text-text-muted"
				>
					<i class="fa-solid fa-xmark"></i>
				</button>
			</div>
			<div class="px-5 py-4 flex flex-col gap-4">
				<div class="flex items-center justify-between py-2">
					<div>
						<p class="text-sm font-semibold text-white">{tx('options.gpsLocation')}</p>
						<p class="text-xs text-text-muted mt-0.5">{tx('options.gpsDesc')}</p>
					</div>
					<div
						class="w-12 h-6 bg-brand-blue rounded-full relative cursor-pointer flex items-center px-1"
					>
						<div class="w-4 h-4 bg-white rounded-full ml-auto"></div>
					</div>
				</div>
				<div class="flex items-center justify-between py-2">
					<div>
						<p class="text-sm font-semibold text-white">{tx('options.dateTime')}</p>
						<p class="text-xs text-text-muted mt-0.5">{tx('options.dateTimeDesc')}</p>
					</div>
					<div
						class="w-12 h-6 bg-brand-blue rounded-full relative cursor-pointer flex items-center px-1"
					>
						<div class="w-4 h-4 bg-white rounded-full ml-auto"></div>
					</div>
				</div>
				<div class="flex items-center justify-between py-2">
					<div>
						<p class="text-sm font-semibold text-white">{tx('options.deviceInfo')}</p>
						<p class="text-xs text-text-muted mt-0.5">{tx('options.deviceInfoDesc')}</p>
					</div>
					<div
						class="w-12 h-6 bg-brand-blue rounded-full relative cursor-pointer flex items-center px-1"
					>
						<div class="w-4 h-4 bg-white rounded-full ml-auto"></div>
					</div>
				</div>
				<div class="flex items-center justify-between py-2">
					<div>
						<p class="text-sm font-semibold text-white">{tx('options.comments')}</p>
						<p class="text-xs text-text-muted mt-0.5">{tx('options.commentsDesc')}</p>
					</div>
					<div
						class="w-12 h-6 bg-navy-lighter border border-gray-600 rounded-full relative cursor-pointer flex items-center px-1"
					>
						<div class="w-4 h-4 bg-gray-500 rounded-full"></div>
					</div>
				</div>
			</div>
			<div class="px-5 pb-6 pt-2">
				<button
					onclick={() => (optionsSheetOpen = false)}
					class="w-full py-4 rounded-xl bg-brand-blue text-white font-bold text-sm flex items-center justify-center gap-2"
				>
					<i class="fa-solid fa-check"></i> {tx('options.save')}
				</button>
			</div>
		</div>
	</div>

	<!-- Upgrade Sheet Overlay -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="sheet-overlay"
		class:open={upgradeSheetOpen}
		onclick={() => (upgradeSheetOpen = false)}
	></div>

	<!-- Upgrade Bottom Sheet -->
	<div class="bottom-sheet" class:open={upgradeSheetOpen}>
		<div class="flex flex-col">
			<div class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-800">
				<h3 class="font-bold text-white text-base">{tx('upgrade.title')}</h3>
				<button
					onclick={() => (upgradeSheetOpen = false)}
					class="w-10 h-10 flex items-center justify-center rounded-full bg-navy-lighter text-text-muted"
				>
					<i class="fa-solid fa-xmark"></i>
				</button>
			</div>
			<div class="px-5 pt-4 pb-2">
				<!-- Current Plan -->
				<div
					class="bg-navy-main/60 rounded-xl p-3.5 border border-gray-700 flex items-center gap-3 mb-4"
				>
					<div class="w-9 h-9 rounded-lg bg-navy-lighter flex items-center justify-center">
						<i class="fa-solid fa-bolt text-text-muted text-sm"></i>
					</div>
					<div class="flex-1">
						<p class="text-xs font-bold text-text-muted uppercase tracking-wider">{tx('upgrade.currentPlan')}</p>
						<p class="text-sm font-semibold text-white mt-0.5">{tx('upgrade.free')}</p>
					</div>
					<span class="text-xs text-text-muted bg-navy-lighter px-2 py-1 rounded-full">{tx('upgrade.active')}</span>
				</div>
				<!-- Pro Plan Card -->
				<div
					class="bg-gradient-to-br from-brand-orange/10 to-brand-orange/5 rounded-xl p-4 border border-brand-orange/40 flex flex-col gap-3 mb-4"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<div
								class="w-9 h-9 rounded-lg bg-brand-orange/20 flex items-center justify-center"
							>
								<i class="fa-solid fa-crown text-brand-orange text-sm"></i>
							</div>
							<div>
								<p class="text-sm font-bold text-white">{tx('upgrade.pro')}</p>
								<p class="text-[10px] text-text-muted">{tx('upgrade.fullAccess')}</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-lg font-black text-white">{tx('upgrade.price')}</p>
							<p class="text-[10px] text-text-muted">{tx('upgrade.perMonth')}</p>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						{#each [
							tx('upgrade.features.unlimitedFiles'),
							tx('upgrade.features.largeFiles'),
							tx('upgrade.features.batchProcessing'),
							tx('upgrade.features.prioritySupport')
						] as feature}
							<div class="flex items-center gap-2">
								<i class="fa-solid fa-check text-brand-green text-xs w-4"></i>
								<span class="text-xs text-text-muted">{feature}</span>
							</div>
						{/each}
					</div>
				</div>
				<!-- Free limits -->
				<div class="flex flex-col gap-1.5 mb-4">
					<p class="text-[10px] text-text-muted uppercase tracking-wider font-bold">
						{tx('upgrade.freeLimits')}
					</p>
					<div class="flex items-center gap-2">
						<i class="fa-solid fa-xmark text-brand-red text-xs w-4"></i>
						<span class="text-xs text-text-muted">{tx('upgrade.limit.maxFilesDay')}</span>
					</div>
					<div class="flex items-center gap-2">
						<i class="fa-solid fa-xmark text-brand-red text-xs w-4"></i>
						<span class="text-xs text-text-muted">{tx('upgrade.limit.maxFileSize')}</span>
					</div>
				</div>
			</div>
			<div class="px-5 pb-6 pt-2 flex flex-col gap-2">
				<button
					onclick={() => (upgradeSheetOpen = false)}
					class="w-full py-4 rounded-xl bg-brand-orange text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
				>
					<i class="fa-solid fa-crown"></i> {tx('upgrade.cta')}
				</button>
				<button
					onclick={() => (upgradeSheetOpen = false)}
					class="w-full py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm flex items-center justify-center gap-2"
				>
					{tx('upgrade.stayFree')}
				</button>
			</div>
		</div>
	</div>
</div>
