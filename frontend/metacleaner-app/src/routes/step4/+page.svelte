<script lang="ts">
	import '../layout.css';
	import { onMount } from 'svelte';

	let langDropdownOpen = $state(false);
	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);

	let detailAccordionOpen = $state(true);
	let typeAccordionOpen = $state(true);
	let logAccordionOpen = $state(true);

	let bannerVisible = $state(true);
	let selectedErrorType = $state('cleaning');

	let currentLang = $state('cs');
	const langOptions = [
		{ code: 'cs', flag: '🇨🇿', label: 'CS', name: 'Čeština' },
		{ code: 'en', flag: '🇬🇧', label: 'EN', name: 'English' },
		{ code: 'de', flag: '🇩🇪', label: 'DE', name: 'Deutsch' },
		{ code: 'sk', flag: '🇸🇰', label: 'SK', name: 'Slovenčina' }
	];
	let currentLangInfo = $derived(langOptions.find((l) => l.code === currentLang) ?? langOptions[0]);

	function setLang(lang: string) {
		currentLang = lang;
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
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<svelte:head>
	<title>MetaCleaner — Chyba zpracování</title>
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
				<span class="text-lg lg:text-xl font-bold tracking-tight">MetaCleaner</span>
			</a>

			<!-- Desktop right side -->
			<div class="hidden lg:flex items-center gap-3">
				<div id="langDropdown" class="relative inline-block">
					<button
						onclick={() => (langDropdownOpen = !langDropdownOpen)}
						class="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-lighter border border-gray-700 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
					>
						<span>{currentLangInfo.flag}</span>
						<span>{currentLangInfo.label}</span>
						<i
							class="fa-solid fa-chevron-down text-text-muted text-xs ml-1 transition-transform"
							style="transform: {langDropdownOpen ? 'rotate(180deg)' : 'none'}"
						></i>
					</button>
					<div class="lang-dropdown-menu" class:open={langDropdownOpen} style="min-width:160px">
						{#each langOptions as lang}
							<div
								class="lang-option"
								class:active={currentLang === lang.code}
								onclick={() => setLang(lang.code)}
								role="button"
								tabindex="0"
							>
								<span>{lang.flag}</span>
								{lang.name}
								{#if currentLang === lang.code}
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
						<span class="hidden md:block">Jana Nováková</span>
						<i
							class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform"
							style="transform: {userDropdownOpen ? 'rotate(180deg)' : 'none'}"
						></i>
					</button>
					<div class="lang-dropdown-menu" class:open={userDropdownOpen} style="min-width:200px">
						<div class="px-4 py-3 border-b border-gray-700">
							<p class="text-xs text-text-muted">Přihlášen jako</p>
							<p class="text-sm font-semibold text-white mt-0.5">jana.novakova@email.cz</p>
						</div>
						<div class="lang-option" role="button" tabindex="0">
							<i class="fa-solid fa-gear text-text-muted text-sm"></i>
							<span>Nastavení</span>
						</div>
						<div class="lang-option" style="color:#ef4444" role="button" tabindex="0">
							<i class="fa-solid fa-right-from-bracket text-sm" style="color:#ef4444"></i>
							<span>Odhlásit se</span>
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
							<p class="text-xs text-text-muted">Přihlášen jako</p>
							<p class="text-sm font-semibold text-white mt-0.5 truncate">jana.novakova@email.cz</p>
						</div>
						<div class="px-4 py-2 border-b border-gray-700">
							<p class="text-[10px] text-text-muted uppercase tracking-wider mb-1">Jazyk</p>
							<div class="flex flex-col gap-0.5">
								{#each langOptions as lang}
									<div
										class="lang-option rounded-lg"
										class:active={currentLang === lang.code}
										onclick={() => setLang(lang.code)}
										role="button"
										tabindex="0"
									>
										<span>{lang.flag}</span>
										{lang.name}
										{#if currentLang === lang.code}
											<span class="lang-check"><i class="fa-solid fa-check text-xs"></i></span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
						<div class="lang-option" role="button" tabindex="0">
							<i class="fa-solid fa-gear text-text-muted text-sm"></i>
							<span>Nastavení</span>
						</div>
						<div class="lang-option" style="color:#ef4444" role="button" tabindex="0">
							<i class="fa-solid fa-right-from-bracket text-sm" style="color:#ef4444"></i>
							<span>Odhlásit se</span>
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
					<h1 class="text-2xl lg:text-3xl font-bold text-white">Čištění metadat</h1>
					<p class="text-text-muted text-sm mt-1">Nahrajte soubory a odstraňte skrytá metadata lokálně na vašem zařízení.</p>
				</div>
				<div class="flex items-center gap-2 bg-navy-card border border-red-800/50 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 self-start sm:self-auto">
					<div class="w-2 h-2 rounded-full bg-brand-red"></div>
					<span class="text-[10px] lg:text-xs font-semibold text-brand-red">
						<span class="hidden lg:inline">Chyba zpracování</span>
						<span class="inline lg:hidden">Chyba</span>
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
						<p class="text-sm font-bold text-white">Proces čištění selhal</p>
						<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-red/20 text-brand-red border border-brand-red/30 tracking-wider">ERR_CLEANING_FAILED</span>
					</div>
					<p class="text-xs text-text-muted mt-1 leading-relaxed">
						<span class="hidden lg:inline">Během zpracování souborů došlo k neočekávané chybě. Část souborů nebyla vyčištěna. Zkuste akci opakovat nebo kontaktujte podporu.</span>
						<span class="inline lg:hidden">Část souborů nebyla vyčištěna. Zkuste akci opakovat.</span>
					</p>
				</div>
				<button
					onclick={() => (bannerVisible = false)}
					class="flex-shrink-0 text-text-muted hover:text-white transition-colors mt-0.5 p-1"
					aria-label="Zavřít"
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
				<p class="font-bold text-white text-sm">Čištění metadat selhalo</p>
				<p class="text-text-muted text-xs mt-1 leading-relaxed">
					Soubor <span class="text-brand-red font-semibold">video_prague_walk.mp4</span> nebylo možné zpracovat.
				</p>
			</div>
			<div class="w-full bg-navy-main/60 rounded-xl p-3 border border-red-900/30">
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-semibold text-text-muted">Celkový průběh</span>
					<span class="text-xs font-bold text-brand-red">Přerušeno</span>
				</div>
				<div class="w-full h-2 bg-navy-lighter rounded-full overflow-hidden">
					<div class="h-full rounded-full bg-gradient-to-r from-brand-red to-red-400" style="width:62%"></div>
				</div>
				<div class="flex items-center justify-between mt-2">
					<span class="text-[11px] text-text-muted">2 z 4 souborů dokončeno</span>
					<span class="text-[11px] text-brand-red font-medium flex items-center gap-1">
						<i class="fa-solid fa-circle-xmark text-[9px]"></i> Selhalo
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
						<h3 class="font-semibold text-base lg:text-lg text-white">Soubory ke zpracování</h3>
						<span class="text-[10px] lg:text-xs font-bold px-2.5 lg:px-3 py-1 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase tracking-wider flex items-center gap-1.5">
							<i class="fa-solid fa-circle-xmark text-[10px]"></i> Chyba
						</span>
					</div>

					<!-- Overall Progress - Failed (desktop only) -->
					<div class="hidden lg:block bg-navy-main/60 rounded-xl p-4 border border-red-900/30">
						<div class="flex items-center justify-between mb-2">
							<span class="text-xs font-semibold text-text-muted">Celkový průběh</span>
							<span class="text-xs font-bold text-brand-red">Přerušeno</span>
						</div>
						<div class="w-full h-2.5 bg-navy-lighter rounded-full overflow-hidden">
							<div class="h-full rounded-full bg-gradient-to-r from-brand-red to-red-400" style="width:62%"></div>
						</div>
						<div class="flex items-center justify-between mt-2">
							<span class="text-[11px] text-text-muted">2 z 4 souborů dokončeno</span>
							<span class="text-[11px] text-brand-red font-medium flex items-center gap-1">
								<i class="fa-solid fa-circle-xmark text-[9px]"></i> Zpracování selhalo
							</span>
						</div>
					</div>

					<!-- File List -->
					<div class="flex flex-col gap-2 lg:max-h-[320px] lg:overflow-y-auto pr-1">
						<!-- File 1 - Done -->
						<div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-main/60 border border-brand-green/20 cursor-default">
							<div class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
								<i class="fa-solid fa-image text-brand-green text-sm"></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-white truncate">IMG_4821.jpg</p>
								<div class="flex items-center gap-1.5 lg:gap-2 mt-0.5">
									<span class="text-[10px] lg:text-[11px] text-text-muted">3.2 MB</span>
									<span class="w-1 h-1 rounded-full bg-gray-600"></span>
									<span class="text-[10px] lg:text-[11px] text-brand-green font-medium flex items-center gap-1">
										<i class="fa-solid fa-circle-check text-[9px]"></i>
										<span class="hidden lg:inline">12 polí odstraněno</span>
										<span class="inline lg:hidden">12 polí</span>
									</span>
								</div>
							</div>
							<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
								<span class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted">JPG</span>
								<div class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
									<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
								</div>
							</div>
						</div>

						<!-- File 2 - Done -->
						<div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-main/60 border border-brand-green/20 cursor-default">
							<div class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
								<i class="fa-solid fa-image text-brand-green text-sm"></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-white truncate">photo_holiday_2024.heic</p>
								<div class="flex items-center gap-1.5 lg:gap-2 mt-0.5">
									<span class="text-[10px] lg:text-[11px] text-text-muted">8.7 MB</span>
									<span class="w-1 h-1 rounded-full bg-gray-600"></span>
									<span class="text-[10px] lg:text-[11px] text-brand-green font-medium flex items-center gap-1">
										<i class="fa-solid fa-circle-check text-[9px]"></i>
										<span class="hidden lg:inline">GPS + 18 polí odstraněno</span>
										<span class="inline lg:hidden">GPS+18</span>
									</span>
								</div>
							</div>
							<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
								<span class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted">HEIC</span>
								<div class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
									<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
								</div>
							</div>
						</div>

						<!-- File 3 - Failed -->
						<div class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-brand-red/30 cursor-default" style="background:rgba(239,68,68,0.05)">
							<div class="w-9 h-9 rounded-lg bg-brand-red/10 border border-brand-red/20 flex items-center justify-center flex-shrink-0">
								<i class="fa-solid fa-video text-brand-red text-sm"></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-white truncate">video_prague_walk.mp4</p>
								<div class="flex items-center gap-1.5 lg:gap-2 mt-0.5">
									<span class="text-[10px] lg:text-[11px] text-text-muted">247 MB</span>
									<span class="w-1 h-1 rounded-full bg-gray-600"></span>
									<span class="text-[10px] lg:text-[11px] text-brand-red font-medium flex items-center gap-1">
										<i class="fa-solid fa-circle-xmark text-[9px]"></i>
										<span class="hidden lg:inline">Zpracování selhalo</span>
										<span class="inline lg:hidden">Selhalo</span>
									</span>
								</div>
							</div>
							<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
								<span class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted">MP4</span>
								<div class="w-6 h-6 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center">
									<i class="fa-solid fa-xmark text-brand-red text-[10px]"></i>
								</div>
							</div>
						</div>

						<!-- File 4 - Skipped -->
						<div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-main/60 border border-gray-800 cursor-default opacity-50">
							<div class="w-9 h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center flex-shrink-0">
								<i class="fa-solid fa-image text-brand-blue text-sm"></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-white truncate">screenshot_map.png</p>
								<div class="flex items-center gap-1.5 lg:gap-2 mt-0.5">
									<span class="text-[10px] lg:text-[11px] text-text-muted">1.1 MB</span>
									<span class="w-1 h-1 rounded-full bg-gray-600"></span>
									<span class="text-[10px] lg:text-[11px] text-text-muted flex items-center gap-1">
										<i class="fa-solid fa-ban text-[9px]"></i> Přeskočeno
									</span>
								</div>
							</div>
							<span class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted flex-shrink-0">PNG</span>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="flex gap-3 mt-1">
						<button class="flex-1 py-3.5 rounded-xl bg-brand-green hover:bg-green-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-glow-green">
							<i class="fa-solid fa-rotate-right"></i> Zkusit znovu
						</button>
						<button class="px-4 lg:px-5 py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm hover:bg-gray-800 hover:text-white transition-all flex items-center gap-2">
							<i class="fa-solid fa-trash"></i>
							<span class="hidden lg:inline">Vymazat vše</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Right Column (desktop only) — Error State Card -->
			<div class="hidden lg:flex flex-col gap-5">
				<div class="bg-navy-card rounded-2xl border border-gray-800 p-6 shadow-card flex flex-col gap-5">
					<div class="flex items-center justify-between">
						<h3 class="font-semibold text-lg text-white">Stav zpracování</h3>
						<span class="text-xs font-bold px-3 py-1 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase tracking-wider flex items-center gap-1.5">
							<i class="fa-solid fa-circle-xmark text-[10px]"></i> Chyba
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
							<p class="font-bold text-white text-base">Čištění metadat selhalo</p>
							<p class="text-text-muted text-xs mt-1 max-w-[220px] mx-auto leading-relaxed">
								Soubor <span class="text-brand-red font-semibold">video_prague_walk.mp4</span> nebylo možné zpracovat.
							</p>
						</div>
					</div>

					<!-- Error Detail Box -->
					<div class="bg-navy-main/80 rounded-xl border border-brand-red/20 p-4 flex flex-col gap-3">
						<div class="flex items-center justify-between">
							<p class="text-xs font-semibold text-text-muted uppercase tracking-wider">Detail chyby</p>
							<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-red/15 text-brand-red border border-brand-red/25 tracking-wider">ERR_CLEANING_FAILED</span>
						</div>
						<div class="flex flex-col gap-2">
							<div class="flex items-start gap-2.5">
								<i class="fa-solid fa-circle-info text-text-muted text-xs mt-0.5 flex-shrink-0"></i>
								<p class="text-xs text-text-muted leading-relaxed">Proces čištění metadat byl přerušen z důvodu interní chyby. Soubor může být poškozený nebo v nepodporovaném formátu.</p>
							</div>
							<div class="h-px bg-gray-800 my-1"></div>
							<div class="grid grid-cols-2 gap-2">
								<div class="flex flex-col gap-0.5">
									<span class="text-[10px] text-text-muted uppercase tracking-wider">Kód chyby</span>
									<span class="text-xs font-mono font-semibold text-white">0x0032A</span>
								</div>
								<div class="flex flex-col gap-0.5">
									<span class="text-[10px] text-text-muted uppercase tracking-wider">Čas výskytu</span>
									<span class="text-xs font-mono font-semibold text-white">12:04:17</span>
								</div>
								<div class="flex flex-col gap-0.5">
									<span class="text-[10px] text-text-muted uppercase tracking-wider">Soubor</span>
									<span class="text-xs font-mono font-semibold text-white truncate">video_prague_walk.mp4</span>
								</div>
								<div class="flex flex-col gap-0.5">
									<span class="text-[10px] text-text-muted uppercase tracking-wider">Fáze</span>
									<span class="text-xs font-mono font-semibold text-white">metadata_strip</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Error Type Selector -->
					<div class="flex flex-col gap-2">
						<p class="text-xs font-semibold text-text-muted uppercase tracking-wider">Typ chyby</p>
						<div class="flex flex-col gap-1.5">
							{#each [
								{ id: 'cleaning', icon: 'fa-circle-xmark', title: 'Cleaning Process Failed', desc: 'Interní chyba při čištění metadat' },
								{ id: 'connection', icon: 'fa-wifi', title: 'Connection Error', desc: 'Ztráta spojení se serverem' },
								{ id: 'timeout', icon: 'fa-clock', title: 'Timeout', desc: 'Operace překročila časový limit' }
							] as errType}
								<button
									onclick={() => (selectedErrorType = errType.id)}
									class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all w-full"
									style="border:1px solid {selectedErrorType === errType.id ? 'rgba(239,68,68,0.3)' : 'rgba(55,65,81,1)'}; background:{selectedErrorType === errType.id ? 'rgba(239,68,68,0.1)' : 'rgba(10,22,40,0.6)'}"
								>
									<div
										class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
										style="border:1px solid {selectedErrorType === errType.id ? 'rgba(239,68,68,0.25)' : '#374151'}; background:{selectedErrorType === errType.id ? 'rgba(239,68,68,0.15)' : '#1e293b'}"
									>
										<i
											class="fa-solid {errType.icon} text-xs"
											style="color:{selectedErrorType === errType.id ? '#ef4444' : '#94a3b8'}"
										></i>
									</div>
									<div class="flex-1 min-w-0">
										<p class="text-xs font-semibold" style="color:{selectedErrorType === errType.id ? '#fff' : '#94a3b8'}">{errType.title}</p>
										<p class="text-[10px] text-text-muted">{errType.desc}</p>
									</div>
									<i
										class="fa-solid text-xs"
										class:fa-circle-dot={selectedErrorType === errType.id}
										class:fa-circle={selectedErrorType !== errType.id}
										style="color:{selectedErrorType === errType.id ? '#ef4444' : '#374151'}"
									></i>
								</button>
							{/each}
						</div>
					</div>

					<!-- Error Log -->
					<div class="flex flex-col gap-1">
						<p class="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">Log chyby</p>
						<div class="bg-navy-main/80 rounded-xl border border-gray-800 p-3 flex flex-col gap-1.5 max-h-[130px] overflow-y-auto font-mono">
							<div class="flex items-start gap-2">
								<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:01</span>
								<span class="text-[11px] text-brand-green">✓ IMG_4821.jpg — 12 polí odstraněno</span>
							</div>
							<div class="flex items-start gap-2">
								<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:09</span>
								<span class="text-[11px] text-brand-green">✓ photo_holiday_2024.heic — GPS + 18 polí odstraněno</span>
							</div>
							<div class="flex items-start gap-2">
								<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:17</span>
								<span class="text-[11px] text-brand-red">✗ video_prague_walk.mp4 — ERR_CLEANING_FAILED</span>
							</div>
							<div class="flex items-start gap-2 opacity-40">
								<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:17</span>
								<span class="text-[11px] text-text-muted">screenshot_map.png — přeskočeno</span>
							</div>
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
					<span class="font-semibold text-sm text-white">Detail chyby</span>
					<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-red/15 text-brand-red border border-brand-red/25 tracking-wider">ERR_CLEANING_FAILED</span>
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
						<p class="text-xs text-text-muted leading-relaxed">Proces čištění metadat byl přerušen z důvodu interní chyby. Soubor může být poškozený nebo v nepodporovaném formátu.</p>
					</div>
					<div class="h-px bg-gray-800"></div>
					<div class="grid grid-cols-2 gap-3 pl-5">
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] text-text-muted uppercase tracking-wider">Kód chyby</span>
							<span class="text-xs font-mono font-semibold text-white">0x0032A</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] text-text-muted uppercase tracking-wider">Čas výskytu</span>
							<span class="text-xs font-mono font-semibold text-white">12:04:17</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] text-text-muted uppercase tracking-wider">Soubor</span>
							<span class="text-xs font-mono font-semibold text-white truncate">video_prague_walk.mp4</span>
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="text-[10px] text-text-muted uppercase tracking-wider">Fáze</span>
							<span class="text-xs font-mono font-semibold text-white">metadata_strip</span>
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
					<span class="font-semibold text-sm text-white">Typ chyby</span>
				</div>
				<i
					class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform"
					style="transform: {typeAccordionOpen ? 'rotate(180deg)' : ''}"
				></i>
			</button>
			{#if typeAccordionOpen}
				<div class="px-4 pb-4 flex flex-col gap-2">
					{#each [
						{ id: 'cleaning', icon: 'fa-circle-xmark', title: 'Cleaning Process Failed', desc: 'Interní chyba při čištění metadat' },
						{ id: 'connection', icon: 'fa-wifi', title: 'Connection Error', desc: 'Ztráta spojení se serverem' },
						{ id: 'timeout', icon: 'fa-clock', title: 'Timeout', desc: 'Operace překročila časový limit' }
					] as errType}
						<button
							onclick={() => (selectedErrorType = errType.id)}
							class="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all w-full"
							style="border:1px solid {selectedErrorType === errType.id ? 'rgba(239,68,68,0.3)' : 'rgba(55,65,81,1)'}; background:{selectedErrorType === errType.id ? 'rgba(239,68,68,0.1)' : 'rgba(10,22,40,0.6)'}"
						>
							<div
								class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
								style="border:1px solid {selectedErrorType === errType.id ? 'rgba(239,68,68,0.25)' : '#374151'}; background:{selectedErrorType === errType.id ? 'rgba(239,68,68,0.15)' : '#1e293b'}"
							>
								<i
									class="fa-solid {errType.icon} text-xs"
									style="color:{selectedErrorType === errType.id ? '#ef4444' : '#94a3b8'}"
								></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-xs font-semibold" style="color:{selectedErrorType === errType.id ? '#fff' : '#94a3b8'}">{errType.title}</p>
								<p class="text-[10px] text-text-muted">{errType.desc}</p>
							</div>
							<i
								class="fa-solid text-xs"
								class:fa-circle-dot={selectedErrorType === errType.id}
								class:fa-circle={selectedErrorType !== errType.id}
								style="color:{selectedErrorType === errType.id ? '#ef4444' : '#374151'}"
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
					<span class="font-semibold text-sm text-white">Log chyby</span>
				</div>
				<i
					class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform"
					style="transform: {logAccordionOpen ? 'rotate(180deg)' : ''}"
				></i>
			</button>
			{#if logAccordionOpen}
				<div class="px-4 pb-4">
					<div class="bg-navy-main/80 rounded-xl border border-gray-800 p-3 flex flex-col gap-1.5 font-mono">
						<div class="flex items-start gap-2">
							<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:01</span>
							<span class="text-[11px] text-brand-green">✓ IMG_4821.jpg — 12 polí odstraněno</span>
						</div>
						<div class="flex items-start gap-2">
							<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:09</span>
							<span class="text-[11px] text-brand-green">✓ photo_holiday_2024.heic — GPS+18 polí</span>
						</div>
						<div class="flex items-start gap-2">
							<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:17</span>
							<span class="text-[11px] text-brand-red">✗ video_prague_walk.mp4 — ERR_CLEANING_FAILED</span>
						</div>
						<div class="flex items-start gap-2 opacity-40">
							<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:17</span>
							<span class="text-[11px] text-text-muted">screenshot_map.png — přeskočeno</span>
						</div>
					</div>
				</div>
			{/if}
		</div>

	</main>
</div>
