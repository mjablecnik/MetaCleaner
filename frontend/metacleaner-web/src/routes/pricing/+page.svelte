<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { t } from '$lib/i18n';
	import { pricingRepository, getEnterprise, getPlanPrice } from '$lib/repositories';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

	let mobileMenuOpen = $state(false);
	let currentBilling = $state<'monthly' | 'yearly'>('monthly');

	const isYearly = $derived(currentBilling === 'yearly');

	const plans = pricingRepository();
	const enterprise = getEnterprise();

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<svelte:head>
	<title>{m.meta_pricing_title()}</title>
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
			<a href="/#how-it-works" class="hover:text-white transition-colors">{m.nav_how_it_works()}</a>
			<a href="/features" class="hover:text-white transition-colors">{m.nav_features()}</a>
			<a href="/pricing" class="text-white transition-colors">{m.nav_pricing()}</a>
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
		class="md:hidden w-full px-4 py-4 flex justify-between items-center z-50 sticky top-0 bg-navy-main border-b border-border"
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
			class="text-sm font-medium text-text-muted py-3 border-b border-border flex items-center justify-between"
		>
			{m.nav_features()} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/pricing"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-white py-3 border-b border-border flex items-center justify-between"
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

	<!-- Desktop Main -->
	<main
		class="hidden md:flex w-full max-w-[1100px] mx-auto px-6 py-16 flex-col items-center flex-1"
	>
		<!-- Header -->
		<div class="text-center mb-10">
			<h1 class="text-4xl md:text-5xl font-bold mb-4">{m.pricing_title()}</h1>
			<p class="text-text-muted text-lg mb-8">{m.pricing_subtitle()}</p>
			<!-- Billing Toggle -->
			<div
				class="inline-flex items-center bg-navy-card border border-border rounded-xl p-1 gap-1"
			>
				<button
					onclick={() => (currentBilling = 'monthly')}
					class="px-5 py-2 rounded-lg text-sm font-semibold transition-all {!isYearly
						? 'bg-brand-blue text-white shadow'
						: 'text-text-muted hover:text-white'}"
				>
					{m.pricing_billing_monthly()}
				</button>
				<button
					onclick={() => (currentBilling = 'yearly')}
					class="px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 {isYearly
						? 'bg-brand-blue text-white shadow'
						: 'text-text-muted hover:text-white'}"
				>
					{m.pricing_billing_yearly()}<span
						class="bg-brand-green text-white text-xs font-bold px-2 py-0.5 rounded-full">−20%</span
					>
				</button>
			</div>
		</div>

		<!-- Pricing Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-10">
			{#each plans as plan}
				<div
					class="bg-navy-card rounded-2xl {plan.featured
						? 'border-2 border-brand-blue transform scale-105 z-10 shadow-glow-blue'
						: 'border border-border'} p-8 flex flex-col relative h-full"
				>
					{#if plan.featured}
						<div
							class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
						>
							{m.pricing_badge_popular()}
						</div>
					{/if}
					<h3 class="text-xl font-bold text-center mb-6">
						{plan.nameText ?? t(plan.nameKey!)}
					</h3>
					<div
						class="text-center {plan.originalYearly ? 'mb-1' : 'mb-2'} flex justify-center items-end gap-1"
					>
						<span class="text-5xl font-black">{getPlanPrice(plan, isYearly)}</span>
						{#if plan.id === 'pack' && plan.perKey}
							<span class="text-text-muted mb-1 text-sm">{t(plan.perKey)}</span>
						{/if}
					</div>
					{#if plan.originalYearly && isYearly}
						<div class="text-center mb-1">
							<span class="text-xs text-text-muted line-through">{plan.originalYearly}</span>
							<span class="text-xs text-brand-green font-bold ml-1"
								>{m.pricing_save({ amount: plan.saveAmountYearly! })}</span
							>
						</div>
					{/if}
					<p class="text-sm text-text-muted text-center mb-8">{t(plan.subtitleKey)}</p>
					<ul class="flex flex-col gap-4 mb-8 flex-1">
						{#each plan.featureKeys as key, i}
							<li class="flex items-start gap-3">
								<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
								<span class="text-sm {i === 0 ? 'font-medium' : 'font-medium text-text-muted'}"
									>{t(key)}</span
								>
							</li>
						{/each}
					</ul>
					{#if plan.featured}
						<button
							class="w-full py-3 rounded-lg bg-brand-blue text-white font-semibold hover:bg-blue-600 transition-colors mt-auto flex items-center justify-center gap-2"
						>
							<i class="fa-solid fa-bolt text-brand-orange"></i>
							{t(plan.ctaKey)}
						</button>
					{:else if plan.disabled}
						<button
							disabled
							class="w-full py-3 rounded-lg border border-border-strong text-text-muted font-semibold cursor-not-allowed mt-auto"
						>
							{t(plan.ctaKey)}
						</button>
					{:else if plan.id === 'pack'}
						<button
							class="w-full py-3 rounded-lg bg-brand-blue text-white font-semibold hover:bg-blue-600 transition-colors mt-auto"
						>
							{t(plan.ctaKey)}
						</button>
					{:else}
						<button
							class="w-full py-3 rounded-lg border border-border-strong text-white font-semibold hover:bg-navy-lighter transition-colors mt-auto"
						>
							{t(plan.ctaKey)}
						</button>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Enterprise Banner -->
		<div
			class="w-full bg-navy-card border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
		>
			<div>
				<h4 class="text-lg font-bold mb-2">{t(enterprise.titleKey)}</h4>
				<p class="text-sm text-text-muted">{t(enterprise.descKey)}</p>
			</div>
			<button
				class="px-6 py-3 rounded-lg border border-border-strong text-white font-semibold hover:bg-navy-lighter transition-colors whitespace-nowrap"
			>
				{t(enterprise.ctaKey)}
			</button>
		</div>
	</main>

	<!-- Mobile Main -->
	<main class="md:hidden w-full px-4 py-8 flex flex-col items-center flex-1">
		<!-- Header -->
		<div class="text-center mb-6 w-full">
			<h1 class="text-3xl font-bold mb-2">{m.pricing_title()}</h1>
			<p class="text-text-muted text-sm mb-5">{m.pricing_subtitle()}</p>
			<!-- Billing Toggle -->
			<div
				class="inline-flex items-center bg-navy-card border border-border rounded-xl p-1 gap-1"
			>
				<button
					onclick={() => (currentBilling = 'monthly')}
					class="px-5 py-2 rounded-lg text-sm font-semibold transition-all {!isYearly
						? 'bg-brand-blue text-white shadow'
						: 'text-text-muted'}"
				>
					{m.pricing_billing_monthly()}
				</button>
				<button
					onclick={() => (currentBilling = 'yearly')}
					class="px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 {isYearly
						? 'bg-brand-blue text-white shadow'
						: 'text-text-muted'}"
				>
					{m.pricing_billing_yearly()}<span
						class="bg-brand-green text-white text-xs font-bold px-2 py-0.5 rounded-full">−20%</span
					>
				</button>
			</div>
		</div>

		<!-- Pricing Cards -->
		<div class="flex flex-col gap-4 w-full mb-6">
			{#each plans as plan}
				<div
					class="bg-navy-card rounded-2xl {plan.featured
						? 'border-2 border-brand-blue shadow-glow-blue relative'
						: 'border border-border'} p-5 flex flex-col"
				>
					{#if plan.featured}
						<div
							class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
						>
							{m.pricing_badge_popular()}
						</div>
					{/if}
					<div
						class="flex items-center justify-between {plan.perKey ? 'mb-1' : 'mb-3'} {plan.featured
							? 'mt-2'
							: ''}"
					>
						<h3 class="text-lg font-bold">{plan.nameText ?? t(plan.nameKey!)}</h3>
						{#if plan.originalYearly}
							<div class="flex flex-col items-end">
								<div class="flex items-end gap-1">
									<span class="text-3xl font-black">{getPlanPrice(plan, isYearly)}</span>
									{#if plan.perKey}
										<span class="text-text-muted text-xs mb-1">{t(plan.perKey)}</span>
									{/if}
								</div>
								{#if isYearly}
									<div class="text-right">
										<span class="text-xs text-text-muted line-through">{plan.originalYearly}</span>
										<span class="text-xs text-brand-green font-bold ml-1"
											>{m.pricing_save({ amount: plan.saveAmountYearly! })}</span
										>
									</div>
								{/if}
							</div>
						{:else}
							<div class="flex items-end gap-1">
								<span class="text-3xl font-black">{getPlanPrice(plan, isYearly)}</span>
								{#if plan.perKey}
									<span class="text-text-muted text-xs mb-1">{t(plan.perKey)}</span>
								{/if}
							</div>
						{/if}
					</div>
					<p class="text-xs text-text-muted mb-4">{t(plan.subtitleKey)}</p>
					<ul class="flex flex-col gap-2.5 mb-4">
						{#each plan.featureKeys as key, i}
							<li class="flex items-start gap-2.5">
								<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
								<span class="text-sm {i === 0 ? 'font-medium' : 'text-text-muted'}">{t(key)}</span>
							</li>
						{/each}
					</ul>
					{#if plan.featured}
						<button
							class="w-full py-3 rounded-xl bg-brand-blue text-white font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
						>
							<i class="fa-solid fa-bolt text-brand-orange"></i>
							{t(plan.ctaKey)}
						</button>
					{:else if plan.disabled}
						<button
							disabled
							class="w-full py-3 rounded-xl border border-border-strong text-text-muted font-semibold text-sm cursor-not-allowed"
						>
							{t(plan.ctaKey)}
						</button>
					{:else if plan.id === 'pack'}
						<button
							class="w-full py-3 rounded-xl bg-brand-blue text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
						>
							{t(plan.ctaKey)}
						</button>
					{:else}
						<button
							class="w-full py-3 rounded-xl border border-border-strong text-white font-semibold text-sm hover:bg-navy-lighter transition-colors"
						>
							{t(plan.ctaKey)}
						</button>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Enterprise Banner -->
		<div
			class="w-full bg-navy-card border border-border rounded-2xl p-5 flex flex-col gap-4 mb-6"
		>
			<div>
				<h4 class="text-base font-bold mb-1">{t(enterprise.titleKey)}</h4>
				<p class="text-xs text-text-muted leading-relaxed">{t(enterprise.descKey)}</p>
			</div>
			<button
				class="w-full py-3 rounded-xl border border-border-strong text-white font-semibold text-sm hover:bg-navy-lighter transition-colors"
			>
				{t(enterprise.ctaKey)}
			</button>
		</div>
	</main>

	<!-- Footer -->
	<footer class="w-full bg-navy-card border-t border-border mt-auto">
		<div class="max-w-[1100px] mx-auto px-6 py-8">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
				<p class="text-xs text-text-muted">{m.footer_copyright()}</p>
				<div class="flex items-center gap-6">
					<a href="#" class="text-xs text-text-muted hover:text-white transition-colors"
						>{m.footer_legal_privacy()}</a
					>
					<a href="#" class="text-xs text-text-muted hover:text-white transition-colors"
						>{m.footer_legal_terms()}</a
					>
				</div>
			</div>
		</div>
	</footer>
</div>
