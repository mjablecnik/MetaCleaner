<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	let mobileMenuOpen = $state(false);
	let currentBilling = $state<'monthly' | 'yearly'>('monthly');

	const isYearly = $derived(currentBilling === 'yearly');

	const proPrice = $derived(isYearly ? '€57,51' : '€5,99');
	const proplusPrice = $derived(isYearly ? '€124,71' : '€12,99');

	const locale = getLocale();
	const proSaveAmount = locale === 'cs' ? '€14,37' : '€14.37';
	const proplusSaveAmount = locale === 'cs' ? '€31,17' : '€31.17';

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
			<!-- LanguageSwitcher will be mounted here in Task 27 -->
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
			{m.nav_how_it_works()} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/features"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-text-muted py-3 border-b border-gray-800 flex items-center justify-between"
		>
			{m.nav_features()} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/pricing"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-white py-3 border-b border-gray-800 flex items-center justify-between"
		>
			{m.nav_pricing()} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/#faq"
			onclick={closeMobileMenu}
			class="text-sm font-medium text-text-muted py-3 border-b border-gray-800 flex items-center justify-between"
		>
			{m.nav_faq()} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
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
				class="inline-flex items-center bg-navy-card border border-gray-800 rounded-xl p-1 gap-1"
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
			<!-- Zdarma -->
			<div
				class="bg-navy-card rounded-2xl border border-gray-800 p-8 flex flex-col relative h-full"
			>
				<h3 class="text-xl font-bold text-center mb-6">{m.pricing_plan_free_name()}</h3>
				<div class="text-center mb-2">
					<span class="text-5xl font-black">€0</span>
				</div>
				<p class="text-sm text-text-muted text-center mb-8">{m.pricing_plan_free_subtitle()}</p>
				<ul class="flex flex-col gap-4 mb-8 flex-1">
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium">{m.pricing_feat_free_1()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_free_2()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_free_3()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_free_4()}</span>
					</li>
				</ul>
				<button
					class="w-full py-3 rounded-lg border border-gray-700 text-white font-semibold hover:bg-navy-lighter transition-colors mt-auto"
				>
					{m.pricing_cta_start_free()}
				</button>
			</div>

			<!-- 50 fotek -->
			<div
				class="bg-navy-card rounded-2xl border border-gray-800 p-8 flex flex-col relative h-full"
			>
				<h3 class="text-xl font-bold text-center mb-6">{m.pricing_plan_pack_name()}</h3>
				<div class="text-center mb-2 flex justify-center items-end gap-1">
					<span class="text-5xl font-black">€4</span>
					<span class="text-text-muted mb-1 text-sm">{m.pricing_per_50()}</span>
				</div>
				<p class="text-sm text-text-muted text-center mb-8">{m.pricing_plan_pack_subtitle()}</p>
				<ul class="flex flex-col gap-4 mb-8 flex-1">
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium">{m.pricing_feat_pack_1()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_pack_2()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_pack_3()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_pack_4()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_pack_5()}</span>
					</li>
				</ul>
				<button
					class="w-full py-3 rounded-lg bg-brand-blue text-white font-semibold hover:bg-blue-600 transition-colors mt-auto"
				>
					{m.pricing_cta_buy()}
				</button>
			</div>

			<!-- Pro (Featured) -->
			<div
				class="bg-navy-card rounded-2xl border-2 border-brand-blue p-8 flex flex-col relative h-full transform scale-105 z-10 shadow-glow-blue"
			>
				<div
					class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
				>
					{m.pricing_badge_popular()}
				</div>
				<h3 class="text-xl font-bold text-center mb-6">Pro</h3>
				<div class="text-center mb-1 flex justify-center items-end gap-1">
					<span class="text-5xl font-black">{proPrice}</span>
				</div>
				{#if isYearly}
					<div class="text-center mb-1">
						<span class="text-xs text-text-muted line-through">€71,88</span>
						<span class="text-xs text-brand-green font-bold ml-1">{m.pricing_save({ amount: proSaveAmount })}</span>
					</div>
				{/if}
				<p class="text-sm text-text-muted text-center mb-8">{m.pricing_plan_pro_subtitle()}</p>
				<ul class="flex flex-col gap-4 mb-8 flex-1">
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium">{m.pricing_feat_pro_1()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_pro_2()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_pro_3()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_pro_4()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_pro_5()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_pro_6()}</span>
					</li>
				</ul>
				<button
					class="w-full py-3 rounded-lg bg-brand-blue text-white font-semibold hover:bg-blue-600 transition-colors mt-auto flex items-center justify-center gap-2"
				>
					<i class="fa-solid fa-bolt text-brand-orange"></i>
					{m.pricing_cta_activate_pro()}
				</button>
			</div>

			<!-- Pro+ -->
			<div
				class="bg-navy-card rounded-2xl border border-gray-800 p-8 flex flex-col relative h-full"
			>
				<h3 class="text-xl font-bold text-center mb-6">Pro+</h3>
				<div class="text-center mb-1 flex justify-center items-end gap-1">
					<span class="text-5xl font-black">{proplusPrice}</span>
				</div>
				{#if isYearly}
					<div class="text-center mb-1">
						<span class="text-xs text-text-muted line-through">€155,88</span>
						<span class="text-xs text-brand-green font-bold ml-1">{m.pricing_save({ amount: proplusSaveAmount })}</span>
					</div>
				{/if}
				<p class="text-sm text-text-muted text-center mb-8">{m.pricing_plan_proplus_subtitle()}</p>
				<ul class="flex flex-col gap-4 mb-8 flex-1">
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium">{m.pricing_feat_proplus_1()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_proplus_2()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_proplus_3()}</span>
					</li>
					<li class="flex items-start gap-3">
						<i class="fa-solid fa-check text-brand-blue mt-1 text-sm"></i>
						<span class="text-sm font-medium text-text-muted">{m.pricing_feat_proplus_4()}</span>
					</li>
				</ul>
				<button
					disabled
					class="w-full py-3 rounded-lg border border-gray-700 text-text-muted font-semibold cursor-not-allowed mt-auto"
				>
					{m.pricing_cta_coming_soon()}
				</button>
			</div>
		</div>

		<!-- Enterprise Banner -->
		<div
			class="w-full bg-navy-card border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
		>
			<div>
				<h4 class="text-lg font-bold mb-2">{m.pricing_enterprise_title()}</h4>
				<p class="text-sm text-text-muted">{m.pricing_enterprise_desc()}</p>
			</div>
			<button
				class="px-6 py-3 rounded-lg border border-gray-700 text-white font-semibold hover:bg-navy-lighter transition-colors whitespace-nowrap"
			>
				{m.pricing_cta_contact()}
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
				class="inline-flex items-center bg-navy-card border border-gray-800 rounded-xl p-1 gap-1"
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
			<!-- Free -->
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-5 flex flex-col">
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-lg font-bold">{m.pricing_plan_free_name()}</h3>
					<div class="flex items-end gap-1">
						<span class="text-3xl font-black">€0</span>
					</div>
				</div>
				<p class="text-xs text-text-muted mb-4">{m.pricing_plan_free_subtitle()}</p>
				<ul class="flex flex-col gap-2.5 mb-4">
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm font-medium">{m.pricing_feat_free_1()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_free_2()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_free_3()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_free_4()}</span>
					</li>
				</ul>
				<button
					class="w-full py-3 rounded-xl border border-gray-700 text-white font-semibold text-sm hover:bg-navy-lighter transition-colors"
				>
					{m.pricing_cta_start_free()}
				</button>
			</div>

			<!-- 50 fotek -->
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-5 flex flex-col">
				<div class="flex items-center justify-between mb-1">
					<h3 class="text-lg font-bold">{m.pricing_plan_pack_name()}</h3>
					<div class="flex items-end gap-1">
						<span class="text-3xl font-black">€4</span>
						<span class="text-text-muted text-xs mb-1">{m.pricing_per_50()}</span>
					</div>
				</div>
				<p class="text-xs text-text-muted mb-4">{m.pricing_plan_pack_subtitle()}</p>
				<ul class="flex flex-col gap-2.5 mb-4">
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm font-medium">{m.pricing_feat_pack_1()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_pack_2()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_pack_3()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_pack_4()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_pack_5()}</span>
					</li>
				</ul>
				<button
					class="w-full py-3 rounded-xl bg-brand-blue text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
				>
					{m.pricing_cta_buy()}
				</button>
			</div>

			<!-- Pro (Featured) -->
			<div
				class="bg-navy-card rounded-2xl border-2 border-brand-blue p-5 flex flex-col relative shadow-glow-blue"
			>
				<div
					class="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
				>
					{m.pricing_badge_popular()}
				</div>
				<div class="flex items-center justify-between mb-1 mt-2">
					<h3 class="text-lg font-bold">Pro</h3>
					<div class="flex flex-col items-end">
						<div class="flex items-end gap-1">
							<span class="text-3xl font-black">{proPrice}</span>
							<span class="text-text-muted text-xs mb-1">{m.pricing_per_month_short()}</span>
						</div>
						{#if isYearly}
							<div class="text-right">
								<span class="text-xs text-text-muted line-through">€71,88</span>
								<span class="text-xs text-brand-green font-bold ml-1">{m.pricing_save({ amount: proSaveAmount })}</span>
							</div>
						{/if}
					</div>
				</div>
				<p class="text-xs text-text-muted mb-4">{m.pricing_plan_pro_subtitle()}</p>
				<ul class="flex flex-col gap-2.5 mb-4">
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm font-medium">{m.pricing_feat_pro_1()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_pro_2()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_pro_3()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_pro_4()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_pro_5()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_pro_6()}</span>
					</li>
				</ul>
				<button
					class="w-full py-3 rounded-xl bg-brand-blue text-white font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
				>
					<i class="fa-solid fa-bolt text-brand-orange"></i>
					{m.pricing_cta_activate_pro()}
				</button>
			</div>

			<!-- Pro+ -->
			<div class="bg-navy-card rounded-2xl border border-gray-800 p-5 flex flex-col">
				<div class="flex items-center justify-between mb-1">
					<h3 class="text-lg font-bold">Pro+</h3>
					<div class="flex flex-col items-end">
						<div class="flex items-end gap-1">
							<span class="text-3xl font-black">{proplusPrice}</span>
							<span class="text-text-muted text-xs mb-1">{m.pricing_per_month_short()}</span>
						</div>
						{#if isYearly}
							<div class="text-right">
								<span class="text-xs text-text-muted line-through">€155,88</span>
								<span class="text-xs text-brand-green font-bold ml-1">{m.pricing_save({ amount: proplusSaveAmount })}</span>
							</div>
						{/if}
					</div>
				</div>
				<p class="text-xs text-text-muted mb-4">{m.pricing_plan_proplus_subtitle()}</p>
				<ul class="flex flex-col gap-2.5 mb-4">
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm font-medium">{m.pricing_feat_proplus_1()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_proplus_2()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_proplus_3()}</span>
					</li>
					<li class="flex items-start gap-2.5">
						<i class="fa-solid fa-check text-brand-blue mt-0.5 text-xs"></i>
						<span class="text-sm text-text-muted">{m.pricing_feat_proplus_4()}</span>
					</li>
				</ul>
				<button
					disabled
					class="w-full py-3 rounded-xl border border-gray-700 text-text-muted font-semibold text-sm cursor-not-allowed"
				>
					{m.pricing_cta_coming_soon()}
				</button>
			</div>
		</div>

		<!-- Enterprise Banner -->
		<div
			class="w-full bg-navy-card border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 mb-6"
		>
			<div>
				<h4 class="text-base font-bold mb-1">{m.pricing_enterprise_title()}</h4>
				<p class="text-xs text-text-muted leading-relaxed">{m.pricing_enterprise_desc()}</p>
			</div>
			<button
				class="w-full py-3 rounded-xl border border-gray-700 text-white font-semibold text-sm hover:bg-navy-lighter transition-colors"
			>
				{m.pricing_cta_contact()}
			</button>
		</div>
	</main>

	<!-- Footer -->
	<footer class="w-full bg-navy-card border-t border-gray-800 mt-auto">
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
