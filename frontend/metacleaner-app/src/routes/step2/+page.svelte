<script lang="ts">
	import { onMount } from 'svelte';
	import '../layout.css';

	let langDropdownOpen = $state(false);
	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);
	let riskAccordionOpen = $state(false);

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
	<title>MetaCleaner — Soubory načteny</title>
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
	<main
		class="w-full max-w-[1100px] mx-auto px-4 lg:px-6 pb-32 lg:pb-24 flex flex-col gap-4 lg:gap-6 mt-4 lg:mt-0"
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
				<!-- Ready pill badge -->
				<div
					class="flex items-center gap-2 bg-navy-card border border-gray-700 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 self-start sm:self-auto"
				>
					<div class="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></div>
					<span class="text-[10px] lg:text-xs font-semibold text-text-muted">
						<span class="hidden lg:inline">Připraveno ke spuštění</span>
						<span class="inline lg:hidden">Připraveno</span>
					</span>
				</div>
			</div>
		</div>

		<!-- Mobile: Risk Banner Accordion -->
		<div
			class="lg:hidden bg-navy-card rounded-2xl border border-brand-red/30 shadow-card overflow-hidden"
		>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<button
				onclick={() => (riskAccordionOpen = !riskAccordionOpen)}
				class="w-full flex items-center justify-between px-4 py-3.5"
			>
				<div class="flex items-center gap-3">
					<!-- Mini ring -->
					<div class="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
						<svg viewBox="0 0 36 36" class="absolute inset-0 w-full h-full -rotate-90">
							<circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" stroke-width="3"
							></circle>
							<circle
								cx="18"
								cy="18"
								r="15.9"
								fill="none"
								stroke="#ef4444"
								stroke-width="3.5"
								stroke-dasharray="72 28"
								stroke-linecap="round"
								style="filter: drop-shadow(0 0 6px rgba(239,68,68,0.6))"
							></circle>
						</svg>
						<span class="text-sm font-black text-brand-red z-10">72</span>
					</div>
					<div>
						<div class="flex items-center gap-2 mb-0.5">
							<span class="text-sm font-bold text-white">Risk Scanner</span>
							<span
								class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase flex items-center gap-1"
							>
								<span class="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse inline-block"
								></span>Vysoké riziko
							</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span
								class="px-1.5 py-0.5 rounded text-[9px] font-bold border border-brand-red/25"
								style="background:rgba(239,68,68,0.15);color:#ef4444">GPS</span
							>
							<span
								class="px-1.5 py-0.5 rounded text-[9px] font-bold border border-brand-orange/25"
								style="background:rgba(249,115,22,0.15);color:#f97316">Identita</span
							>
							<span
								class="px-1.5 py-0.5 rounded text-[9px] font-bold border border-brand-orange/25"
								style="background:rgba(249,115,22,0.15);color:#f97316">Zařízení</span
							>
						</div>
					</div>
				</div>
				<i
					class="fa-solid fa-chevron-down text-text-muted text-sm transition-transform"
					style="transform: {riskAccordionOpen ? 'rotate(180deg)' : ''}"
				></i>
			</button>
			{#if riskAccordionOpen}
				<div class="px-4 pb-4 flex flex-col gap-4">
					<p class="text-xs text-text-muted leading-relaxed">
						Vaše soubory obsahují citlivá metadata, která mohou odhalit vaši polohu, identitu a
						zařízení.
					</p>
					<!-- Risk Bars -->
					<div class="flex flex-col gap-3">
						<p class="text-[10px] font-bold uppercase tracking-widest text-text-muted">
							Analýza rizik
						</p>
						<div class="flex flex-col gap-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="flex items-center gap-1.5 text-white font-medium">
									<i class="fa-solid fa-location-dot text-brand-red text-[10px]"></i>GPS souřadnice
								</span>
								<span class="text-brand-red font-bold">Kritické</span>
							</div>
							<div class="w-full bg-navy-lighter rounded-full h-2">
								<div
									class="h-2 rounded-full bg-gradient-to-r from-brand-red to-red-400"
									style="width:92%"
								></div>
							</div>
						</div>
						<div class="flex flex-col gap-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="flex items-center gap-1.5 text-white font-medium">
									<i class="fa-solid fa-mobile-screen text-brand-orange text-[10px]"></i>Identita
									zařízení
								</span>
								<span class="text-brand-orange font-bold">Vysoké</span>
							</div>
							<div class="w-full bg-navy-lighter rounded-full h-2">
								<div class="h-2 rounded-full bg-brand-orange" style="width:68%"></div>
							</div>
						</div>
						<div class="flex flex-col gap-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="flex items-center gap-1.5 text-white font-medium">
									<i class="fa-solid fa-user text-brand-blue text-[10px]"></i>Osobní údaje
								</span>
								<span class="text-brand-orange font-bold">Střední</span>
							</div>
							<div class="w-full bg-navy-lighter rounded-full h-2">
								<div
									class="h-2 rounded-full bg-gradient-to-r from-brand-orange to-yellow-400"
									style="width:48%"
								></div>
							</div>
						</div>
						<div class="flex flex-col gap-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="flex items-center gap-1.5 text-white font-medium">
									<i class="fa-solid fa-clock text-text-muted text-[10px]"></i>Časové razítko
								</span>
								<span class="text-text-muted font-bold">Nízké</span>
							</div>
							<div class="w-full bg-navy-lighter rounded-full h-2">
								<div class="h-2 rounded-full bg-gray-500" style="width:22%"></div>
							</div>
						</div>
					</div>
					<!-- Before/After -->
					<div class="grid grid-cols-2 gap-3">
						<div
							class="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border border-brand-red/25"
							style="background:rgba(239,68,68,0.06)"
						>
							<span class="text-[10px] font-bold uppercase tracking-widest text-brand-red"
								>Nyní</span
							>
							<span class="text-2xl font-black text-brand-red">72</span>
							<span class="text-[10px] text-text-muted">Risk Score</span>
						</div>
						<div
							class="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border border-brand-green/25"
							style="background:rgba(34,197,94,0.06)"
						>
							<span class="text-[10px] font-bold uppercase tracking-widest text-brand-green"
								>Po čištění</span
							>
							<span class="text-2xl font-black text-brand-green">100</span>
							<span class="text-[10px] text-text-muted">Clean Score</span>
						</div>
					</div>
				</div>
			{/if}
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
						<h3 class="font-semibold text-base lg:text-lg text-white">Nahrát soubory</h3>
						<div class="flex gap-1 lg:gap-1.5 flex-wrap justify-end">
							{#each ['JPG', 'PNG', 'HEIC', 'MP4', 'MOV'] as ext}
								<span
									class="px-1.5 lg:px-2 py-0.5 lg:py-1 rounded bg-navy-lighter text-[9px] lg:text-[10px] font-bold text-white uppercase"
									>{ext}</span
								>
							{/each}
						</div>
					</div>

					<!-- Compact Drop Zone -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="dashed-border-anim rounded-xl flex flex-col items-center justify-center gap-2.5 lg:gap-3 cursor-pointer py-5 lg:py-6 relative"
						style="background:rgba(10,22,40,0.5)"
						onclick={() => document.getElementById('fileInput')?.click()}
					>
						<div
							class="w-10 h-10 rounded-full bg-navy-lighter flex items-center justify-center text-brand-blue text-lg shadow-glow-blue"
						>
							<i class="fa-solid fa-plus"></i>
						</div>
						<p class="text-xs text-text-muted">Přidat další soubory</p>
						<input
							type="file"
							id="fileInput"
							multiple
							accept="image/*,video/*"
							class="hidden"
						/>
					</div>

					<!-- File List -->
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between mb-1">
							<span class="text-sm font-semibold text-white"
								>Soubory ke zpracování <span class="text-text-muted font-normal">(4)</span></span
							>
							<button
								class="text-xs text-text-muted hover:text-brand-red transition-colors flex items-center gap-1 min-h-[44px] lg:min-h-0 px-2 lg:px-0"
							>
								<i class="fa-solid fa-trash mr-1 lg:mr-0"></i>Vymazat vše
							</button>
						</div>
						<div
							class="flex flex-col gap-2 max-h-[260px] lg:max-h-[240px] overflow-y-auto pr-1"
						>
							<!-- File 1 - IMG_4821.jpg -->
							<div
								class="group flex items-center gap-3 px-3 py-2.5 lg:py-2.5 rounded-xl border border-gray-800 cursor-default"
								style="background:rgba(10,22,40,0.6)"
							>
								<div
									class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-brand-blue/20"
									style="background:rgba(59,130,246,0.1)"
								>
									<i class="fa-solid fa-image text-brand-blue text-sm"></i>
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-white truncate">IMG_4821.jpg</p>
									<div class="flex items-center gap-2 mt-0.5">
										<span class="text-[11px] text-text-muted">3.2 MB</span>
										<span class="w-1 h-1 rounded-full bg-gray-600"></span>
										<span
											class="text-[11px] text-brand-orange font-medium flex items-center gap-1"
										>
											<i class="fa-solid fa-triangle-exclamation text-[9px]"></i>
											<span class="hidden lg:inline">12 polí metadat</span>
											<span class="inline lg:hidden">12 polí</span>
										</span>
									</div>
								</div>
								<div class="flex items-center gap-2">
									<span
										class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
										>JPG</span
									>
									<button
										class="text-gray-600 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
									>
										<i class="fa-solid fa-xmark text-sm"></i>
									</button>
								</div>
							</div>

							<!-- File 2 - photo_holiday_2024.heic (GPS warning) -->
							<div
								class="group flex items-center gap-3 px-3 py-2.5 lg:py-2.5 rounded-xl border border-red-900/30 cursor-default"
								style="background:rgba(10,22,40,0.6)"
							>
								<div
									class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-brand-red/20"
									style="background:rgba(239,68,68,0.1)"
								>
									<i class="fa-solid fa-image text-brand-red text-sm"></i>
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-white truncate">photo_holiday_2024.heic</p>
									<div class="flex items-center gap-2 mt-0.5">
										<span class="text-[11px] text-text-muted">8.7 MB</span>
										<span class="w-1 h-1 rounded-full bg-gray-600"></span>
										<span
											class="text-[11px] text-brand-red font-medium flex items-center gap-1"
										>
											<i class="fa-solid fa-location-dot text-[9px]"></i>GPS nalezeno
										</span>
									</div>
								</div>
								<div class="flex items-center gap-2">
									<span
										class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
										>HEIC</span
									>
									<button
										class="text-gray-600 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
									>
										<i class="fa-solid fa-xmark text-sm"></i>
									</button>
								</div>
							</div>

							<!-- File 3 - video_prague_walk.mp4 -->
							<div
								class="group flex items-center gap-3 px-3 py-2.5 lg:py-2.5 rounded-xl border border-gray-800 cursor-default"
								style="background:rgba(10,22,40,0.6)"
							>
								<div
									class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-brand-orange/20"
									style="background:rgba(249,115,22,0.1)"
								>
									<i class="fa-solid fa-video text-brand-orange text-sm"></i>
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-white truncate">video_prague_walk.mp4</p>
									<div class="flex items-center gap-2 mt-0.5">
										<span class="text-[11px] text-text-muted">142.5 MB</span>
										<span class="w-1 h-1 rounded-full bg-gray-600"></span>
										<span
											class="text-[11px] text-brand-orange font-medium flex items-center gap-1"
										>
											<i class="fa-solid fa-triangle-exclamation text-[9px]"></i>
											<span class="hidden lg:inline">8 polí metadat</span>
											<span class="inline lg:hidden">8 polí</span>
										</span>
									</div>
								</div>
								<div class="flex items-center gap-2">
									<span
										class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
										>MP4</span
									>
									<button
										class="text-gray-600 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
									>
										<i class="fa-solid fa-xmark text-sm"></i>
									</button>
								</div>
							</div>

							<!-- File 4 - screenshot_map.png -->
							<div
								class="group flex items-center gap-3 px-3 py-2.5 lg:py-2.5 rounded-xl border border-gray-800 cursor-default"
								style="background:rgba(10,22,40,0.6)"
							>
								<div
									class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-brand-blue/20"
									style="background:rgba(59,130,246,0.1)"
								>
									<i class="fa-solid fa-image text-brand-blue text-sm"></i>
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-white truncate">screenshot_map.png</p>
									<div class="flex items-center gap-2 mt-0.5">
										<span class="text-[11px] text-text-muted">1.1 MB</span>
										<span class="w-1 h-1 rounded-full bg-gray-600"></span>
										<span
											class="text-[11px] text-text-muted flex items-center gap-1"
										>
											<i class="fa-solid fa-circle-check text-brand-green text-[9px]"></i>
											<span class="hidden lg:inline">3 pole metadat</span>
											<span class="inline lg:hidden">3 pole</span>
										</span>
									</div>
								</div>
								<div class="flex items-center gap-2">
									<span
										class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
										>PNG</span
									>
									<button
										class="text-gray-600 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
									>
										<i class="fa-solid fa-xmark text-sm"></i>
									</button>
								</div>
							</div>
						</div>
					</div>

					<!-- Action Buttons (desktop only) -->
					<div class="hidden lg:flex gap-3 mt-1">
						<a
							href="/step3"
							class="flex-1 py-3.5 rounded-xl bg-brand-green text-white font-bold text-sm hover:bg-green-500 transition-all shadow-glow-green flex items-center justify-center gap-2"
						>
							<i class="fa-solid fa-wand-magic-sparkles"></i> Spustit čištění
						</a>
						<button
							class="px-5 py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
						>
							<i class="fa-solid fa-sliders"></i> Možnosti
						</button>
					</div>
				</div>
			</div>

			<!-- Right Column (desktop only) — Risk Scanner Card -->
			<div class="hidden lg:flex flex-col gap-5">
				<div
					class="bg-navy-card rounded-2xl border border-gray-800 p-6 shadow-card flex flex-col gap-5"
				>
					<div class="flex items-center justify-between">
						<h3 class="font-semibold text-lg text-white">Risk Scanner</h3>
						<span
							class="text-xs font-bold px-3 py-1 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase tracking-wider flex items-center gap-1.5"
						>
							<span class="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse inline-block"
							></span>Vysoké riziko
						</span>
					</div>

					<!-- Risk Score Ring -->
					<div class="flex items-center gap-6">
						<div
							class="relative w-28 h-28 flex-shrink-0 flex items-center justify-center"
						>
							<svg viewBox="0 0 36 36" class="absolute inset-0 w-full h-full -rotate-90">
								<circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" stroke-width="3"
								></circle>
								<circle
									cx="18"
									cy="18"
									r="15.9"
									fill="none"
									stroke="#ef4444"
									stroke-width="3.5"
									stroke-dasharray="72 28"
									stroke-linecap="round"
									style="filter: drop-shadow(0 0 6px rgba(239,68,68,0.6))"
								></circle>
							</svg>
							<div class="text-center z-10">
								<span class="text-3xl font-black text-brand-red leading-none">72</span>
								<p class="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">
									Risk Score
								</p>
							</div>
						</div>
						<div class="flex flex-col gap-2 flex-1">
							<p class="text-sm font-bold text-white">Únik osobních dat je pravděpodobný</p>
							<p class="text-xs text-text-muted leading-relaxed">
								Vaše soubory obsahují citlivá metadata, která mohou odhalit vaši polohu, identitu a
								zařízení.
							</p>
							<div class="flex items-center gap-1.5 mt-1">
								<span
									class="px-2 py-0.5 rounded text-[10px] font-bold border border-brand-red/25"
									style="background:rgba(239,68,68,0.15);color:#ef4444">GPS</span
								>
								<span
									class="px-2 py-0.5 rounded text-[10px] font-bold border border-brand-orange/25"
									style="background:rgba(249,115,22,0.15);color:#f97316">Identita</span
								>
								<span
									class="px-2 py-0.5 rounded text-[10px] font-bold border border-brand-orange/25"
									style="background:rgba(249,115,22,0.15);color:#f97316">Zařízení</span
								>
							</div>
						</div>
					</div>

					<!-- Risk Breakdown -->
					<div class="flex flex-col gap-3">
						<p class="text-xs font-bold uppercase tracking-widest text-text-muted">
							Analýza rizik
						</p>
						<div class="flex flex-col gap-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="flex items-center gap-1.5 text-white font-medium">
									<i class="fa-solid fa-location-dot text-brand-red text-[10px]"></i>GPS
									souřadnice
								</span>
								<span class="text-brand-red font-bold">Kritické</span>
							</div>
							<div class="w-full bg-navy-lighter rounded-full h-2">
								<div
									class="h-2 rounded-full bg-gradient-to-r from-brand-red to-red-400"
									style="width:92%"
								></div>
							</div>
						</div>
						<div class="flex flex-col gap-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="flex items-center gap-1.5 text-white font-medium">
									<i class="fa-solid fa-mobile-screen text-brand-orange text-[10px]"></i>Identita
									zařízení
								</span>
								<span class="text-brand-orange font-bold">Vysoké</span>
							</div>
							<div class="w-full bg-navy-lighter rounded-full h-2">
								<div class="h-2 rounded-full bg-brand-orange" style="width:68%"></div>
							</div>
						</div>
						<div class="flex flex-col gap-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="flex items-center gap-1.5 text-white font-medium">
									<i class="fa-solid fa-user text-brand-blue text-[10px]"></i>Osobní údaje
								</span>
								<span class="text-brand-orange font-bold">Střední</span>
							</div>
							<div class="w-full bg-navy-lighter rounded-full h-2">
								<div
									class="h-2 rounded-full bg-gradient-to-r from-brand-orange to-yellow-400"
									style="width:48%"
								></div>
							</div>
						</div>
						<div class="flex flex-col gap-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="flex items-center gap-1.5 text-white font-medium">
									<i class="fa-solid fa-clock text-text-muted text-[10px]"></i>Časové razítko
								</span>
								<span class="text-text-muted font-bold">Nízké</span>
							</div>
							<div class="w-full bg-navy-lighter rounded-full h-2">
								<div class="h-2 rounded-full bg-gray-500" style="width:22%"></div>
							</div>
						</div>
					</div>

					<!-- Before/After preview -->
					<div class="grid grid-cols-2 gap-3">
						<div
							class="flex flex-col items-center gap-2 px-3 py-3 rounded-xl border border-brand-red/25"
							style="background:rgba(239,68,68,0.08)"
						>
							<span class="text-[10px] font-bold uppercase tracking-widest text-brand-red"
								>Nyní</span
							>
							<span class="text-2xl font-black text-brand-red">72</span>
							<span class="text-[10px] text-text-muted">Risk Score</span>
						</div>
						<div
							class="flex flex-col items-center gap-2 px-3 py-3 rounded-xl border border-brand-green/25"
							style="background:rgba(34,197,94,0.08)"
						>
							<span class="text-[10px] font-bold uppercase tracking-widest text-brand-green"
								>Po čištění</span
							>
							<span class="text-2xl font-black text-brand-green">100</span>
							<span class="text-[10px] text-text-muted">Clean Score</span>
						</div>
					</div>

					<!-- CTA hint -->
					<div
						class="flex items-start gap-3 px-4 py-3 rounded-xl border border-brand-green/20"
						style="background:rgba(34,197,94,0.08)"
					>
						<i class="fa-solid fa-shield-halved text-brand-green text-sm mt-0.5"></i>
						<p class="text-xs text-text-muted">
							Spusťte čištění a <span class="text-brand-green font-semibold">snižte riziko na 0</span>
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Mobile CTA hint -->
		<div
			class="lg:hidden flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-green/20"
			style="background:rgba(34,197,94,0.06)"
		>
			<i class="fa-solid fa-shield-halved text-brand-green text-sm"></i>
			<p class="text-xs text-text-muted">
				Spusťte čištění a <span class="text-brand-green font-semibold">snižte riziko na 0</span>
			</p>
		</div>
	</main>

	<!-- Mobile Fixed Bottom CTA -->
	<div
		class="lg:hidden fixed bottom-0 left-0 right-0 px-4 py-4 z-50 border-t border-gray-800 bg-navy-main"
	>
		<div class="flex gap-3">
			<a
				href="/step3"
				class="flex-1 py-4 rounded-xl bg-brand-green text-white font-bold text-sm shadow-glow-green flex items-center justify-center gap-2 active:scale-95 transition-transform"
			>
				<i class="fa-solid fa-wand-magic-sparkles"></i> Spustit čištění
			</a>
			<button
				class="px-5 py-4 rounded-xl bg-navy-lighter border border-gray-700 text-white font-semibold text-sm flex items-center gap-2 active:scale-95 transition-transform"
			>
				<i class="fa-solid fa-sliders"></i>
			</button>
		</div>
	</div>
</div>
