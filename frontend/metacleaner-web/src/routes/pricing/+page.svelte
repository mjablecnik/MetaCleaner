<script lang="ts">
	import { onMount } from 'svelte';

	const langConfig: Record<string, { flag: string; label: string; name: string }> = {
		cs: { flag: '🇨🇿', label: 'CS', name: 'Čeština' },
		en: { flag: '🇬🇧', label: 'EN', name: 'English' }
	};

	let currentLang = $state('cs');
	let langDropdownOpen = $state(false);
	let mobileMenuOpen = $state(false);
	let currentBilling = $state<'monthly' | 'yearly'>('monthly');

	const isYearly = $derived(currentBilling === 'yearly');

	const proPrice = $derived(isYearly ? '€57,51' : '€5,99');
	const proplusPrice = $derived(isYearly ? '€124,71' : '€12,99');

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

	const t = $derived({
		pricing: currentLang === 'en' ? 'Pricing' : 'Ceník',
		subtitle:
			currentLang === 'en' ? 'Simple pricing. Credits never expire.' : 'Jednoduché ceny. Kredity nevyprší.',
		monthly: currentLang === 'en' ? 'Monthly' : 'Měsíčně',
		yearly: currentLang === 'en' ? 'Yearly' : 'Ročně',
		free: currentLang === 'en' ? 'Free' : 'Zdarma',
		forStarters: currentLang === 'en' ? 'For starters' : 'Pro začátek',
		freePhotos: currentLang === 'en' ? '3 free photos' : '3 fotky zdarma',
		allFormats:
			currentLang === 'en' ? 'All formats (JPG, PNG, HEIC, WEBP)' : 'Všechny formáty (JPG, PNG, HEIC, WEBP)',
		removeExif: currentLang === 'en' ? 'Remove EXIF + C2PA' : 'Odstranění EXIF + C2PA',
		noCard: currentLang === 'en' ? 'No credit card required' : 'Bez platební karty',
		startFree: currentLang === 'en' ? 'Start for free' : 'Začít zdarma',
		photos50: currentLang === 'en' ? '50 photos' : '50 fotek',
		creditsNoExpire: currentLang === 'en' ? 'Credits never expire' : 'Kredity nevyprší',
		photos50Pack: currentLang === 'en' ? '50 photos in package' : '50 fotek v balíčku',
		batchProcessing: currentLang === 'en' ? 'Batch processing' : 'Hromadné zpracování',
		allFormatsShort: currentLang === 'en' ? 'All formats' : 'Všechny formáty',
		pdfReport: currentLang === 'en' ? 'PDF report — €1.99 / report' : 'PDF report — €1,99 / report',
		buy: currentLang === 'en' ? 'Buy →' : 'Koupit →',
		pro: 'Pro',
		mostPopular: currentLang === 'en' ? 'Most Popular' : 'Nejoblíbenější',
		photos100Monthly: currentLang === 'en' ? '100 photos monthly' : '100 fotek měsíčně',
		photos100Month: currentLang === 'en' ? '100 photos / month' : '100 fotek / měsíc',
		riskScanner: currentLang === 'en' ? 'Risk Scanner (Clean Score 0–100)' : 'Risk Scanner (Clean Score 0–100)',
		pdfIncluded: currentLang === 'en' ? 'PDF report included' : 'PDF report v ceně',
		history30: currentLang === 'en' ? '30-day cleaning history' : 'Historie čištění 30 dní',
		activatePro: currentLang === 'en' ? 'Activate Pro →' : 'Aktivovat Pro →',
		savePro: currentLang === 'en' ? 'Save €14.37' : 'Ušetříte €14,37',
		saveProplus: currentLang === 'en' ? 'Save €31.17' : 'Ušetříte €31,17',
		proplus: 'Pro+',
		photos300Monthly: currentLang === 'en' ? '300 photos monthly' : '300 fotek měsíčně',
		photos300Month: currentLang === 'en' ? '300 photos / month' : '300 fotek / měsíc',
		everythingPro: currentLang === 'en' ? 'Everything in Pro plan' : 'Vše z Pro plánu',
		bulkApi: currentLang === 'en' ? 'Bulk API access' : 'Bulk API přístup',
		prioritySupport: currentLang === 'en' ? 'Priority support' : 'Prioritní podpora',
		comingSoon: currentLang === 'en' ? 'Coming soon' : 'Připravujeme',
		enterprise: currentLang === 'en' ? 'Enterprise — custom' : 'Enterprise — na míru',
		enterpriseDesc:
			currentLang === 'en'
				? "High volume photos, API integration, invoicing, corporate account. We'll agree on a price and activate credits directly to your account."
				: 'Velký objem fotek, API integrace, faktura, firemní účet. Domluvíme cenu a aktivujeme kredity přímo na váš účet.',
		contactUs: currentLang === 'en' ? 'Contact us →' : 'Kontaktujte nás →',
		copyright:
			currentLang === 'en'
				? '© 2024 MetaCleaner. All rights reserved.'
				: '© 2024 MetaCleaner. Všechna práva vyhrazena.',
		privacy: currentLang === 'en' ? 'Privacy Policy' : 'Zásady ochrany soukromí',
		terms: currentLang === 'en' ? 'Terms of Service' : 'Podmínky použití',
		login: currentLang === 'en' ? 'Log In' : 'Přihlásit',
		howItWorks: currentLang === 'en' ? 'How it Works' : 'Jak to funguje',
		features: currentLang === 'en' ? 'Features' : 'Funkce',
		faq: 'FAQ'
	});
</script>

<svelte:head>
	<title>MetaCleaner — Ceník</title>
</svelte:head>

<div class="flex flex-col items-center w-full min-h-screen">
	<!-- Desktop Navbar -->
	<nav
		class="hidden md:flex w-full max-w-[1100px] mx-auto px-6 py-6 justify-between items-center z-50"
	>
		<a href="/" class="flex items-center gap-3">
			<div
				class="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
			>
				<i class="fa-solid fa-shield-halved text-xl"></i>
			</div>
			<span class="text-xl font-bold tracking-tight">MetaCleaner</span>
		</a>
		<div class="flex items-center gap-8 text-sm font-medium text-text-muted">
			<a href="/#how-it-works" class="hover:text-white transition-colors">{t.howItWorks}</a>
			<a href="/features" class="hover:text-white transition-colors">{t.features}</a>
			<a href="/pricing" class="text-white transition-colors">{t.pricing}</a>
			<a href="/#faq" class="hover:text-white transition-colors">{t.faq}</a>
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
				{t.login}
			</button>
		</div>
	</nav>

	<!-- Mobile Navbar -->
	<nav
		class="md:hidden w-full px-4 py-4 flex justify-between items-center z-50 sticky top-0 bg-navy-main border-b border-gray-800"
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
			{t.howItWorks} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/features"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-text-muted py-3 border-b border-gray-800 flex items-center justify-between"
		>
			{t.features} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/pricing"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-white py-3 border-b border-gray-800 flex items-center justify-between"
		>
			{t.pricing} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/#faq"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-text-muted py-3 border-b border-gray-800 flex items-center justify-between"
		>
			{t.faq} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<button class="w-full mt-2 py-3 rounded-xl bg-brand-blue text-white text-sm font-semibold">
			{t.login}
		</button>
	</div>

	<!-- Desktop Main -->
	<main
		class="hidden md:flex w-full max-w-[1100px] mx-auto px-6 py-16 flex-col items-center flex-1"
	>
		<!-- Header -->
		<div class="text-center mb-10">
			<h1 class="text-4xl md:text-5xl font-bold mb-4">{t.pricing}</h1>
			<p class="text-text-muted text-lg mb-8">{t.subtitle}</p>
			<!-- Billing Toggle -->
			<div
				class="inline-flex items-center bg-navy-card border border-gray-800 rounded-xl p-1 gap-1"
			>
				<button
					onclick={() => (currentBilling = 'monthly')}
					class="px-5 py-2 rounded-lg text-sm font-semibold transition-all {!isYearly
						? 'bg-brand-blue text-white shadow'
						: 'text-text-muted hover:text-white'}"
				>
					{t.monthly}
				</button>
				<button
					onclick={() => (currentBilling = 'yearly')}
					class="px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 {isYearly
						? 'bg-brand-blue text-white shadow'
						: 'text-text-muted hover:text-white'}"
				>
					{t.yearly}<span
						class="bg-brand-green text-white text-xs font-bold px-2 py-0.5 rounded-full">−20%</span
					>
				</button>
			</div>
		</div>

		<!-- Pricing Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-10">
			<!-- Zdarma -->
			<div
				class="bg-navy-card rounded-2xl border border-gray-800 p-8 flex flex-col relative h-full"
			>
				<h3 class="text-xl font-bold text-center mb-6">{t.free}</h3>
				<div class="text-center mb-2">
					<span class="text-5xl font-black">€0</span>
				</div>
				<p class="text-sm text-text-muted text-center mb-8">{t.forStarters}</p>
				<ul class="flex flex-col gap-4 mb-8 flex-1">
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium">{t.freePhotos}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.allFormats}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.removeExif}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.noCard}</span>
					</li>
				</ul>
				<button
					class="w-full py-3 rounded-lg border border-gray-700 text-white font-semibold hover:bg-navy-lighter transition-colors mt-auto"
				>
					{t.startFree}
				</button>
			</div>

			<!-- 50 fotek -->
			<div
				class="bg-navy-card rounded-2xl border border-gray-800 p-8 flex flex-col relative h-full"
			>
				<h3 class="text-xl font-bold text-center mb-6">{t.photos50}</h3>
				<div class="text-center mb-2 flex justify-center items-end gap-1">
					<span class="text-5xl font-black">€4</span>
					<span class="text-text-muted mb-1 text-sm">/ 50 fotek</span>
				</div>
				<p class="text-sm text-text-muted text-center mb-8">{t.creditsNoExpire}</p>
				<ul class="flex flex-col gap-4 mb-8 flex-1">
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium">{t.photos50Pack}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.removeExif}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.batchProcessing}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.allFormatsShort}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.pdfReport}</span>
					</li>
				</ul>
				<button
					class="w-full py-3 rounded-lg bg-brand-blue text-white font-semibold hover:bg-blue-600 transition-colors mt-auto"
				>
					{t.buy}
				</button>
			</div>

			<!-- Pro (Featured) -->
			<div
				class="bg-navy-card rounded-2xl border-2 border-brand-blue p-8 flex flex-col relative h-full transform scale-105 z-10 shadow-glow-blue"
			>
				<div
					class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
				>
					{t.mostPopular}
				</div>
				<h3 class="text-xl font-bold text-center mb-6">{t.pro}</h3>
				<div class="text-center mb-1 flex justify-center items-end gap-1">
					<span class="text-5xl font-black">{proPrice}</span>
				</div>
				{#if isYearly}
					<div class="text-center mb-1">
						<span class="text-xs text-text-muted line-through">€71,88</span>
						<span class="text-xs text-brand-green font-bold ml-1">{t.savePro}</span>
					</div>
				{/if}
				<p class="text-sm text-text-muted text-center mb-8">{t.photos100Month}</p>
				<ul class="flex flex-col gap-4 mb-8 flex-1">
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium">{t.photos100Monthly}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.removeExif}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.riskScanner}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.pdfIncluded}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.history30}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.batchProcessing}</span>
					</li>
				</ul>
				<button
					class="w-full py-3 rounded-lg bg-brand-blue text-white font-semibold hover:bg-blue-600 transition-colors mt-auto flex items-center justify-center gap-2"
				>
					<i class="fa-solid fa-bolt text-brand-orange"></i>
					{t.activatePro}
				</button>
			</div>

			<!-- Pro+ -->
			<div
				class="bg-navy-card rounded-2xl border border-gray-800 p-8 flex flex-col relative h-full"
			>
				<h3 class="text-xl font-bold text-center mb-6">{t.proplus}</h3>
				<div class="text-center mb-1 flex justify-center items-end gap-1">
					<span class="text-5xl font-black">{proplusPrice}</span>
				</div>
				{#if isYearly}
					<div class="text-center mb-1">
						<span class="text-xs text-text-muted line-through">€155,88</span>
						<span class="text-xs text-brand-green font-bold ml-1">{t.saveProplus}</span>
					</div>
				{/if}
				<p class="text-sm text-text-muted text-center mb-8">{t.photos300Month}</p>
				<ul class="flex flex-col gap-4 mb-8 flex-1">
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium">{t.photos300Monthly}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.everythingPro}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.bulkApi}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{t.prioritySupport}</span>
					</li>
				</ul>
				<button
					disabled
					class="w-full py-3 rounded-lg border border-gray-700 text-text-muted font-semibold cursor-not-allowed mt-auto"
				>
					{t.comingSoon}
				</button>
			</div>
		</div>

		<!-- Enterprise Banner -->
		<div
			class="w-full bg-navy-card border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
		>
			<div>
				<h4 class="text-lg font-bold mb-2">{t.enterprise}</h4>
				<p class="text-sm text-text-muted">{t.enterpriseDesc}</p>
			</div>
			<button
				class="px-6 py-3 rounded-lg border border-gray-700 text-white font-semibold hover:bg-navy-lighter transition-colors whitespace-nowrap"
			>
				{t.contactUs}
			</button>
		</div>
	</main>

	<!-- Mobile Main -->
	<main class="md:hidden w-full px-4 py-8 flex flex-col items-center flex-1">
		<!-- Header -->
		<div class="text-center mb-6 w-full">
			<h1 class="text-3xl font-bold mb-2">{t.pricing}</h1>
			<p class="text-text-muted text-sm mb-5">{t.subtitle}</p>
			<!-- Billing Toggle -->
			<div
				class="inline-flex items-center bg-navy-card border border-gray-800 rounded-xl p-1 gap-1"
			>
				<button
					onclick={() => (currentBilling = 'monthly')}
					class="px-5 py-2 rounded-lg text-sm font-semibold transition-all {!isYearly
						? 'bg-brand-blue text-white shadow'
						: 'text-text-muted'}"
				>
					{t.monthly}
				</button>
				<button
					onclick={() => (currentBilling = 'yearly')}
					class="px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 {isYearly
						? 'bg-brand-blue text-white shadow'
						: 'text-text-muted'}"
				>
					{t.yearly}<span
						class="bg-brand-green text-white text-xs font-bold px-2 py-0.5 rounded-full">−20%</span
					>
				</button>
			</div>
		</div>

		<!-- Pricing Cards -->
		<div class="flex flex-col gap-4 w-full mb-6">
			<!-- Free -->
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-5 flex flex-col">
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-lg font-bold">{t.free}</h3>
					<div class="flex items-end gap-1">
						<span class="text-3xl font-black">€0</span>
					</div>
				</div>
				<p class="text-xs text-text-muted mb-4">{t.forStarters}</p>
				<ul class="flex flex-col gap-2.5 mb-4">
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm font-medium">{t.freePhotos}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.allFormats}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.removeExif}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.noCard}</span>
					</li>
				</ul>
				<button
					class="w-full py-3 rounded-xl border border-gray-700 text-white font-semibold text-sm hover:bg-navy-lighter transition-colors"
				>
					{t.startFree}
				</button>
			</div>

			<!-- 50 fotek -->
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-5 flex flex-col">
				<div class="flex items-center justify-between mb-1">
					<h3 class="text-lg font-bold">{t.photos50}</h3>
					<div class="flex items-end gap-1">
						<span class="text-3xl font-black">€4</span>
						<span class="text-text-muted text-xs mb-1">/ 50 fotek</span>
					</div>
				</div>
				<p class="text-xs text-text-muted mb-4">{t.creditsNoExpire}</p>
				<ul class="flex flex-col gap-2.5 mb-4">
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm font-medium">{t.photos50Pack}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.removeExif}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.batchProcessing}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.allFormatsShort}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.pdfReport}</span>
					</li>
				</ul>
				<button
					class="w-full py-3 rounded-xl bg-brand-blue text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
				>
					{t.buy}
				</button>
			</div>

			<!-- Pro (Featured) -->
			<div
				class="bg-navy-card rounded-2xl border-2 border-brand-blue p-5 flex flex-col relative shadow-glow-blue"
			>
				<div
					class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
				>
					{t.mostPopular}
				</div>
				<div class="flex items-center justify-between mb-1 mt-2">
					<h3 class="text-lg font-bold">{t.pro}</h3>
					<div class="flex flex-col items-end">
						<div class="flex items-end gap-1">
							<span class="text-3xl font-black">{proPrice}</span>
							<span class="text-text-muted text-xs mb-1">/ měs</span>
						</div>
						{#if isYearly}
							<div class="text-right">
								<span class="text-xs text-text-muted line-through">€71,88</span>
								<span class="text-xs text-brand-green font-bold ml-1">{t.savePro}</span>
							</div>
						{/if}
					</div>
				</div>
				<p class="text-xs text-text-muted mb-4">{t.photos100Month}</p>
				<ul class="flex flex-col gap-2.5 mb-4">
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm font-medium">{t.photos100Monthly}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.removeExif}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.riskScanner}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.pdfIncluded}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.history30}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.batchProcessing}</span>
					</li>
				</ul>
				<button
					class="w-full py-3 rounded-xl bg-brand-blue text-white font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
				>
					<i class="fa-solid fa-bolt text-brand-orange"></i>
					{t.activatePro}
				</button>
			</div>

			<!-- Pro+ -->
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-5 flex flex-col">
				<div class="flex items-center justify-between mb-1">
					<h3 class="text-lg font-bold">{t.proplus}</h3>
					<div class="flex flex-col items-end">
						<div class="flex items-end gap-1">
							<span class="text-3xl font-black">{proplusPrice}</span>
							<span class="text-text-muted text-xs mb-1">/ měs</span>
						</div>
						{#if isYearly}
							<div class="text-right">
								<span class="text-xs text-text-muted line-through">€155,88</span>
								<span class="text-xs text-brand-green font-bold ml-1">{t.saveProplus}</span>
							</div>
						{/if}
					</div>
				</div>
				<p class="text-xs text-text-muted mb-4">{t.photos300Month}</p>
				<ul class="flex flex-col gap-2.5 mb-4">
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm font-medium">{t.photos300Monthly}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.everythingPro}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.bulkApi}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{t.prioritySupport}</span>
					</li>
				</ul>
				<button
					disabled
					class="w-full py-3 rounded-xl border border-gray-700 text-text-muted font-semibold text-sm cursor-not-allowed"
				>
					{t.comingSoon}
				</button>
			</div>
		</div>

		<!-- Enterprise Banner -->
		<div
			class="w-full bg-navy-card border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 mb-6"
		>
			<div>
				<h4 class="text-base font-bold mb-1">{t.enterprise}</h4>
				<p class="text-xs text-text-muted leading-relaxed">{t.enterpriseDesc}</p>
			</div>
			<button
				class="w-full py-3 rounded-xl border border-gray-700 text-white font-semibold text-sm hover:bg-navy-lighter transition-colors"
			>
				{t.contactUs}
			</button>
		</div>
	</main>

	<!-- Footer -->
	<footer class="w-full bg-navy-card border-t border-gray-800 mt-auto">
		<div class="max-w-[1100px] mx-auto px-6 py-8">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
				<p class="text-xs text-text-muted">{t.copyright}</p>
				<div class="flex items-center gap-6">
					<a href="#" class="text-xs text-text-muted hover:text-white transition-colors"
						>{t.privacy}</a
					>
					<a href="#" class="text-xs text-text-muted hover:text-white transition-colors"
						>{t.terms}</a
					>
				</div>
			</div>
		</div>
	</footer>
</div>
