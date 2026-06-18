<script lang="ts">
	import { onMount } from 'svelte';

	const langConfig: Record<string, { flag: string; label: string; name: string }> = {
		cs: { flag: '🇨🇿', label: 'CS', name: 'Čeština' },
		en: { flag: '🇬🇧', label: 'EN', name: 'English' },
		de: { flag: '🇩🇪', label: 'DE', name: 'Deutsch' }
	};

	let currentLang = $state('cs');
	let langDropdownOpen = $state(false);
	let mobileMenuOpen = $state(false);

	function setLang(lang: string) {
		const cfg = langConfig[lang];
		if (!cfg) return;
		currentLang = lang;
		langDropdownOpen = false;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('lang', lang);
		}
	}

	function toggleLangDropdown() {
		langDropdownOpen = !langDropdownOpen;
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function handleDocumentClick(event: MouseEvent) {
		const dropdown = document.getElementById('langDropdown');
		if (dropdown && !dropdown.contains(event.target as Node)) {
			langDropdownOpen = false;
		}
	}

	onMount(() => {
		const saved = localStorage.getItem('lang') || 'cs';
		if (langConfig[saved]) currentLang = saved;
		document.addEventListener('click', handleDocumentClick);
		return () => document.removeEventListener('click', handleDocumentClick);
	});
</script>

<svelte:head>
	<title>MetaCleaner — Funkce</title>
</svelte:head>

<div class="flex flex-col items-center w-full">
	<!-- Desktop Navbar -->
	<nav class="hidden md:flex w-full max-w-[1100px] mx-auto px-6 py-6 justify-between items-center z-50">
		<a href="/" class="flex items-center gap-3">
			<div
				class="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
			>
				<i class="fa-solid fa-shield-halved text-xl"></i>
			</div>
			<span class="text-xl font-bold tracking-tight">MetaCleaner</span>
		</a>
		<div class="flex items-center gap-8 text-sm font-medium text-text-muted">
			<a href="/#how-it-works" class="hover:text-white transition-colors">Jak to funguje</a>
			<a href="/features" class="text-white transition-colors">Funkce</a>
			<a href="/pricing" class="hover:text-white transition-colors">Ceník</a>
			<a href="/#faq" class="hover:text-white transition-colors">FAQ</a>
		</div>
		<div class="flex items-center gap-3">
			<div id="langDropdown" class="lang-dropdown">
				<button
					onclick={toggleLangDropdown}
					class="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-lighter border border-gray-700 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
				>
					<span>{langConfig[currentLang].flag}</span>
					<span>{langConfig[currentLang].label}</span>
					<i
						class="fa-solid fa-chevron-down text-text-muted text-xs ml-1 {langDropdownOpen
							? 'rotate-180'
							: ''}"
					></i>
				</button>
				<div class="lang-dropdown-menu {langDropdownOpen ? 'open' : ''}">
					{#each Object.entries(langConfig) as [lang, cfg]}
						<div
							onclick={() => setLang(lang)}
							class="lang-option {currentLang === lang ? 'active' : ''}"
							role="button"
							tabindex="0"
							onkeydown={(e) => e.key === 'Enter' && setLang(lang)}
						>
							<span class="lang-flag">{cfg.flag}</span>
							{cfg.name}
							<span class="lang-check {currentLang === lang ? '' : 'hidden'}">
								<i class="fa-solid fa-check text-xs"></i>
							</span>
						</div>
					{/each}
				</div>
			</div>
			<button
				class="hidden md:block px-5 py-2.5 rounded-lg text-sm font-semibold text-text-main hover:bg-navy-lighter transition-colors"
			>
				Přihlásit
			</button>
		</div>
	</nav>

	<!-- Mobile Navbar -->
	<nav
		class="md:hidden w-full px-4 py-4 flex justify-between items-center z-50 sticky top-0 bg-navy-main border-b border-gray-800/50"
	>
		<a href="/" class="flex items-center gap-2">
			<div
				class="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
			>
				<i class="fa-solid fa-shield-halved text-base"></i>
			</div>
			<span class="text-lg font-bold tracking-tight">MetaCleaner</span>
		</a>
		<button
			onclick={toggleMobileMenu}
			class="w-9 h-9 rounded-lg bg-navy-lighter border border-gray-700 flex items-center justify-center text-white"
		>
			<i class="fa-solid {mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-sm"></i>
		</button>
	</nav>

	<!-- Mobile Menu Dropdown -->
	<div
		class="mobile-menu {mobileMenuOpen
			? 'open'
			: ''} md:hidden w-full flex-col bg-navy-card border-b border-gray-800 px-4 py-4 gap-3 z-40"
	>
		<a
			href="/#how-it-works"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-text-muted py-3 border-b border-gray-800 flex items-center justify-between"
		>
			Jak to funguje <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/features"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-white py-3 border-b border-gray-800 flex items-center justify-between"
		>
			Funkce <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/pricing"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-text-muted py-3 border-b border-gray-800 flex items-center justify-between"
		>
			Ceník <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/#faq"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-text-muted py-3 border-b border-gray-800 flex items-center justify-between"
		>
			FAQ <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<button class="w-full mt-2 py-3 rounded-xl bg-brand-blue text-white text-sm font-semibold">
			Přihlásit
		</button>
	</div>

	<!-- Desktop Main Content -->
	<main class="hidden md:flex w-full max-w-[1100px] mx-auto px-6 pb-24 flex-col gap-16">
		<!-- Page Header -->
		<section id="features-header" class="text-center pt-8">
			<span class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block"
				>Funkce</span
			>
			<h1 class="text-5xl font-bold mb-4 leading-tight">
				Kompletní sada nástrojů<br />
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green"
					>pro ochranu soukromí</span
				>
			</h1>
			<p class="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
				Šest výkonných nástrojů v jedné aplikaci. Odstraňte metadata, detekujte AI obsah a získejte
				plnou kontrolu nad svými soubory.
			</p>
		</section>

		<!-- Feature 1: EXIF Metadata Removal -->
		<section id="feature-exif" class="w-full">
			<div class="flex flex-col lg:flex-row gap-10 items-center">
				<div class="flex flex-col gap-6 flex-1">
					<div class="inline-flex items-center gap-2 w-fit">
						<div
							class="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue text-xl"
						>
							<i class="fa-solid fa-broom"></i>
						</div>
						<span class="text-xs font-bold uppercase tracking-widest text-brand-blue">Funkce 01</span>
					</div>
					<h2 class="text-4xl font-bold leading-tight">EXIF Metadata Removal</h2>
					<p class="text-text-muted leading-relaxed max-w-2xl">
						Automaticky odstraní všechna skrytá metadata z vašich souborů. Žádná data nezůstanou —
						vaše soukromí je plně chráněno před sdílením.
					</p>
					<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
						<div
							class="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-card border border-gray-800"
						>
							<i class="fa-solid fa-location-dot text-brand-red"></i>
							<span class="text-sm font-medium">GPS souřadnice</span>
						</div>
						<div
							class="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-card border border-gray-800"
						>
							<i class="fa-solid fa-mobile-screen text-brand-orange"></i>
							<span class="text-sm font-medium">Info o zařízení</span>
						</div>
						<div
							class="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-card border border-gray-800"
						>
							<i class="fa-solid fa-user text-brand-blue"></i>
							<span class="text-sm font-medium">Autor souboru</span>
						</div>
						<div
							class="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-card border border-gray-800"
						>
							<i class="fa-solid fa-calendar text-brand-green"></i>
							<span class="text-sm font-medium">Datum a čas</span>
						</div>
						<div
							class="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-card border border-gray-800"
						>
							<i class="fa-solid fa-code text-text-muted"></i>
							<span class="text-sm font-medium">Software info</span>
						</div>
						<div
							class="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-card border border-gray-800"
						>
							<i class="fa-solid fa-camera text-brand-blue"></i>
							<span class="text-sm font-medium">Nastavení kamery</span>
						</div>
					</div>
				</div>
				<div class="flex-shrink-0 w-full lg:w-72 h-64 flex items-center justify-center">
					<div class="relative w-48 h-48 flex items-center justify-center">
						<div class="relative">
							<div
								class="w-28 h-36 bg-navy-card border-2 border-brand-blue/40 rounded-lg flex flex-col items-center justify-center gap-2 relative"
							>
								<div
									class="absolute -top-1 -right-1 w-7 h-7 bg-navy-main border-2 border-brand-blue/40 rounded-tr-lg rounded-bl-lg flex items-center justify-center"
								>
									<i class="fa-solid fa-camera text-brand-blue text-xs"></i>
								</div>
								<i class="fa-solid fa-image text-brand-blue/60 text-3xl mt-2"></i>
								<div class="flex flex-col gap-1 w-16">
									<div class="h-1.5 bg-brand-blue/30 rounded-full w-full"></div>
									<div class="h-1.5 bg-brand-blue/20 rounded-full w-3/4"></div>
								</div>
							</div>
							<div
								class="absolute -top-3 -left-10 flex items-center gap-1 bg-brand-red/20 border border-brand-red/40 rounded-md px-2 py-0.5 opacity-60"
							>
								<i class="fa-solid fa-location-dot text-brand-red text-xs"></i>
								<span class="text-xs text-brand-red font-mono">GPS</span>
								<i class="fa-solid fa-xmark text-brand-red text-xs ml-1"></i>
							</div>
							<div
								class="absolute -top-3 right-[-3.5rem] flex items-center gap-1 bg-brand-orange/20 border border-brand-orange/40 rounded-md px-2 py-0.5 opacity-60"
							>
								<i class="fa-solid fa-mobile-screen text-brand-orange text-xs"></i>
								<span class="text-xs text-brand-orange font-mono">DEV</span>
								<i class="fa-solid fa-xmark text-brand-orange text-xs ml-1"></i>
							</div>
							<div
								class="absolute bottom-4 -left-12 flex items-center gap-1 bg-text-muted/10 border border-text-muted/30 rounded-md px-2 py-0.5 opacity-50"
							>
								<i class="fa-solid fa-calendar text-text-muted text-xs"></i>
								<span class="text-xs text-text-muted font-mono">DATE</span>
								<i class="fa-solid fa-xmark text-text-muted text-xs ml-1"></i>
							</div>
							<div
								class="absolute -bottom-4 -right-4 w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center shadow-glow-blue"
							>
								<i class="fa-solid fa-broom text-white text-sm"></i>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Feature 2: AI Tool Detection -->
		<section id="feature-ai" class="w-full">
			<div class="flex flex-col lg:flex-row-reverse gap-10 items-center">
				<div class="flex flex-col gap-6 flex-1">
					<div class="inline-flex items-center gap-2 w-fit">
						<div
							class="w-12 h-12 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange text-xl"
						>
							<i class="fa-solid fa-robot"></i>
						</div>
						<span class="text-xs font-bold uppercase tracking-widest text-brand-orange"
							>Funkce 02</span
						>
					</div>
					<h2 class="text-4xl font-bold leading-tight">AI Tool Detection</h2>
					<p class="text-text-muted leading-relaxed max-w-2xl">
						Pokročilá detekce obsahu vytvořeného pomocí AI nástrojů. Identifikujte původ obrázku a
						zjistěte, zda byl generován umělou inteligencí.
					</p>
					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted">Detekce Midjourney, DALL·E, Stable Diffusion</span>
						</div>
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted">Adobe Firefly a další AI generátory</span>
						</div>
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted"
								>Procentuální pravděpodobnost pro každý nástroj</span
							>
						</div>
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted">Lokální analýza bez odesílání dat</span>
						</div>
					</div>
				</div>
				<div class="flex-shrink-0 w-full lg:w-72 h-64 flex items-center justify-center">
					<img
						class="w-full h-full object-contain"
						src="https://storage.googleapis.com/uxpilot-auth.appspot.com/13e0bf6e0f-aa80ce2947ef80f51f20.png"
						alt="robot face with magnifying glass scanning an image"
					/>
				</div>
			</div>
		</section>

		<!-- Feature 3: C2PA Removal -->
		<section id="feature-c2pa" class="w-full">
			<div class="flex flex-col lg:flex-row gap-10 items-center">
				<div class="flex flex-col gap-6 flex-1">
					<div class="inline-flex items-center gap-2 w-fit">
						<div
							class="w-12 h-12 rounded-xl bg-brand-green/20 flex items-center justify-center text-brand-green text-xl"
						>
							<i class="fa-solid fa-stamp"></i>
						</div>
						<span class="text-xs font-bold uppercase tracking-widest text-brand-green">Funkce 03</span>
					</div>
					<h2 class="text-4xl font-bold leading-tight">C2PA Removal</h2>
					<p class="text-text-muted leading-relaxed max-w-2xl">
						Odstraňte digitální podpisy a certifikáty obsahu z vašich souborů. C2PA standard je
						používán k označení AI-generovaného obsahu.
					</p>
					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted">Odstranění C2PA digitálních podpisů</span>
						</div>
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted">Vymazání Content Credentials certifikátů</span>
						</div>
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted"
								>Kompatibilní s Adobe, Microsoft, Google standardy</span
							>
						</div>
					</div>
				</div>
				<div class="flex-shrink-0 w-full lg:w-72 h-64 flex items-center justify-center">
					<div class="relative w-48 h-48 flex items-center justify-center">
						<div class="relative flex flex-col items-center">
							<div
								class="w-32 h-24 bg-navy-card border-2 border-brand-green/30 rounded-lg flex flex-col items-center justify-center gap-2 relative"
							>
								<div
									class="absolute -top-4 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-brand-green/20 border-2 border-brand-green/50 flex items-center justify-center"
								>
									<i class="fa-solid fa-stamp text-brand-green text-sm"></i>
								</div>
								<div class="mt-3 flex flex-col gap-1 w-20 items-center">
									<div class="h-1.5 bg-brand-green/30 rounded-full w-full"></div>
									<div class="h-1.5 bg-brand-green/20 rounded-full w-3/4"></div>
									<div class="h-1.5 bg-brand-green/20 rounded-full w-1/2"></div>
								</div>
							</div>
							<div class="absolute inset-0 flex items-center justify-center">
								<div
									class="w-16 h-16 rounded-full bg-brand-red/10 border-2 border-brand-red/60 flex items-center justify-center"
								>
									<i class="fa-solid fa-xmark text-brand-red text-3xl"></i>
								</div>
							</div>
							<div
								class="mt-4 px-3 py-1 rounded-full bg-navy-card border border-brand-green/30 flex items-center gap-2"
							>
								<i class="fa-solid fa-certificate text-brand-green/50 text-xs"></i>
								<span class="text-xs font-bold tracking-widest text-brand-green/70">C2PA</span>
								<i class="fa-solid fa-ban text-brand-red text-xs"></i>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Feature 4: Risk Scanner -->
		<section id="feature-risk" class="w-full">
			<div class="flex flex-col lg:flex-row-reverse gap-10 items-center">
				<div class="flex flex-col gap-6 flex-1">
					<div class="inline-flex items-center gap-2 w-fit">
						<div
							class="w-12 h-12 rounded-xl bg-brand-red/20 flex items-center justify-center text-brand-red text-xl"
						>
							<i class="fa-solid fa-shield-halved"></i>
						</div>
						<span class="text-xs font-bold uppercase tracking-widest text-brand-red">Funkce 04</span>
					</div>
					<h2 class="text-4xl font-bold leading-tight">Risk Scanner</h2>
					<p class="text-text-muted leading-relaxed max-w-2xl">
						Automaticky vyhodnotí míru rizika každého souboru. Získejte přehledné skóre a detailní
						analýzu potenciálních hrozeb pro vaše soukromí.
					</p>
					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted">Celkové rizikové skóre 0–100</span>
						</div>
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted"
								>Kategorizace rizik (GPS, identita, osobní data)</span
							>
						</div>
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted">Porovnání stavu před a po čištění</span>
						</div>
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted">Doporučení pro zvýšení bezpečnosti</span>
						</div>
					</div>
				</div>
				<div class="flex-shrink-0 w-full lg:w-72 h-64 flex items-center justify-center">
					<img
						class="w-full h-full object-contain"
						src="https://storage.googleapis.com/uxpilot-auth.appspot.com/8ecbe2e659-79866aab835cb0bd68bf.png"
						alt="shield with risk score gauge meter"
					/>
				</div>
			</div>
		</section>

		<!-- Feature 5: Batch Processing -->
		<section id="feature-batch" class="w-full">
			<div class="flex flex-col lg:flex-row gap-10 items-center">
				<div class="flex flex-col gap-6 flex-1">
					<div class="inline-flex items-center gap-2 w-fit">
						<div
							class="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue text-xl"
						>
							<i class="fa-solid fa-layer-group"></i>
						</div>
						<span class="text-xs font-bold uppercase tracking-widest text-brand-blue">Funkce 05</span>
					</div>
					<h2 class="text-4xl font-bold leading-tight">Batch Processing</h2>
					<p class="text-text-muted leading-relaxed max-w-2xl">
						Zpracujte stovky souborů najednou. Hromadné čištění metadat, AI detekce a skenování
						rizik pro celé složky souborů jediným kliknutím.
					</p>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
						<div
							class="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-card border border-gray-800"
						>
							<i class="fa-solid fa-images text-brand-blue"></i>
							<span class="text-sm font-medium">JPG, PNG, HEIC</span>
						</div>
						<div
							class="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-card border border-gray-800"
						>
							<i class="fa-solid fa-file-pdf text-brand-red"></i>
							<span class="text-sm font-medium">PDF dokumenty</span>
						</div>
						<div
							class="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-card border border-gray-800"
						>
							<i class="fa-solid fa-file-video text-brand-orange"></i>
							<span class="text-sm font-medium">Video soubory</span>
						</div>
						<div
							class="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-card border border-gray-800"
						>
							<i class="fa-solid fa-folder-open text-brand-green"></i>
							<span class="text-sm font-medium">Celé složky</span>
						</div>
					</div>
				</div>
				<div class="flex-shrink-0 w-full lg:w-72 h-64 flex items-center justify-center">
					<img
						class="w-full h-full object-contain"
						src="https://storage.googleapis.com/uxpilot-auth.appspot.com/086bb62676-9932975e36639131dcde.png"
						alt="multiple stacked file documents being processed simultaneously"
					/>
				</div>
			</div>
		</section>

		<!-- Feature 6: PDF Report -->
		<section id="feature-pdf" class="w-full">
			<div class="flex flex-col lg:flex-row-reverse gap-10 items-center">
				<div class="flex flex-col gap-6 flex-1">
					<div class="inline-flex items-center gap-2 w-fit">
						<div
							class="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue text-xl"
						>
							<i class="fa-solid fa-file-pdf"></i>
						</div>
						<span class="text-xs font-bold uppercase tracking-widest text-brand-blue">Funkce 06</span>
					</div>
					<h2 class="text-4xl font-bold leading-tight">PDF Report</h2>
					<p class="text-text-muted leading-relaxed max-w-2xl">
						Generujte detailní PDF zprávy o všech činnostech. Získejte kompletní přehled o čištění,
						detekci AI a analýze rizik pro každý soubor.
					</p>
					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted">Všechny detekce a čištění</span>
						</div>
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted">Analýza rizik a doporučení</span>
						</div>
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted">Hromadné zpracování výsledků</span>
						</div>
						<div class="flex items-center gap-3">
							<i class="fa-solid fa-check text-brand-green text-sm"></i>
							<span class="text-sm text-text-muted">Závěrečná kontrola a závěry</span>
						</div>
					</div>
				</div>
				<div class="flex-shrink-0 w-full lg:w-72 h-64 flex items-center justify-center">
					<img
						class="w-full h-full object-contain"
						src="https://storage.googleapis.com/uxpilot-auth.appspot.com/7c7b53abbf-a7c6cc514cdacd768cbf.png"
						alt="PDF document report with charts and checkmarks"
					/>
				</div>
			</div>
		</section>
	</main>

	<!-- Desktop Footer -->
	<footer class="hidden md:block w-full border-t border-gray-800 mt-8">
		<div class="w-full max-w-[1100px] mx-auto px-6 py-12">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
				<!-- Brand + Social -->
				<div class="flex flex-col gap-4 md:col-span-1">
					<div class="flex items-center gap-3">
						<div
							class="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
						>
							<i class="fa-solid fa-shield-halved text-xl"></i>
						</div>
						<span class="text-xl font-bold tracking-tight">MetaCleaner</span>
					</div>
					<p class="text-text-muted text-sm leading-relaxed">
						Kompletní ochrana soukromí pro vaše soubory. Bez odesílání dat, bez kompromisů.
					</p>
					<div class="flex items-center gap-3 mt-1">
						<a
							href="#"
							class="w-9 h-9 rounded-lg bg-navy-card border border-gray-800 flex items-center justify-center text-text-muted hover:text-white hover:border-gray-600 transition-all"
						>
							<i class="fa-brands fa-twitter text-sm"></i>
						</a>
						<a
							href="#"
							class="w-9 h-9 rounded-lg bg-navy-card border border-gray-800 flex items-center justify-center text-text-muted hover:text-white hover:border-gray-600 transition-all"
						>
							<i class="fa-brands fa-github text-sm"></i>
						</a>
						<a
							href="#"
							class="w-9 h-9 rounded-lg bg-navy-card border border-gray-800 flex items-center justify-center text-text-muted hover:text-white hover:border-gray-600 transition-all"
						>
							<i class="fa-brands fa-linkedin text-sm"></i>
						</a>
					</div>
				</div>
				<!-- Produkt -->
				<div class="flex flex-col gap-4">
					<span class="text-xs font-bold uppercase tracking-widest text-text-muted">Produkt</span>
					<div class="flex flex-col gap-3">
						<a href="/#how-it-works" class="text-sm text-text-muted hover:text-white transition-colors"
							>Jak to funguje</a
						>
						<a href="/features" class="text-sm text-text-muted hover:text-white transition-colors"
							>Funkce</a
						>
						<a href="/pricing" class="text-sm text-text-muted hover:text-white transition-colors"
							>Ceník</a
						>
						<a href="/#faq" class="text-sm text-text-muted hover:text-white transition-colors">FAQ</a>
					</div>
				</div>
				<!-- Funkce Links -->
				<div class="flex flex-col gap-4">
					<span class="text-xs font-bold uppercase tracking-widest text-text-muted">Funkce</span>
					<div class="flex flex-col gap-3">
						<a href="#feature-exif" class="text-sm text-text-muted hover:text-white transition-colors"
							>EXIF Removal</a
						>
						<a href="#feature-ai" class="text-sm text-text-muted hover:text-white transition-colors"
							>AI Detection</a
						>
						<a href="#feature-c2pa" class="text-sm text-text-muted hover:text-white transition-colors"
							>C2PA Removal</a
						>
						<a href="#feature-risk" class="text-sm text-text-muted hover:text-white transition-colors"
							>Risk Scanner</a
						>
						<a href="#feature-batch" class="text-sm text-text-muted hover:text-white transition-colors"
							>Batch Processing</a
						>
						<a href="#feature-pdf" class="text-sm text-text-muted hover:text-white transition-colors"
							>PDF Report</a
						>
					</div>
				</div>
				<!-- Právní -->
				<div class="flex flex-col gap-4">
					<span class="text-xs font-bold uppercase tracking-widest text-text-muted">Právní</span>
					<div class="flex flex-col gap-3">
						<a href="#" class="text-sm text-text-muted hover:text-white transition-colors"
							>Ochrana soukromí</a
						>
						<a href="#" class="text-sm text-text-muted hover:text-white transition-colors"
							>Podmínky použití</a
						>
						<a href="#" class="text-sm text-text-muted hover:text-white transition-colors">GDPR</a>
						<a href="#" class="text-sm text-text-muted hover:text-white transition-colors">Kontakt</a>
					</div>
				</div>
			</div>
			<div
				class="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
			>
				<span class="text-xs text-text-muted">© 2024 MetaCleaner. Všechna práva vyhrazena.</span>
				<div class="flex items-center gap-2">
					<span class="text-xs text-text-muted">Vyrobeno s</span>
					<i class="fa-solid fa-heart text-brand-red text-xs"></i>
					<span class="text-xs text-text-muted">pro ochranu vašeho soukromí</span>
				</div>
			</div>
		</div>
	</footer>

	<!-- Mobile Main Content -->
	<main class="md:hidden w-full px-4 pb-16 flex flex-col gap-2">
		<!-- Page Header -->
		<section class="text-center pt-8 pb-6 px-2">
			<span class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block"
				>Funkce</span
			>
			<h1 class="text-3xl font-bold mb-3 leading-tight">
				Kompletní sada nástrojů<br />
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green"
					>pro ochranu soukromí</span
				>
			</h1>
			<p class="text-text-muted text-sm leading-relaxed">
				Šest výkonných nástrojů v jedné aplikaci. Odstraňte metadata, detekujte AI obsah a získejte
				plnou kontrolu nad svými soubory.
			</p>
		</section>

		<!-- Feature 1: EXIF (Mobile Card) -->
		<section class="w-full mb-3">
			<div class="bg-navy-card rounded-2xl border border-gray-800 overflow-hidden">
				<div class="w-full flex items-center gap-3 px-4 py-4">
					<div
						class="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue text-base flex-shrink-0"
					>
						<i class="fa-solid fa-broom"></i>
					</div>
					<div class="flex-1 min-w-0">
						<div class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-0.5">
							Funkce 01
						</div>
						<div class="text-base font-bold">EXIF Metadata Removal</div>
					</div>
				</div>
				<div class="px-4 pb-5">
					<p class="text-text-muted text-sm leading-relaxed mb-4">
						Automaticky odstraní všechna skrytá metadata z vašich souborů. Žádná data nezůstanou —
						vaše soukromí je plně chráněno před sdílením.
					</p>
					<div class="grid grid-cols-2 gap-2">
						<div
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-lighter border border-gray-800"
						>
							<i class="fa-solid fa-location-dot text-brand-red text-sm"></i>
							<span class="text-xs font-medium">GPS souřadnice</span>
						</div>
						<div
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-lighter border border-gray-800"
						>
							<i class="fa-solid fa-mobile-screen text-brand-orange text-sm"></i>
							<span class="text-xs font-medium">Info o zařízení</span>
						</div>
						<div
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-lighter border border-gray-800"
						>
							<i class="fa-solid fa-user text-brand-blue text-sm"></i>
							<span class="text-xs font-medium">Autor souboru</span>
						</div>
						<div
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-lighter border border-gray-800"
						>
							<i class="fa-solid fa-calendar text-brand-green text-sm"></i>
							<span class="text-xs font-medium">Datum a čas</span>
						</div>
						<div
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-lighter border border-gray-800"
						>
							<i class="fa-solid fa-code text-text-muted text-sm"></i>
							<span class="text-xs font-medium">Software info</span>
						</div>
						<div
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-lighter border border-gray-800"
						>
							<i class="fa-solid fa-camera text-brand-blue text-sm"></i>
							<span class="text-xs font-medium">Nastavení kamery</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Feature 2: AI Detection (Mobile Card) -->
		<section class="w-full mb-3">
			<div class="bg-navy-card rounded-2xl border border-gray-800 overflow-hidden">
				<div class="w-full flex items-center gap-3 px-4 py-4">
					<div
						class="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange text-base flex-shrink-0"
					>
						<i class="fa-solid fa-robot"></i>
					</div>
					<div class="flex-1 min-w-0">
						<div class="text-xs font-bold uppercase tracking-widest text-brand-orange mb-0.5">
							Funkce 02
						</div>
						<div class="text-base font-bold">AI Tool Detection</div>
					</div>
				</div>
				<div class="px-4 pb-5">
					<p class="text-text-muted text-sm leading-relaxed mb-4">
						Pokročilá detekce obsahu vytvořeného pomocí AI nástrojů. Identifikujte původ obrázku a
						zjistěte, zda byl generován umělou inteligencí.
					</p>
					<div class="flex flex-col gap-2.5">
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted">Detekce Midjourney, DALL·E, Stable Diffusion</span>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted">Adobe Firefly a další AI generátory</span>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted"
								>Procentuální pravděpodobnost pro každý nástroj</span
							>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted">Lokální analýza bez odesílání dat</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Feature 3: C2PA (Mobile Card) -->
		<section class="w-full mb-3">
			<div class="bg-navy-card rounded-2xl border border-gray-800 overflow-hidden">
				<div class="w-full flex items-center gap-3 px-4 py-4">
					<div
						class="w-10 h-10 rounded-xl bg-brand-green/20 flex items-center justify-center text-brand-green text-base flex-shrink-0"
					>
						<i class="fa-solid fa-stamp"></i>
					</div>
					<div class="flex-1 min-w-0">
						<div class="text-xs font-bold uppercase tracking-widest text-brand-green mb-0.5">
							Funkce 03
						</div>
						<div class="text-base font-bold">C2PA Removal</div>
					</div>
				</div>
				<div class="px-4 pb-5">
					<p class="text-text-muted text-sm leading-relaxed mb-4">
						Odstraňte digitální podpisy a certifikáty obsahu z vašich souborů. C2PA standard je
						používán k označení AI-generovaného obsahu.
					</p>
					<div class="flex flex-col gap-2.5">
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted">Odstranění C2PA digitálních podpisů</span>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted">Vymazání Content Credentials certifikátů</span>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted"
								>Kompatibilní s Adobe, Microsoft, Google standardy</span
							>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Feature 4: Risk Scanner (Mobile Card) -->
		<section class="w-full mb-3">
			<div class="bg-navy-card rounded-2xl border border-gray-800 overflow-hidden">
				<div class="w-full flex items-center gap-3 px-4 py-4">
					<div
						class="w-10 h-10 rounded-xl bg-brand-red/20 flex items-center justify-center text-brand-red text-base flex-shrink-0"
					>
						<i class="fa-solid fa-shield-halved"></i>
					</div>
					<div class="flex-1 min-w-0">
						<div class="text-xs font-bold uppercase tracking-widest text-brand-red mb-0.5">
							Funkce 04
						</div>
						<div class="text-base font-bold">Risk Scanner</div>
					</div>
				</div>
				<div class="px-4 pb-5">
					<p class="text-text-muted text-sm leading-relaxed mb-4">
						Automaticky vyhodnotí míru rizika každého souboru. Získejte přehledné skóre a detailní
						analýzu potenciálních hrozeb pro vaše soukromí.
					</p>
					<div class="flex flex-col gap-2.5">
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted">Celkové rizikové skóre 0–100</span>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted"
								>Kategorizace rizik (GPS, identita, osobní data)</span
							>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted">Porovnání stavu před a po čištění</span>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted">Doporučení pro zvýšení bezpečnosti</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Feature 5: Batch Processing (Mobile Card) -->
		<section class="w-full mb-3">
			<div class="bg-navy-card rounded-2xl border border-gray-800 overflow-hidden">
				<div class="w-full flex items-center gap-3 px-4 py-4">
					<div
						class="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue text-base flex-shrink-0"
					>
						<i class="fa-solid fa-layer-group"></i>
					</div>
					<div class="flex-1 min-w-0">
						<div class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-0.5">
							Funkce 05
						</div>
						<div class="text-base font-bold">Batch Processing</div>
					</div>
				</div>
				<div class="px-4 pb-5">
					<p class="text-text-muted text-sm leading-relaxed mb-4">
						Zpracujte stovky souborů najednou. Hromadné čištění metadat, AI detekce a skenování
						rizik pro celé složky souborů jediným kliknutím.
					</p>
					<div class="grid grid-cols-2 gap-2">
						<div
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-lighter border border-gray-800"
						>
							<i class="fa-solid fa-images text-brand-blue text-sm"></i>
							<span class="text-xs font-medium">JPG, PNG, HEIC</span>
						</div>
						<div
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-lighter border border-gray-800"
						>
							<i class="fa-solid fa-file-pdf text-brand-red text-sm"></i>
							<span class="text-xs font-medium">PDF dokumenty</span>
						</div>
						<div
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-lighter border border-gray-800"
						>
							<i class="fa-solid fa-file-video text-brand-orange text-sm"></i>
							<span class="text-xs font-medium">Video soubory</span>
						</div>
						<div
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-lighter border border-gray-800"
						>
							<i class="fa-solid fa-folder-open text-brand-green text-sm"></i>
							<span class="text-xs font-medium">Celé složky</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Feature 6: PDF Report (Mobile Card) -->
		<section class="w-full mb-3">
			<div class="bg-navy-card rounded-2xl border border-gray-800 overflow-hidden">
				<div class="w-full flex items-center gap-3 px-4 py-4">
					<div
						class="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue text-base flex-shrink-0"
					>
						<i class="fa-solid fa-file-pdf"></i>
					</div>
					<div class="flex-1 min-w-0">
						<div class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-0.5">
							Funkce 06
						</div>
						<div class="text-base font-bold">PDF Report</div>
					</div>
				</div>
				<div class="px-4 pb-5">
					<p class="text-text-muted text-sm leading-relaxed mb-4">
						Generujte detailní PDF zprávy o všech činnostech. Získejte kompletní přehled o čištění,
						detekci AI a analýze rizik pro každý soubor.
					</p>
					<div class="flex flex-col gap-2.5">
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted">Všechny detekce a čištění</span>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted">Analýza rizik a doporučení</span>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted">Hromadné zpracování výsledků</span>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
							<span class="text-sm text-text-muted">Závěrečná kontrola a závěry</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- CTA Section (Mobile only) -->
		<section id="cta-section" class="w-full mt-4 mb-6">
			<div
				class="bg-gradient-to-br from-brand-blue/20 to-brand-green/10 rounded-2xl border border-brand-blue/30 p-6 text-center"
			>
				<h2 class="text-xl font-bold mb-2">Začněte zdarma</h2>
				<p class="text-text-muted text-sm mb-5">Vyzkoušejte všechny funkce bez registrace.</p>
				<button
					class="w-full py-3.5 rounded-xl bg-brand-green text-white font-semibold text-sm shadow-glow-green"
				>
					Vyzkoušet zdarma
				</button>
			</div>
		</section>
	</main>

	<!-- Mobile Footer -->
	<footer class="md:hidden w-full border-t border-gray-800">
		<div class="px-4 py-8">
			<div class="flex items-center gap-3 mb-4">
				<div
					class="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
				>
					<i class="fa-solid fa-shield-halved text-base"></i>
				</div>
				<span class="text-lg font-bold tracking-tight">MetaCleaner</span>
			</div>
			<p class="text-text-muted text-sm leading-relaxed mb-4">
				Kompletní ochrana soukromí pro vaše soubory. Bez odesílání dat, bez kompromisů.
			</p>
			<div class="flex items-center gap-2 mb-6">
				<a
					href="#"
					class="w-9 h-9 rounded-lg bg-navy-card border border-gray-800 flex items-center justify-center text-text-muted"
				>
					<i class="fa-brands fa-twitter text-sm"></i>
				</a>
				<a
					href="#"
					class="w-9 h-9 rounded-lg bg-navy-card border border-gray-800 flex items-center justify-center text-text-muted"
				>
					<i class="fa-brands fa-github text-sm"></i>
				</a>
				<a
					href="#"
					class="w-9 h-9 rounded-lg bg-navy-card border border-gray-800 flex items-center justify-center text-text-muted"
				>
					<i class="fa-brands fa-linkedin text-sm"></i>
				</a>
			</div>
		</div>
	</footer>
</div>
