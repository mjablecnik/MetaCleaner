<script lang="ts">
	import { onMount } from 'svelte';
	import '../layout.css';
	import { currentLocale, switchLocale } from '$lib/locale.svelte';

	let langDropdownOpen = $state(false);
	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);
	let logAccordionOpen = $state(false);

	const langOptions = [
		{ code: 'cs', flag: '🇨🇿', label: 'CS', name: 'Čeština' },
		{ code: 'en', flag: '🇬🇧', label: 'EN', name: 'English' },
		{ code: 'de', flag: '🇩🇪', label: 'DE', name: 'Deutsch' },
		{ code: 'sk', flag: '🇸🇰', label: 'SK', name: 'Slovenčina' }
	];
	let currentLangInfo = $derived(langOptions.find((l) => l.code === currentLocale) ?? langOptions[0]);

	let overallPct = $state(62);

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
		const interval = setInterval(() => {
			if (overallPct >= 75) {
				clearInterval(interval);
				return;
			}
			overallPct = Math.min(overallPct + 0.5, 75);
		}, 300);
		return () => {
			document.removeEventListener('click', handleClickOutside);
			clearInterval(interval);
		};
	});
</script>

<svelte:head>
	<title>MetaCleaner — Zpracovávám</title>
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
				<span class="text-lg lg:text-xl font-bold tracking-tight">MetaCleaner</span>
			</a>

			<!-- Desktop right side -->
			<div class="hidden lg:flex items-center gap-3">
				<!-- Language dropdown -->
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
						<span class="hidden md:block">Jana Nováková</span>
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
					<div
						class="lang-dropdown-menu"
						class:open={hamburgerMenuOpen}
						style="min-width:220px"
					>
						<div class="px-4 py-3 border-b border-gray-700">
							<p class="text-xs text-text-muted">Přihlášen jako</p>
							<p class="text-sm font-semibold text-white mt-0.5 truncate">
								jana.novakova@email.cz
							</p>
						</div>
						<div class="px-4 py-2 border-b border-gray-700">
							<p class="text-[10px] text-text-muted uppercase tracking-wider mb-1">Jazyk</p>
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
	<main
		class="w-full max-w-[1100px] mx-auto px-4 lg:px-6 pb-24 flex flex-col gap-4 lg:gap-6 mt-4 lg:mt-0"
	>
		<!-- Page Header -->
		<div class="flex flex-col gap-1 mb-0 lg:mb-2">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<h1 class="text-2xl lg:text-3xl font-bold text-white">Čištění metadat</h1>
					<p class="text-text-muted text-sm mt-1">
						Nahrajte soubory a odstraňte skrytá metadata lokálně na vašem zařízení.
					</p>
				</div>
				<!-- Processing badge -->
				<div
					class="flex items-center gap-2 bg-navy-card border border-blue-800/50 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 self-start sm:self-auto"
				>
					<div class="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
					<span class="text-[10px] lg:text-xs font-semibold text-brand-blue">
						<span class="hidden lg:inline">Probíhá čištění...</span>
						<span class="inline lg:hidden">Probíhá...</span>
					</span>
				</div>
			</div>
		</div>

		<!-- Mobile: Status Card on top -->
		<div
			class="lg:hidden bg-navy-card rounded-2xl border border-gray-800 p-4 shadow-card flex flex-col gap-4"
		>
			<div class="flex items-center justify-between">
				<h3 class="font-semibold text-base text-white">Stav zpracování</h3>
				<span
					class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 uppercase tracking-wider flex items-center gap-1"
				>
					<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i> Probíhá
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
					<p class="font-bold text-white text-sm">Probíhá čištění metadat</p>
					<p class="text-text-muted text-xs mt-0.5">
						Zpracovávám <span class="text-brand-blue font-semibold">video_prague_walk.mp4</span>
					</p>
				</div>
			</div>
			<!-- Live Stats -->
			<div class="grid grid-cols-3 gap-2 w-full">
				<div class="bg-navy-main/60 rounded-xl p-2.5 text-center border border-gray-800">
					<p class="text-lg font-black text-white">4</p>
					<p class="text-[10px] text-text-muted mt-0.5">Souborů</p>
				</div>
				<div class="bg-navy-main/60 rounded-xl p-2.5 text-center border border-brand-green/20">
					<p class="text-lg font-black text-brand-green">30</p>
					<p class="text-[10px] text-text-muted mt-0.5">Polí smazáno</p>
				</div>
				<div class="bg-navy-main/60 rounded-xl p-2.5 text-center border border-gray-800">
					<p class="text-lg font-black text-brand-blue">
						2<span class="text-xs font-semibold">/4</span>
					</p>
					<p class="text-[10px] text-text-muted mt-0.5">Hotovo</p>
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
						<h3 class="font-semibold text-base lg:text-lg text-white">Soubory ke zpracování</h3>
						<span
							class="text-[10px] lg:text-xs font-bold px-2.5 lg:px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 uppercase tracking-wider flex items-center gap-1.5"
						>
							<i class="fa-solid fa-circle-notch spin-slow text-[10px]"></i>
							Zpracovávám
						</span>
					</div>

					<!-- Overall Progress -->
					<div
						class="bg-navy-main/60 rounded-xl p-3 lg:p-4 border border-blue-900/30"
					>
						<div class="flex items-center justify-between mb-1.5 lg:mb-2">
							<span class="text-xs font-semibold text-text-muted">Celkový průběh</span>
							<span class="text-xs font-bold text-brand-blue">{Math.round(overallPct)}%</span>
						</div>
						<div class="w-full h-2.5 bg-navy-lighter rounded-full overflow-hidden">
							<div
								class="h-full rounded-full bg-gradient-to-r from-brand-blue to-blue-400"
								style="width:{overallPct}%; transition: width 0.6s ease;"
							></div>
						</div>
						<div class="flex items-center justify-between mt-1.5 lg:mt-2">
							<span class="text-[10px] lg:text-[11px] text-text-muted">2 z 4 souborů dokončeno</span>
							<span class="text-[10px] lg:text-[11px] text-text-muted">~14s zbývá</span>
						</div>
					</div>

					<!-- File List -->
					<div class="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
						<!-- File 1 - Done -->
						<div
							class="flex items-center gap-3 px-3 py-2.5 lg:py-2.5 rounded-xl border border-brand-green/20 cursor-default"
							style="background:rgba(10,22,40,0.6)"
						>
							<div
								class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0"
							>
								<i class="fa-solid fa-image text-brand-green text-sm"></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-white truncate">IMG_4821.jpg</p>
								<div class="flex items-center gap-2 mt-0.5">
									<span class="text-[10px] lg:text-[11px] text-text-muted">3.2 MB</span>
									<span class="w-1 h-1 rounded-full bg-gray-600"></span>
									<span
										class="text-[10px] lg:text-[11px] text-brand-green font-medium flex items-center gap-1"
									>
										<i class="fa-solid fa-circle-check text-[9px]"></i> 12 polí odstraněno
									</span>
								</div>
							</div>
							<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
								<span
									class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
									>JPG</span
								>
								<div
									class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center"
								>
									<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
								</div>
							</div>
						</div>

						<!-- File 2 - Done (GPS) -->
						<div
							class="flex items-center gap-3 px-3 py-2.5 lg:py-2.5 rounded-xl border border-brand-green/20 cursor-default"
							style="background:rgba(10,22,40,0.6)"
						>
							<div
								class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0"
							>
								<i class="fa-solid fa-image text-brand-green text-sm"></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-white truncate">photo_holiday_2024.heic</p>
								<div class="flex items-center gap-2 mt-0.5">
									<span class="text-[10px] lg:text-[11px] text-text-muted">8.7 MB</span>
									<span class="w-1 h-1 rounded-full bg-gray-600"></span>
									<span
										class="text-[10px] lg:text-[11px] text-brand-green font-medium flex items-center gap-1"
									>
										<i class="fa-solid fa-circle-check text-[9px]"></i>
										<span class="hidden lg:inline">GPS + 18 polí odstraněno</span>
										<span class="inline lg:hidden">GPS + 18 polí</span>
									</span>
								</div>
							</div>
							<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
								<span
									class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
									>HEIC</span
								>
								<div
									class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center"
								>
									<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
								</div>
							</div>
						</div>

						<!-- File 3 - In Progress -->
						<div
							class="flex items-center gap-3 px-3 py-2.5 lg:py-2.5 rounded-xl border border-brand-blue/30 cursor-default"
							style="background:rgba(59,130,246,0.05)"
						>
							<div
								class="w-9 h-9 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center flex-shrink-0"
							>
								<i class="fa-solid fa-video text-brand-orange text-sm"></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-white truncate">video_prague_walk.mp4</p>
								<div class="flex flex-col gap-1 mt-1">
									<div class="flex items-center justify-between">
										<span
											class="text-[10px] lg:text-[11px] text-brand-blue font-medium flex items-center gap-1"
										>
											<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i>
											Zpracovávám...
										</span>
										<span class="text-[10px] lg:text-[11px] text-brand-blue font-bold">38%</span>
									</div>
									<div class="w-full h-1.5 bg-navy-lighter rounded-full overflow-hidden">
										<div
											class="h-full rounded-full bg-gradient-to-r from-brand-blue to-blue-400"
											style="width:38%"
										></div>
									</div>
								</div>
							</div>
							<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
								<span
									class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
									>MP4</span
								>
								<i class="fa-solid fa-circle-notch spin-slow text-brand-blue text-sm"></i>
							</div>
						</div>

						<!-- File 4 - Waiting -->
						<div
							class="flex items-center gap-3 px-3 py-2.5 lg:py-2.5 rounded-xl border border-gray-800 cursor-default opacity-50"
							style="background:rgba(10,22,40,0.6)"
						>
							<div
								class="w-9 h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center flex-shrink-0"
							>
								<i class="fa-solid fa-image text-brand-blue text-sm"></i>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-white truncate">screenshot_map.png</p>
								<div class="flex items-center gap-2 mt-0.5">
									<span class="text-[10px] lg:text-[11px] text-text-muted">1.1 MB</span>
									<span class="w-1 h-1 rounded-full bg-gray-600"></span>
									<span
										class="text-[10px] lg:text-[11px] text-text-muted flex items-center gap-1"
									>
										<i class="fa-solid fa-clock text-[9px]"></i> Čeká ve frontě
									</span>
								</div>
							</div>
							<span
								class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted flex-shrink-0"
								>PNG</span
							>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="flex gap-3 mt-1">
						<button
							disabled
							class="flex-1 py-3.5 lg:py-3.5 rounded-xl bg-brand-green/40 text-white/50 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
						>
							<i class="fa-solid fa-wand-magic-sparkles"></i> Spustit čištění
						</button>
						<a
							href="/step4"
							class="px-5 py-3.5 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red font-semibold text-sm hover:bg-brand-red/20 transition-all flex items-center gap-2"
						>
							<i class="fa-solid fa-stop"></i> Zastavit
						</a>
					</div>
					<a
						href="/step5"
						class="text-xs text-text-muted hover:text-brand-green transition-colors flex items-center gap-1 mt-1"
					>
						<i class="fa-solid fa-arrow-right text-[10px]"></i> nebo přejít na výsledky (demo)
					</a>
				</div>
			</div>

			<!-- Right Column (desktop only) — Status Card -->
			<div class="hidden lg:flex flex-col gap-5">
				<div
					class="bg-navy-card rounded-2xl border border-gray-800 p-6 shadow-card flex flex-col gap-5"
				>
					<div class="flex items-center justify-between">
						<h3 class="font-semibold text-lg text-white">Stav zpracování</h3>
						<span
							class="text-xs font-bold px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 uppercase tracking-wider flex items-center gap-1.5"
						>
							<i class="fa-solid fa-circle-notch spin-slow text-[10px]"></i>
							Probíhá
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
							<p class="font-bold text-white text-base">Probíhá čištění metadat</p>
							<p class="text-text-muted text-xs mt-1">
								Zpracovávám soubor <span class="text-brand-blue font-semibold"
									>video_prague_walk.mp4</span
								>
							</p>
						</div>
					</div>

					<!-- Live Stats -->
					<div class="grid grid-cols-3 gap-3 w-full">
						<div
							class="bg-navy-main/60 rounded-xl p-3 text-center border border-gray-800"
						>
							<p class="text-xl font-black text-white">4</p>
							<p class="text-[10px] text-text-muted mt-0.5">Souborů</p>
						</div>
						<div
							class="bg-navy-main/60 rounded-xl p-3 text-center border border-brand-green/20"
						>
							<p class="text-xl font-black text-brand-green">30</p>
							<p class="text-[10px] text-text-muted mt-0.5">Polí odstraněno</p>
						</div>
						<div
							class="bg-navy-main/60 rounded-xl p-3 text-center border border-gray-800"
						>
							<p class="text-xl font-black text-brand-blue">
								2<span class="text-sm font-semibold">/4</span>
							</p>
							<p class="text-[10px] text-text-muted mt-0.5">Hotovo</p>
						</div>
					</div>

					<!-- Activity Log -->
					<div class="flex flex-col gap-1">
						<p class="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
							Průběžný log
						</p>
						<div
							class="bg-navy-main/80 rounded-xl border border-gray-800 p-3 flex flex-col gap-1.5 max-h-[160px] overflow-y-auto font-mono"
						>
							<div class="flex items-start gap-2">
								<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:01</span>
								<span class="text-[11px] text-brand-green"
									>✓ IMG_4821.jpg — 12 polí odstraněno (EXIF, XMP)</span
								>
							</div>
							<div class="flex items-start gap-2">
								<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:03</span>
								<span class="text-[11px] text-brand-green"
									>✓ photo_holiday_2024.heic — GPS souřadnice + 18 polí odstraněno</span
								>
							</div>
							<div class="flex items-start gap-2">
								<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:05</span>
								<span class="text-[11px] text-brand-blue flex items-center gap-1">
									<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i>
									video_prague_walk.mp4 — zpracovávám (38%)...
								</span>
							</div>
							<div class="flex items-start gap-2 opacity-40">
								<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">—</span>
								<span class="text-[11px] text-text-muted">screenshot_map.png — čeká ve frontě</span>
							</div>
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
					<span class="text-sm font-semibold text-white">Průběžný log</span>
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
						<div class="flex items-start gap-2">
							<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:01</span>
							<span class="text-[11px] text-brand-green"
								>✓ IMG_4821.jpg — 12 polí odstraněno (EXIF, XMP)</span
							>
						</div>
						<div class="flex items-start gap-2">
							<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:03</span>
							<span class="text-[11px] text-brand-green"
								>✓ photo_holiday_2024.heic — GPS + 18 polí odstraněno</span
							>
						</div>
						<div class="flex items-start gap-2">
							<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">12:04:05</span>
							<span class="text-[11px] text-brand-blue flex items-center gap-1">
								<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i>
								video_prague_walk.mp4 — zpracovávám (38%)...
							</span>
						</div>
						<div class="flex items-start gap-2 opacity-40">
							<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">—</span>
							<span class="text-[11px] text-text-muted">screenshot_map.png — čeká ve frontě</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</main>
</div>
