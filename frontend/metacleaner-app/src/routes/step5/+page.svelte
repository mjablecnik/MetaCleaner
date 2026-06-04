<script lang="ts">
	import '../layout.css';
	import { onMount } from 'svelte';
	import { currentLocale, switchLocale } from '$lib/locale.svelte';

	let langDropdownOpen = $state(false);
	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);
	let metaAccordionOpen = $state(true);
	let activeMetaTab = $state<'before' | 'after'>('before');

	const langOptions = [
		{ code: 'cs', flag: '🇨🇿', label: 'CS', name: 'Čeština' },
		{ code: 'en', flag: '🇬🇧', label: 'EN', name: 'English' },
		{ code: 'de', flag: '🇩🇪', label: 'DE', name: 'Deutsch' },
		{ code: 'sk', flag: '🇸🇰', label: 'SK', name: 'Slovenčina' }
	];
	let currentLangInfo = $derived(langOptions.find((l) => l.code === currentLocale) ?? langOptions[0]);

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
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<svelte:head>
	<title>MetaCleaner — Čištění dokončeno</title>
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
						Čištění dokončeno!
					</h1>
					<p class="text-text-muted text-xs lg:text-sm mt-0.5 lg:mt-1">
						<span class="hidden lg:inline"
							>Všechna metadata byla úspěšně odstraněna ze 4 souborů.</span
						>
						<span class="inline lg:hidden">Všechna metadata odstraněna ze 4 souborů.</span>
					</p>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<a
					href="/"
					class="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue font-semibold text-sm hover:bg-brand-blue/20 transition-all"
				>
					<i class="fa-solid fa-arrow-up-from-bracket"></i>
					<span>Nahrát nové soubory</span>
				</a>
				<div
					class="flex items-center gap-2 bg-brand-green/10 border border-brand-green/30 rounded-xl px-4 py-2.5"
				>
					<div class="w-2 h-2 rounded-full bg-brand-green"></div>
					<span class="text-xs font-semibold text-brand-green">100% Úspěšně dokončeno</span>
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
				<p class="text-2xl font-black text-white">4</p>
				<p class="text-[11px] lg:text-xs text-text-muted">Souborů zpracováno</p>
			</div>
			<div
				class="bg-navy-card rounded-2xl border border-brand-green/20 p-4 lg:p-5 shadow-card flex flex-col gap-1"
			>
				<div
					class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mb-1.5 lg:mb-2"
				>
					<i class="fa-solid fa-eraser text-brand-green text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-brand-green">87</p>
				<p class="text-[11px] lg:text-xs text-text-muted">Polí metadat odstraněno</p>
			</div>
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1">
				<div
					class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mb-1.5 lg:mb-2"
				>
					<i class="fa-solid fa-location-dot text-brand-blue text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-brand-blue">3</p>
				<p class="text-[11px] lg:text-xs text-text-muted">GPS lokací odstraněno</p>
			</div>
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-5 shadow-card flex flex-col gap-1">
				<div
					class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center mb-1.5 lg:mb-2"
				>
					<i class="fa-solid fa-clock text-brand-orange text-sm lg:text-base"></i>
				</div>
				<p class="text-2xl font-black text-white">28s</p>
				<p class="text-[11px] lg:text-xs text-text-muted">Celková doba čištění</p>
			</div>
		</div>

		<!-- Metadata Overview — Desktop (side-by-side panels) -->
		<div
			class="fade-in-up delay-2 hidden lg:block bg-navy-card rounded-2xl border border-gray-800 p-6 shadow-card"
		>
			<h3 class="font-semibold text-lg text-white mb-6">Přehled metadat</h3>
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
								>Před čištěním</span
							>
							<p class="text-sm font-semibold text-white">Soubory obsahovaly skrytá data</p>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-location-dot text-brand-red"></i> GPS souřadnice</span
							>
							<span class="text-xs font-mono text-white">3 soubory</span>
						</div>
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-camera text-brand-red"></i> EXIF data</span
							>
							<span class="text-xs font-mono text-white">52 polí</span>
						</div>
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-tag text-brand-red"></i> XMP/IPTC</span
							>
							<span class="text-xs font-mono text-white">19 polí</span>
						</div>
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-ellipsis text-brand-red"></i> Ostatní</span
							>
							<span class="text-xs font-mono text-white">13 polí</span>
						</div>
					</div>
					<p class="text-xs text-brand-red/80 flex items-center gap-2 mt-1">
						<i class="fa-solid fa-circle-exclamation"></i> Celkem 87 polí metadat bylo odhalitelných.
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
								>Po čištění</span
							>
							<p class="text-sm font-semibold text-white">Soubory jsou bezpečné ke sdílení</p>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-location-dot text-brand-green"></i> GPS souřadnice</span
							>
							<span class="text-xs font-mono text-brand-green flex items-center gap-1"
								><i class="fa-solid fa-check"></i> Odstraněno</span
							>
						</div>
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-camera text-brand-green"></i> EXIF data</span
							>
							<span class="text-xs font-mono text-brand-green flex items-center gap-1"
								><i class="fa-solid fa-check"></i> Odstraněno</span
							>
						</div>
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-tag text-brand-green"></i> XMP/IPTC</span
							>
							<span class="text-xs font-mono text-brand-green flex items-center gap-1"
								><i class="fa-solid fa-check"></i> Odstraněno</span
							>
						</div>
						<div
							class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-card border border-gray-800"
						>
							<span class="text-xs text-text-muted flex items-center gap-2"
								><i class="fa-solid fa-ellipsis text-brand-green"></i> Ostatní</span
							>
							<span class="text-xs font-mono text-brand-green flex items-center gap-1"
								><i class="fa-solid fa-check"></i> Odstraněno</span
							>
						</div>
					</div>
					<p class="text-xs text-brand-green/80 flex items-center gap-2 mt-1">
						<i class="fa-solid fa-circle-check"></i> Soubory neobsahují žádná citlivá metadata.
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
				<span class="font-semibold text-base text-white">Přehled metadat</span>
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
							<i class="fa-solid fa-triangle-exclamation mr-1"></i> Před čištěním
						</button>
						<button
							onclick={() => (activeMetaTab = 'after')}
							class="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
							style={activeMetaTab === 'after'
								? 'color:#22c55e;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3)'
								: 'color:#94a3b8;background:transparent;border:1px solid transparent'}
						>
							<i class="fa-solid fa-shield-halved mr-1"></i> Po čištění
						</button>
					</div>

					<!-- Before Panel -->
					{#if activeMetaTab === 'before'}
						<div class="flex flex-col gap-2">
							<p class="text-xs text-white font-semibold mb-1">Soubory obsahovaly skrytá data</p>
							<div
								class="flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 rounded-xl px-3 py-2.5 mb-1"
							>
								<i
									class="fa-solid fa-circle-exclamation text-brand-red text-sm flex-shrink-0"
								></i>
								<p class="text-xs text-brand-red/90 font-medium">
									Vysoké riziko úniku soukromí! 87 polí metadat bylo odhalitelných.
								</p>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-location-dot text-brand-red"></i> GPS souřadnice</span
								>
								<span class="text-xs font-mono text-white">3 soubory</span>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-camera text-brand-red"></i> EXIF data</span
								>
								<span class="text-xs font-mono text-white">52 polí</span>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-tag text-brand-red"></i> XMP/IPTC</span
								>
								<span class="text-xs font-mono text-white">19 polí</span>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-film text-brand-red"></i> ID3 / MP4 atoms</span
								>
								<span class="text-xs font-mono text-white">23 polí</span>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-ellipsis text-brand-red"></i> Ostatní</span
								>
								<span class="text-xs font-mono text-white">13 polí</span>
							</div>
							<div class="mt-1">
								<div class="flex justify-between text-[10px] text-text-muted mb-1">
									<span>Celkové riziko</span>
									<span class="text-brand-red font-bold">Vysoké</span>
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
							<p class="text-xs text-white font-semibold mb-1">Soubory jsou bezpečné ke sdílení</p>
							<div
								class="flex items-center gap-2 bg-brand-green/10 border border-brand-green/20 rounded-xl px-3 py-2.5 mb-1"
							>
								<i
									class="fa-solid fa-shield-halved text-brand-green text-sm flex-shrink-0"
								></i>
								<p class="text-xs text-brand-green/90 font-medium">
									Všechna citlivá metadata byla úspěšně odstraněna.
								</p>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-location-dot text-brand-green"></i> GPS souřadnice</span
								>
								<span class="text-xs font-mono text-brand-green flex items-center gap-1"
									><i class="fa-solid fa-check"></i> Odstraněno</span
								>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-camera text-brand-green"></i> EXIF data</span
								>
								<span class="text-xs font-mono text-brand-green flex items-center gap-1"
									><i class="fa-solid fa-check"></i> Odstraněno</span
								>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-tag text-brand-green"></i> XMP/IPTC</span
								>
								<span class="text-xs font-mono text-brand-green flex items-center gap-1"
									><i class="fa-solid fa-check"></i> Odstraněno</span
								>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-film text-brand-green"></i> ID3 / MP4 atoms</span
								>
								<span class="text-xs font-mono text-brand-green flex items-center gap-1"
									><i class="fa-solid fa-check"></i> Odstraněno</span
								>
							</div>
							<div
								class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
							>
								<span class="text-xs text-text-muted flex items-center gap-2"
									><i class="fa-solid fa-ellipsis text-brand-green"></i> Ostatní</span
								>
								<span class="text-xs font-mono text-brand-green flex items-center gap-1"
									><i class="fa-solid fa-check"></i> Odstraněno</span
								>
							</div>
							<div class="mt-1">
								<div class="flex justify-between text-[10px] text-text-muted mb-1">
									<span>Celkové riziko</span>
									<span class="text-brand-green font-bold">Žádné</span>
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
				<h3 class="font-semibold text-base lg:text-lg text-white">Výsledky souborů</h3>
				<span
					class="text-[10px] font-bold px-2.5 lg:px-3 py-1 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 uppercase tracking-wider flex items-center gap-1.5"
				>
					<i class="fa-solid fa-circle-check text-[10px]"></i> Vše hotovo
				</span>
			</div>

			<!-- Files Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
				<!-- File 1 -->
				<div class="file-row rounded-xl border border-brand-green/20 bg-navy-main/60 overflow-hidden">
					<div class="flex items-center gap-3 px-3 lg:px-4 py-3">
						<div
							class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0"
						>
							<i class="fa-solid fa-image text-brand-green text-sm"></i>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-semibold text-white truncate">IMG_4821.jpg</p>
							<p class="text-[11px] text-text-muted">3.2 MB · JPEG · Canon EOS R5</p>
						</div>
						<span
							class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
							>JPG</span
						>
						<div
							class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center flex-shrink-0"
						>
							<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
						</div>
					</div>
					<div class="px-3 lg:px-4 pb-3 flex flex-wrap gap-1.5">
						<span
							class="text-[10px] px-2 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium"
							>GPS odstraněno</span
						>
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
							>EXIF ×8</span
						>
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
							>XMP ×4</span
						>
						<span
							class="text-[10px] px-2 py-0.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green font-medium"
							>12 polí</span
						>
					</div>
				</div>
				<!-- File 2 -->
				<div class="file-row rounded-xl border border-brand-green/20 bg-navy-main/60 overflow-hidden">
					<div class="flex items-center gap-3 px-3 lg:px-4 py-3">
						<div
							class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0"
						>
							<i class="fa-solid fa-image text-brand-green text-sm"></i>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-semibold text-white truncate">photo_holiday_2024.heic</p>
							<p class="text-[11px] text-text-muted">8.7 MB · HEIC · iPhone 15 Pro</p>
						</div>
						<span
							class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
							>HEIC</span
						>
						<div
							class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center flex-shrink-0"
						>
							<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
						</div>
					</div>
					<div class="px-3 lg:px-4 pb-3 flex flex-wrap gap-1.5">
						<span
							class="text-[10px] px-2 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium"
							>GPS odstraněno</span
						>
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
							>EXIF ×12</span
						>
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
							>XMP ×6</span
						>
						<span
							class="text-[10px] px-2 py-0.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green font-medium"
							>18 polí</span
						>
					</div>
				</div>
				<!-- File 3 -->
				<div class="file-row rounded-xl border border-brand-green/20 bg-navy-main/60 overflow-hidden">
					<div class="flex items-center gap-3 px-3 lg:px-4 py-3">
						<div
							class="w-9 h-9 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center flex-shrink-0"
						>
							<i class="fa-solid fa-video text-brand-orange text-sm"></i>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-semibold text-white truncate">video_prague_walk.mp4</p>
							<p class="text-[11px] text-text-muted">142 MB · MP4 · H.264</p>
						</div>
						<span
							class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
							>MP4</span
						>
						<div
							class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center flex-shrink-0"
						>
							<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
						</div>
					</div>
					<div class="px-3 lg:px-4 pb-3 flex flex-wrap gap-1.5">
						<span
							class="text-[10px] px-2 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium"
							>GPS odstraněno</span
						>
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
							>ID3 ×9</span
						>
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
							>MP4 atoms ×14</span
						>
						<span
							class="text-[10px] px-2 py-0.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green font-medium"
							>43 polí</span
						>
					</div>
				</div>
				<!-- File 4 -->
				<div class="file-row rounded-xl border border-brand-green/20 bg-navy-main/60 overflow-hidden">
					<div class="flex items-center gap-3 px-3 lg:px-4 py-3">
						<div
							class="w-9 h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center flex-shrink-0"
						>
							<i class="fa-solid fa-image text-brand-blue text-sm"></i>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-semibold text-white truncate">screenshot_map.png</p>
							<p class="text-[11px] text-text-muted">1.1 MB · PNG</p>
						</div>
						<span
							class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
							>PNG</span
						>
						<div
							class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center flex-shrink-0"
						>
							<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
						</div>
					</div>
					<div class="px-3 lg:px-4 pb-3 flex flex-wrap gap-1.5">
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
							>PNG chunks ×5</span
						>
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
							>XMP ×9</span
						>
						<span
							class="text-[10px] px-2 py-0.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green font-medium"
							>14 polí</span
						>
					</div>
				</div>
			</div>

			<!-- Desktop Action Buttons -->
			<div class="hidden lg:flex gap-3 mt-1">
				<button
					class="flex-1 py-3.5 rounded-xl bg-brand-green text-white font-bold text-sm hover:bg-green-400 transition-all flex items-center justify-center gap-2 shadow-glow-green"
				>
					<i class="fa-solid fa-download"></i> Stáhnout vše (ZIP)
				</button>
				<a
					href="/report"
					class="px-5 py-3.5 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue font-semibold text-sm hover:bg-brand-blue/20 transition-all flex items-center gap-2"
				>
					<i class="fa-solid fa-file-lines"></i> Zobrazit report
				</a>
				<a
					href="/reports"
					class="px-5 py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm hover:bg-gray-800 hover:text-white transition-all flex items-center gap-2"
				>
					<i class="fa-solid fa-clock-rotate-left"></i> Historie
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
			<i class="fa-solid fa-download"></i> Stáhnout vše (ZIP)
		</button>
		<div class="flex gap-2">
			<a
				href="/report"
				class="flex-1 py-3 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
			>
				<i class="fa-solid fa-file-lines"></i> Zobrazit report
			</a>
			<a
				href="/reports"
				class="flex-1 py-3 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
			>
				<i class="fa-solid fa-clock-rotate-left"></i> Historie
			</a>
			<a
				href="/"
				class="flex-1 py-3 rounded-xl bg-navy-lighter border border-gray-700 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
			>
				<i class="fa-solid fa-arrow-up-from-bracket text-text-muted"></i>
				Nové
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
