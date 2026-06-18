<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { t } from '$lib/i18n';
	import { featuresRepository } from '$lib/repositories';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

	let mobileMenuOpen = $state(false);

	const features = featuresRepository();

	const colorClasses: Record<string, { iconBg: string; iconText: string; label: string }> = {
		'brand-blue': {
			iconBg: 'bg-brand-blue/20',
			iconText: 'text-brand-blue',
			label: 'text-brand-blue'
		},
		'brand-orange': {
			iconBg: 'bg-brand-orange/20',
			iconText: 'text-brand-orange',
			label: 'text-brand-orange'
		},
		'brand-green': {
			iconBg: 'bg-brand-green/20',
			iconText: 'text-brand-green',
			label: 'text-brand-green'
		},
		'brand-red': {
			iconBg: 'bg-brand-red/20',
			iconText: 'text-brand-red',
			label: 'text-brand-red'
		}
	};

	const formatColorClasses: Record<string, string> = {
		'brand-red': 'text-brand-red',
		'brand-orange': 'text-brand-orange',
		'brand-blue': 'text-brand-blue',
		'brand-green': 'text-brand-green',
		'text-muted': 'text-text-muted'
	};

	function featureNumber(n: number): string {
		return String(n).padStart(2, '0');
	}

	function desktopFormatsGrid(count: number): string {
		return count === 4 ? 'grid grid-cols-2 sm:grid-cols-4 gap-3' : 'grid grid-cols-2 sm:grid-cols-3 gap-3';
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<svelte:head>
	<title>{m.meta_features_title()}</title>
</svelte:head>

<div class="flex flex-col items-center w-full">
	<!-- Desktop Navbar -->
	<nav class="hidden md:flex w-full max-w-site mx-auto px-6 py-6 justify-between items-center z-50">
		<a href="/" class="flex items-center gap-3">
			<div
				class="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
			>
				<i class="fa-solid fa-shield-halved text-xl"></i>
			</div>
			<span class="text-xl font-bold tracking-tight">MetaCleaner</span>
		</a>
		<div class="flex items-center gap-8 text-sm font-medium text-text-muted">
			<a href="/#how-it-works" class="hover:text-white transition-colors">{m.nav_how_it_works()}</a>
			<a href="/features" class="text-white transition-colors">{m.nav_features()}</a>
			<a href="/pricing" class="hover:text-white transition-colors">{m.nav_pricing()}</a>
			<a href="/#faq" class="hover:text-white transition-colors">{m.nav_faq()}</a>
		</div>
		<div class="flex items-center gap-3">
			<LanguageSwitcher variant="desktop" />
			<a
				href="#"
				class="hidden md:block px-5 py-2.5 rounded-lg text-sm font-semibold text-text-main hover:bg-navy-lighter transition-colors"
			>
				{m.nav_login()}
			</a>
		</div>
	</nav>

	<!-- Mobile Navbar -->
	<nav
		class="md:hidden w-full px-4 py-4 flex justify-between items-center z-50 sticky top-0 bg-navy-main border-b border-border/50"
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
			class="w-9 h-9 rounded-lg bg-navy-lighter border border-border-strong flex items-center justify-center text-white"
		>
			<i class="fa-solid {mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-sm"></i>
		</button>
	</nav>

	<!-- Mobile Menu Dropdown -->
	<div
		class="mobile-menu {mobileMenuOpen
			? 'open'
			: ''} md:hidden w-full flex-col bg-navy-card border-b border-border px-4 py-4 gap-3 z-40"
	>
		<a
			href="/#how-it-works"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-text-muted py-3 border-b border-border flex items-center justify-between"
		>
			{m.nav_how_it_works()} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/features"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-white py-3 border-b border-border flex items-center justify-between"
		>
			{m.nav_features()} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/pricing"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-text-muted py-3 border-b border-border flex items-center justify-between"
		>
			{m.nav_pricing()} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/#faq"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-text-muted py-3 border-b border-border flex items-center justify-between"
		>
			{m.nav_faq()} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<div class="border-t border-border my-1"></div>
		<LanguageSwitcher variant="mobile" />
		<div class="border-t border-border my-1"></div>
		<a
			href="#"
			class="w-full mt-2 py-3 rounded-xl bg-brand-blue text-white text-sm font-semibold text-center block"
		>
			{m.nav_login()}
		</a>
	</div>

	<!-- Desktop Main Content -->
	<main class="hidden md:flex w-full max-w-site mx-auto px-6 pb-24 flex-col gap-16">
		<!-- Page Header -->
		<section id="features-header" class="text-center pt-8">
			<span class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block"
				>{m.features_eyebrow()}</span
			>
			<h1 class="text-5xl font-bold mb-4 leading-tight">
				{m.features_title_line1()}<br />
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green"
					>{m.features_title_line2()}</span
				>
			</h1>
			<p class="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
				{m.features_subtitle()}
			</p>
		</section>

		<!-- Feature Sections (desktop) -->
		{#each features as feature}
			<section id="feature-{feature.id}" class="w-full">
				<div
					class="flex flex-col {feature.layout === 'rtl'
						? 'lg:flex-row-reverse'
						: 'lg:flex-row'} gap-10 items-center"
				>
					<!-- Content -->
					<div class="flex flex-col gap-6 flex-1">
						<div class="inline-flex items-center gap-2 w-fit">
							<div
								class="w-12 h-12 rounded-xl {colorClasses[feature.color].iconBg} flex items-center justify-center {colorClasses[feature.color].iconText} text-xl"
							>
								<i class="fa-solid {feature.icon}"></i>
							</div>
							<span
								class="text-xs font-bold uppercase tracking-widest {colorClasses[feature.color].label}"
								>{m.feature_label()} {featureNumber(feature.number)}</span
							>
						</div>
						<h2 class="text-4xl font-bold leading-tight">{feature.titleText}</h2>
						<p class="text-text-muted leading-relaxed max-w-2xl">{t(feature.descKey)}</p>

						{#if feature.formats}
							<div class={desktopFormatsGrid(feature.formats.length)}>
								{#each feature.formats as fmt}
									<div
										class="flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-card border border-border"
									>
										<i class="fa-solid {fmt.icon} {formatColorClasses[fmt.color]}"></i>
										<span class="text-sm font-medium">{fmt.key ? t(fmt.key) : fmt.label}</span>
									</div>
								{/each}
							</div>
						{:else if feature.bullets}
							<div class="flex flex-col gap-3">
								{#each feature.bullets as bullet}
									<div class="flex items-center gap-3">
										<i class="fa-solid fa-check text-brand-green text-sm"></i>
										<span class="text-sm text-text-muted">{t(bullet)}</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Visual -->
					<div class="flex-shrink-0 w-full lg:w-72 h-64 flex items-center justify-center">
						{#if feature.image}
							<img
								class="w-full h-full object-contain"
								src={feature.image.src}
								alt={t(feature.image.altKey)}
							/>
						{:else if feature.id === 'exif'}
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
						{:else if feature.id === 'c2pa'}
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
						{/if}
					</div>
				</div>
			</section>
		{/each}
	</main>

	<!-- Desktop Footer -->
	<footer class="hidden md:block w-full border-t border-border mt-8">
		<div class="w-full max-w-site mx-auto px-6 py-12">
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
						{m.footer_tagline_features()}
					</p>
					<div class="flex items-center gap-3 mt-1">
						<a
							href="#"
							class="w-9 h-9 rounded-lg bg-navy-card border border-border flex items-center justify-center text-text-muted hover:text-white hover:border-gray-600 transition-all"
						>
							<i class="fa-brands fa-twitter text-sm"></i>
						</a>
						<a
							href="#"
							class="w-9 h-9 rounded-lg bg-navy-card border border-border flex items-center justify-center text-text-muted hover:text-white hover:border-gray-600 transition-all"
						>
							<i class="fa-brands fa-github text-sm"></i>
						</a>
						<a
							href="#"
							class="w-9 h-9 rounded-lg bg-navy-card border border-border flex items-center justify-center text-text-muted hover:text-white hover:border-gray-600 transition-all"
						>
							<i class="fa-brands fa-linkedin text-sm"></i>
						</a>
					</div>
				</div>
				<!-- Produkt -->
				<div class="flex flex-col gap-4">
					<span class="text-xs font-bold uppercase tracking-widest text-text-muted">{m.footer_col_product()}</span>
					<div class="flex flex-col gap-3">
						<a href="/#how-it-works" class="text-sm text-text-muted hover:text-white transition-colors"
							>{m.footer_link_how()}</a
						>
						<a href="/features" class="text-sm text-text-muted hover:text-white transition-colors"
							>{m.footer_link_features()}</a
						>
						<a href="/pricing" class="text-sm text-text-muted hover:text-white transition-colors"
							>{m.footer_link_pricing()}</a
						>
						<a href="/#faq" class="text-sm text-text-muted hover:text-white transition-colors">{m.footer_link_faq()}</a>
					</div>
				</div>
				<!-- Funkce Links -->
				<div class="flex flex-col gap-4">
					<span class="text-xs font-bold uppercase tracking-widest text-text-muted">{m.footer_col_features()}</span>
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
					<span class="text-xs font-bold uppercase tracking-widest text-text-muted">{m.footer_col_legal()}</span>
					<div class="flex flex-col gap-3">
						<a href="#" class="text-sm text-text-muted hover:text-white transition-colors"
							>{m.footer_legal_privacy()}</a
						>
						<a href="#" class="text-sm text-text-muted hover:text-white transition-colors"
							>{m.footer_legal_terms()}</a
						>
						<a href="#" class="text-sm text-text-muted hover:text-white transition-colors">GDPR</a>
						<a href="#" class="text-sm text-text-muted hover:text-white transition-colors">{m.footer_link_contact()}</a>
					</div>
				</div>
			</div>
			<div
				class="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
			>
				<span class="text-xs text-text-muted">{m.footer_copyright()}</span>
				<div class="flex items-center gap-2">
					<span class="text-xs text-text-muted">{m.footer_made_with_1()}</span>
					<i class="fa-solid fa-heart text-brand-red text-xs"></i>
					<span class="text-xs text-text-muted">{m.footer_made_with_2()}</span>
				</div>
			</div>
		</div>
	</footer>

	<!-- Mobile Main Content -->
	<main class="md:hidden w-full px-4 pb-16 flex flex-col gap-2">
		<!-- Page Header -->
		<section class="text-center pt-8 pb-6 px-2">
			<span class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block"
				>{m.features_eyebrow()}</span
			>
			<h1 class="text-3xl font-bold mb-3 leading-tight">
				{m.features_title_line1()}<br />
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green"
					>{m.features_title_line2()}</span
				>
			</h1>
			<p class="text-text-muted text-sm leading-relaxed">
				{m.features_subtitle()}
			</p>
		</section>

		<!-- Feature Cards (mobile) -->
		{#each features as feature}
			<section class="w-full mb-3">
				<div class="bg-navy-card rounded-2xl border border-border overflow-hidden">
					<div class="w-full flex items-center gap-3 px-4 py-4">
						<div
							class="w-10 h-10 rounded-xl {colorClasses[feature.color].iconBg} flex items-center justify-center {colorClasses[feature.color].iconText} text-base flex-shrink-0"
						>
							<i class="fa-solid {feature.icon}"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div
								class="text-xs font-bold uppercase tracking-widest {colorClasses[feature.color].label} mb-0.5"
							>
								{m.feature_label()} {featureNumber(feature.number)}
							</div>
							<div class="text-base font-bold">{feature.titleText}</div>
						</div>
					</div>
					<div class="px-4 pb-5">
						<p class="text-text-muted text-sm leading-relaxed mb-4">{t(feature.descKey)}</p>

						{#if feature.formats}
							<div class="grid grid-cols-2 gap-2">
								{#each feature.formats as fmt}
									<div
										class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-lighter border border-border"
									>
										<i class="fa-solid {fmt.icon} {formatColorClasses[fmt.color]} text-sm"></i>
										<span class="text-xs font-medium">{fmt.key ? t(fmt.key) : fmt.label}</span>
									</div>
								{/each}
							</div>
						{:else if feature.bullets}
							<div class="flex flex-col gap-2.5">
								{#each feature.bullets as bullet}
									<div class="flex items-start gap-2.5">
										<i class="fa-solid fa-check text-brand-green text-xs mt-0.5"></i>
										<span class="text-sm text-text-muted">{t(bullet)}</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</section>
		{/each}

		<!-- CTA Section (Mobile only) -->
		<section id="cta-section" class="w-full mt-4 mb-6">
			<div
				class="bg-gradient-to-br from-brand-blue/20 to-brand-green/10 rounded-2xl border border-brand-blue/30 p-6 text-center"
			>
				<h2 class="text-xl font-bold mb-2">{m.features_cta_title()}</h2>
				<p class="text-text-muted text-sm mb-5">{m.features_cta_subtitle()}</p>
				<a
					href="#"
					class="w-full py-3.5 rounded-xl bg-brand-green text-white font-semibold text-sm shadow-glow-green block text-center"
				>
					{m.cta_try_free()}
				</a>
			</div>
		</section>
	</main>

	<!-- Mobile Footer -->
	<footer class="md:hidden w-full border-t border-border">
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
				{m.footer_tagline_features()}
			</p>
			<div class="flex items-center gap-2 mb-6">
				<a
					href="#"
					class="w-9 h-9 rounded-lg bg-navy-card border border-border flex items-center justify-center text-text-muted"
				>
					<i class="fa-brands fa-twitter text-sm"></i>
				</a>
				<a
					href="#"
					class="w-9 h-9 rounded-lg bg-navy-card border border-border flex items-center justify-center text-text-muted"
				>
					<i class="fa-brands fa-github text-sm"></i>
				</a>
				<a
					href="#"
					class="w-9 h-9 rounded-lg bg-navy-card border border-border flex items-center justify-center text-text-muted"
				>
					<i class="fa-brands fa-linkedin text-sm"></i>
				</a>
			</div>
		</div>
	</footer>
</div>
