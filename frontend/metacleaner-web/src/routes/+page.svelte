<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { t } from '$lib/i18n';
	import { getAudience, getFaq, stepsRepository, statsRepository, getMetadataFields, getCleanedFields } from '$lib/repositories';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

	const audienceFull = getAudience('full');
	const audienceCompact = getAudience('compact');
	const faqDesktop = getFaq('desktop');
	const faqMobile = getFaq('mobile');
	const steps = stepsRepository();
	const stats = statsRepository();
	const desktopFields = getMetadataFields('desktop');
	const desktopCleanedFields = getCleanedFields('desktop');
	const mobileFields = getMetadataFields('mobile');
	const mobileCleanedFields = getCleanedFields('mobile');

	const audienceColorClasses: Record<string, { iconBg: string; iconText: string; hoverBorder: string }> = {
		'brand-blue': { iconBg: 'bg-brand-blue/20', iconText: 'text-brand-blue', hoverBorder: 'hover:border-brand-blue/50' },
		'brand-orange': { iconBg: 'bg-brand-orange/20', iconText: 'text-brand-orange', hoverBorder: 'hover:border-brand-orange/50' },
		'brand-green': { iconBg: 'bg-brand-green/20', iconText: 'text-brand-green', hoverBorder: 'hover:border-brand-green/50' }
	};

	const statColorClasses: Record<string, { iconBg: string; iconText: string }> = {
		'brand-red': { iconBg: 'bg-brand-red/20', iconText: 'text-brand-red' },
		'brand-orange': { iconBg: 'bg-brand-orange/20', iconText: 'text-brand-orange' },
		'brand-blue': { iconBg: 'bg-brand-blue/20', iconText: 'text-brand-blue' }
	};

	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function toggleFaq(event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		const answer = button.nextElementSibling as HTMLElement;
		const icon = button.querySelector('i');
		if (!answer || !icon) return;
		const isHidden = answer.classList.contains('hidden');
		if (isHidden) {
			answer.classList.remove('hidden');
			icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
		} else {
			answer.classList.add('hidden');
			icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
		}
	}
</script>

<svelte:head>
	<title>{m.meta_home_title()}</title>
</svelte:head>

<!-- Overlay for mobile menu -->
{#if mobileMenuOpen}
	<div
		id="menuOverlay"
		class="menu-overlay open fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
		onclick={closeMobileMenu}
		role="button"
		tabindex="-1"
		onkeydown={(e) => e.key === 'Escape' && closeMobileMenu()}
	></div>
{/if}

<!-- Mobile Slide Menu Drawer -->
<div
	id="mobileMenu"
	class="slide-menu {mobileMenuOpen
		? 'open'
		: ''} fixed top-0 right-0 h-full w-full z-40 bg-navy-card border-l border-border flex flex-col shadow-2xl md:hidden"
>
	<!-- Drawer Header -->
	<div class="flex items-center justify-between px-5 py-5 border-b border-border">
		<div class="flex items-center gap-2">
			<div
				class="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
			>
				<i class="fa-solid fa-shield-halved text-sm"></i>
			</div>
			<span class="text-base font-bold tracking-tight">MetaCleaner</span>
		</div>
		<button
			onclick={closeMobileMenu}
			class="w-9 h-9 flex items-center justify-center rounded-lg bg-navy-lighter border border-border-strong text-white"
		>
			<i class="fa-solid fa-xmark text-sm"></i>
		</button>
	</div>
	<!-- Nav Links -->
	<div class="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">
		<p class="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 mb-2">
			{m.nav_navigation()}
		</p>
		<a
			href="#how-it-works"
			onclick={closeMobileMenu}
			class="flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-navy-lighter hover:text-white transition-all group"
		>
			<div
				class="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-sm group-hover:bg-brand-blue/20 transition-colors"
			>
				<i class="fa-solid fa-circle-play"></i>
			</div>
			<span class="text-sm font-medium">{m.nav_how_it_works()}</span>
			<i class="fa-solid fa-chevron-right text-[10px] ml-auto opacity-40"></i>
		</a>
		<a
			href="#why-it-matters"
			onclick={closeMobileMenu}
			class="flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-navy-lighter hover:text-white transition-all group"
		>
			<div
				class="w-9 h-9 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange text-sm group-hover:bg-brand-orange/20 transition-colors"
			>
				<i class="fa-solid fa-shield-halved"></i>
			</div>
			<span class="text-sm font-medium">{m.nav_why_it_matters()}</span>
			<i class="fa-solid fa-chevron-right text-[10px] ml-auto opacity-40"></i>
		</a>
		<a
			href="#who-its-for"
			onclick={closeMobileMenu}
			class="flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-navy-lighter hover:text-white transition-all group"
		>
			<div
				class="w-9 h-9 rounded-lg bg-brand-green/10 flex items-center justify-center text-brand-green text-sm group-hover:bg-brand-green/20 transition-colors"
			>
				<i class="fa-solid fa-users"></i>
			</div>
			<span class="text-sm font-medium">{m.nav_for_who()}</span>
			<i class="fa-solid fa-chevron-right text-[10px] ml-auto opacity-40"></i>
		</a>
		<a
			href="#faq"
			onclick={closeMobileMenu}
			class="flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-navy-lighter hover:text-white transition-all group"
		>
			<div
				class="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-sm group-hover:bg-brand-blue/20 transition-colors"
			>
				<i class="fa-solid fa-circle-question"></i>
			</div>
			<span class="text-sm font-medium">{m.nav_faq()}</span>
			<i class="fa-solid fa-chevron-right text-[10px] ml-auto opacity-40"></i>
		</a>
		<div class="border-t border-border my-3"></div>
		<LanguageSwitcher variant="mobile" />
		<div class="border-t border-border my-3"></div>
	</div>
	<!-- Auth Buttons -->
	<div class="px-4 pb-4">
		<div class="flex gap-2 mt-3">
			<a
				href="#"
				class="flex-1 py-3 rounded-xl bg-navy-lighter border border-border-strong text-white font-semibold text-xs flex items-center justify-center gap-1.5"
			>
				<i class="fa-solid fa-right-to-bracket text-text-muted"></i>
				{m.nav_login()}
			</a>
			<a
				href="#"
				class="flex-1 py-3 rounded-xl bg-brand-blue text-white font-semibold text-xs flex items-center justify-center gap-1.5"
			>
				<i class="fa-solid fa-user-plus"></i>
				{m.nav_register()}
			</a>
		</div>
	</div>
</div>

<div class="flex flex-col items-center w-full">
	<!-- Navigation -->
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
			<a href="#how-it-works" class="hover:text-white transition-colors">{m.nav_how_it_works()}</a>
			<a href="/features" class="hover:text-white transition-colors">{m.nav_features()}</a>
			<a href="/pricing" class="hover:text-white transition-colors">{m.nav_pricing()}</a>
			<a href="#faq" class="hover:text-white transition-colors">{m.nav_faq()}</a>
		</div>
		<div class="flex items-center gap-3">
			<LanguageSwitcher variant="desktop" />
			<a
				href="#"
				class="px-5 py-2.5 rounded-lg text-sm font-semibold text-text-main hover:bg-navy-lighter transition-colors"
			>
				{m.nav_login()}
			</a>
		</div>
	</nav>

	<!-- Mobile Navbar -->
	<nav
		class="md:hidden w-full px-4 py-4 flex justify-between items-center z-50 sticky top-0 bg-navy-main/95 backdrop-blur border-b border-border/50"
	>
		<a href="/" class="flex items-center gap-2">
			<div
				class="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
			>
				<i class="fa-solid fa-shield-halved text-base"></i>
			</div>
			<span class="text-lg font-bold tracking-tight">MetaCleaner</span>
		</a>
		<div class="flex items-center gap-2">
			<button
				onclick={toggleMobileMenu}
				class="w-9 h-9 flex items-center justify-center rounded-lg bg-navy-lighter border border-border-strong text-white"
			>
				<i class="fa-solid {mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-sm"></i>
			</button>
		</div>
	</nav>

	<!-- Main Content (Desktop) -->
	<main class="hidden md:flex w-full max-w-[1100px] mx-auto px-6 flex-col gap-[48px] pb-24">
		<!-- Hero -->
		<section id="hero" class="w-full pt-12 pb-8 flex flex-col lg:flex-row gap-12 items-center">
			<div class="w-full lg:w-[55%] flex flex-col gap-6">
				<h1 class="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight w-[609px]">
					<span>{m.home_hero_title_line1()}</span><br />
					<span
						class="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green"
					>{m.home_hero_title_line2()}</span>
				</h1>
				<p class="text-lg text-text-muted leading-relaxed max-w-xl">
					{m.home_hero_subtitle()}
				</p>
				<div class="flex flex-col sm:flex-row gap-4 mt-4">
					<a
						href="#"
						class="px-8 py-3.5 rounded-lg bg-brand-green text-white font-semibold shadow-glow-green hover:bg-green-500 transition-all flex items-center justify-center gap-2"
					>
						<i class="fa-solid fa-cloud-arrow-up"></i>
						<span>{m.cta_try_free()}</span>
					</a>
					<a
						href="#"
						class="px-8 py-3.5 rounded-lg bg-navy-lighter border border-border-strong text-white font-semibold hover:bg-border transition-all flex items-center justify-center gap-2"
					>
						<i class="fa-brands fa-apple"></i>
						<span>{m.cta_download_app()}</span>
					</a>
				</div>
			</div>
			<div class="w-full lg:w-[45%] h-[400px]">
				<div
					class="w-full h-full rounded-[16px] bg-navy-card border border-border p-[24px] flex flex-col shadow-card relative overflow-hidden"
				>
					<div
						class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-brand-blue/10 blur-[50px] rounded-full pointer-events-none"
					></div>
					<div class="flex justify-between items-center mb-6 z-10">
						<h3 class="font-semibold text-lg">{m.home_upload_title()}</h3>
						<div class="flex gap-2">
							<span class="px-2 py-1 rounded bg-navy-lighter text-[10px] font-bold text-white uppercase">JPG</span>
							<span class="px-2 py-1 rounded bg-navy-lighter text-[10px] font-bold text-white uppercase">PNG</span>
							<span class="px-2 py-1 rounded bg-navy-lighter text-[10px] font-bold text-white uppercase">HEIC</span>
							<span class="px-2 py-1 rounded bg-navy-lighter text-[10px] font-bold text-white uppercase">WEBP</span>
						</div>
					</div>
					<div
						class="flex-1 rounded-xl bg-navy-main/50 dashed-border-anim flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-navy-main/80 transition-colors z-10"
					>
						<div
							class="w-16 h-16 rounded-full bg-navy-lighter flex items-center justify-center text-brand-blue text-2xl shadow-glow-blue"
						>
							<i class="fa-solid fa-file-arrow-up"></i>
						</div>
						<div class="text-center">
							<p class="font-semibold text-white mb-1">{m.home_upload_drop()}</p>
							<p class="text-xs text-text-muted">{m.home_upload_hint()}</p>
						</div>
						<p class="text-[10px] text-text-muted mt-2">
							<i class="fa-solid fa-lock mr-1"></i>{m.home_upload_local_note()}
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Why It Matters -->
		<section id="why-it-matters" class="w-full">
			<div class="text-center mb-12">
				<span class="text-xs font-bold uppercase tracking-widest text-brand-green mb-3 block"
					>{m.home_why_eyebrow()}</span
				>
				<h2 class="text-4xl font-bold mb-4">{m.home_why_title()}</h2>
				<p class="text-text-muted max-w-xl mx-auto">
					{m.home_why_subtitle()}
				</p>
			</div>
			<!-- Before/After comparison -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
				<!-- Before card -->
				<div
					class="bg-navy-card rounded-2xl border border-brand-red/40 p-6 flex flex-col gap-4"
				>
					<div class="flex items-center gap-3 mb-2">
						<div
							class="w-10 h-10 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red"
						>
							<i class="fa-solid fa-triangle-exclamation"></i>
						</div>
						<div>
							<span class="text-xs font-bold uppercase tracking-wider text-brand-red">{m.home_why_before_label()}</span>
							<p class="text-sm font-semibold text-white">{m.home_why_before_caption()}</p>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						{#each desktopFields as field}
							<div
								class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-main/60 border border-border"
							>
								<span class="text-xs text-text-muted flex items-center gap-2">
									<i class="fa-solid {field.icon} text-brand-red"></i> {t(field.labelKey)}
								</span>
								<span class="text-xs font-mono text-white">{field.value}</span>
							</div>
						{/each}
					</div>
					<p class="text-xs text-brand-red/80 flex items-center gap-2 mt-1">
						<i class="fa-solid fa-circle-exclamation"></i>
						{m.home_why_before_warning()}
					</p>
				</div>
				<!-- After card -->
				<div
					class="bg-navy-card rounded-2xl border border-brand-green/40 p-6 flex flex-col gap-4"
				>
					<div class="flex items-center gap-3 mb-2">
						<div
							class="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green"
						>
							<i class="fa-solid fa-shield-halved"></i>
						</div>
						<div>
							<span class="text-xs font-bold uppercase tracking-wider text-brand-green">{m.home_why_after_label()}</span>
							<p class="text-sm font-semibold text-white">{m.home_why_after_caption()}</p>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						{#each desktopCleanedFields as field}
							<div
								class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-main/60 border border-border"
							>
								<span class="text-xs text-text-muted flex items-center gap-2">
									<i class="fa-solid {field.icon} text-brand-green"></i>
									{t(field.labelKey)}
								</span>
								<span class="text-xs font-mono text-brand-green flex items-center gap-1">
									<i class="fa-solid fa-check"></i> {m.home_why_removed()}
								</span>
							</div>
						{/each}
					</div>
					<p class="text-xs text-brand-green/80 flex items-center gap-2 mt-1">
						<i class="fa-solid fa-circle-check"></i>
						{m.home_why_after_note()}
					</p>
				</div>
			</div>
			<!-- Risk stats -->
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
				{#each stats as stat}
					{@const sc = statColorClasses[stat.color] ?? statColorClasses['brand-blue']}
					<div
						class="bg-navy-card rounded-2xl border border-border p-6 flex flex-col items-center text-center gap-3"
					>
						<div
							class="w-12 h-12 rounded-full {sc.iconBg} flex items-center justify-center {sc.iconText} text-xl"
						>
							<i class="fa-solid {stat.icon}"></i>
						</div>
						<span class="text-3xl font-black text-white">{stat.value}</span>
						<p class="text-sm text-text-muted">{t(stat.labelKey)}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- How It Works -->
		<section id="how-it-works" class="w-full">
			<div class="text-center mb-12">
				<span class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block"
					>{m.home_steps_eyebrow()}</span
				>
				<h2 class="text-4xl font-bold mb-4">{m.home_steps_title()}</h2>
				<p class="text-text-muted max-w-xl mx-auto">{m.home_steps_subtitle()}</p>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				{#each steps as step}
					<div
						class="bg-navy-card rounded-2xl border border-border p-8 flex flex-col items-center text-center gap-4 relative"
					>
						<div
							class="w-14 h-14 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue text-2xl mb-2"
						>
							<i class="fa-solid {step.icon}"></i>
						</div>
						<span class="absolute top-6 right-6 text-5xl font-black text-gray-800 select-none">{step.number}</span>
						<h3 class="text-xl font-bold">{t(step.titleKey)}</h3>
						<p class="text-text-muted text-sm leading-relaxed">
							{t(step.descKey)}
						</p>
					</div>
				{/each}
			</div>
		</section>
	</main>

	<!-- Who Is It For (Desktop) -->
	<section id="who-its-for" class="hidden md:block w-full max-w-[1100px] mx-auto px-6 pb-16">
		<div class="text-center mb-12">
			<span class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block"
				>{m.home_audience_eyebrow()}</span
			>
			<h2 class="text-4xl font-bold mb-4">{m.home_audience_title()}</h2>
			<p class="text-text-muted max-w-xl mx-auto">
				{m.home_audience_subtitle()}
			</p>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each audienceFull as audience}
				{@const cc = audienceColorClasses[audience.color] ?? audienceColorClasses['brand-blue']}
				<div
					class="bg-navy-card rounded-2xl border border-border p-7 flex flex-col gap-4 {cc.hoverBorder} transition-colors"
				>
					<div
						class="w-12 h-12 rounded-xl {cc.iconBg} flex items-center justify-center {cc.iconText} text-xl"
					>
						<i class="fa-solid {audience.icon}"></i>
					</div>
					<h3 class="text-lg font-bold">{t(audience.titleKey)}</h3>
					<p class="text-sm text-text-muted leading-relaxed">
						{t(audience.descKey)}
					</p>
					{#if audience.bulletKeys}
						<ul class="flex flex-col gap-1.5 mt-auto">
							{#each audience.bulletKeys as bulletKey}
								<li class="flex items-center gap-2 text-xs text-text-muted">
									<i class="fa-solid fa-check text-brand-green text-[10px]"></i>{t(bulletKey)}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<!-- FAQ (Desktop) -->
	<section id="faq" class="hidden md:block w-full max-w-[1100px] mx-auto px-6 pb-16">
		<div class="text-center mb-12">
			<span class="text-xs font-bold uppercase tracking-widest text-brand-green mb-3 block"
				>{m.home_faq_eyebrow()}</span
			>
			<h2 class="text-4xl font-bold mb-4">{m.home_faq_title()}</h2>
			<p class="text-text-muted max-w-xl mx-auto">
				{m.home_faq_subtitle()}
			</p>
		</div>
		<div class="max-w-3xl mx-auto flex flex-col gap-3">
			{#each faqDesktop as item (item.id)}
				<div class="faq-item bg-navy-card rounded-2xl border border-border overflow-hidden">
					<button
						onclick={toggleFaq}
						class="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-navy-lighter/50 transition-colors"
					>
						<span class="font-semibold text-white">{t(item.questionKey)}</span>
						<i class="fa-solid fa-chevron-down text-text-muted transition-transform duration-200"></i>
					</button>
					<div class="faq-answer hidden px-6 pb-5">
						<p class="text-sm text-text-muted leading-relaxed">
							{t(item.answerKey)}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Desktop Footer -->
	<footer class="hidden md:block w-full bg-navy-card border-t border-border mt-8">
		<div class="max-w-[1100px] mx-auto px-6 py-16">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-12 gap-10 w-auto">
				<!-- Brand -->
				<div class="flex flex-col gap-5 lg:col-span-1 w-full">
					<div class="flex items-center gap-3">
						<div
							class="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
						>
							<i class="fa-solid fa-shield-halved text-xl"></i>
						</div>
						<span class="text-xl font-bold tracking-tight">MetaCleaner</span>
					</div>
					<p class="text-sm text-text-muted leading-relaxed">
						{m.footer_tagline()}
					</p>
				</div>
				<!-- Product -->
				<div class="flex flex-col gap-4 w-full">
					<h4 class="text-sm font-bold uppercase tracking-widest text-white">{m.footer_col_product()}</h4>
					<ul class="flex flex-col gap-3">
						<li>
							<a href="/features" class="text-sm text-text-muted hover:text-white transition-colors"
								>{m.footer_link_features()}</a
							>
						</li>
						<li>
							<a
								href="#how-it-works"
								class="text-sm text-text-muted hover:text-white transition-colors">{m.footer_link_how()}</a
							>
						</li>
						<li>
							<a href="/pricing" class="text-sm text-text-muted hover:text-white transition-colors"
								>{m.footer_link_pricing()}</a
							>
						</li>
					</ul>
				</div>
				<!-- Company -->
				<div class="flex flex-col gap-4 w-full">
					<h4 class="text-sm font-bold uppercase tracking-widest text-white">{m.footer_col_company()}</h4>
					<ul class="flex flex-col gap-3">
						<li>
							<a href="#" class="text-sm text-text-muted hover:text-white transition-colors">{m.footer_link_about()}</a>
						</li>
						<li>
							<a href="#faq" class="text-sm text-text-muted hover:text-white transition-colors"
								>{m.footer_link_faq()}</a
							>
						</li>
						<li>
							<a href="#" class="text-sm text-text-muted hover:text-white transition-colors"
								>{m.footer_link_contact()}</a
							>
						</li>
					</ul>
				</div>
			</div>
			<!-- Divider -->
			<div
				class="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
			>
				<p class="text-xs text-text-muted">{m.footer_copyright()}</p>
				<div class="flex items-center gap-6">
					<a href="#" class="text-xs text-text-muted hover:text-white transition-colors"
						>{m.footer_legal_privacy()}</a
					>
					<a href="#" class="text-xs text-text-muted hover:text-white transition-colors"
						>{m.footer_legal_terms()}</a
					>
					<a href="#" class="text-xs text-text-muted hover:text-white transition-colors">{m.footer_legal_cookies()}</a>
				</div>
			</div>
		</div>
	</footer>

	<!-- ====== MOBILE LAYOUT ====== -->
	<main class="md:hidden w-full max-w-md mx-auto px-4 flex flex-col gap-10 pb-20">
		<!-- Hero -->
		<section id="hero-mobile" class="w-full pt-8 flex flex-col gap-5">
			<div class="flex flex-col gap-4">
				<div
					class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 w-fit"
				>
					<i class="fa-solid fa-lock text-brand-blue text-xs"></i>
					<span class="text-xs font-semibold text-brand-blue">{m.home_hero_badge()}</span>
				</div>
				<h1 class="text-3xl font-bold leading-tight tracking-tight">
					{m.home_hero_title_line1()}<br />
					<span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green"
						>{m.home_hero_title_line2()}</span
					>
				</h1>
				<p class="text-sm text-text-muted leading-relaxed">
					{m.home_hero_subtitle()}
				</p>
			</div>
			<!-- Upload Card -->
			<div
				class="w-full rounded-2xl bg-navy-card border border-border p-5 flex flex-col shadow-card relative overflow-hidden"
			>
				<div
					class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 bg-brand-blue/10 blur-[40px] rounded-full pointer-events-none"
				></div>
				<div class="flex justify-between items-center mb-4 z-10">
					<h3 class="font-semibold text-sm">{m.home_upload_title()}</h3>
					<div class="flex gap-1">
						<span class="px-1.5 py-0.5 rounded bg-navy-lighter text-[9px] font-bold text-white uppercase">JPG</span>
						<span class="px-1.5 py-0.5 rounded bg-navy-lighter text-[9px] font-bold text-white uppercase">PNG</span>
						<span class="px-1.5 py-0.5 rounded bg-navy-lighter text-[9px] font-bold text-white uppercase">HEIC</span>
						<span class="px-1.5 py-0.5 rounded bg-navy-lighter text-[9px] font-bold text-white uppercase">WEBP</span>
					</div>
				</div>
				<div
					class="rounded-xl bg-navy-main/50 dashed-border-anim flex flex-col items-center justify-center gap-3 cursor-pointer py-8 z-10"
				>
					<div
						class="w-14 h-14 rounded-full bg-navy-lighter flex items-center justify-center text-brand-blue text-xl shadow-glow-blue"
					>
						<i class="fa-solid fa-file-arrow-up"></i>
					</div>
					<div class="text-center px-4">
						<p class="font-semibold text-white text-sm mb-1">{m.home_upload_drop_mobile()}</p>
						<p class="text-xs text-text-muted">{m.home_upload_hint_mobile()}</p>
					</div>
					<p class="text-[10px] text-text-muted">
						<i class="fa-solid fa-lock mr-1"></i>{m.home_upload_local_note()}
					</p>
				</div>
			</div>
			<!-- CTAs -->
			<div class="flex flex-col gap-3">
				<a
					href="#"
					class="w-full py-4 rounded-xl bg-brand-green text-white font-semibold shadow-glow-green text-sm flex items-center justify-center gap-2"
				>
					<i class="fa-solid fa-cloud-arrow-up"></i>{m.cta_try_free()}
				</a>
				<a
					href="#"
					class="w-full py-4 rounded-xl bg-navy-lighter border border-border-strong text-white font-semibold text-sm flex items-center justify-center gap-2"
				>
					<i class="fa-brands fa-apple"></i>{m.cta_download_app()}
				</a>
			</div>
		</section>

		<!-- Why It Matters (Mobile) -->
		<section id="why-it-matters-mobile" class="w-full">
			<div class="text-center mb-6">
				<span class="text-xs font-bold uppercase tracking-widest text-brand-green mb-2 block"
					>{m.home_why_eyebrow()}</span
				>
				<h2 class="text-2xl font-bold mb-2">{m.home_why_title()}</h2>
				<p class="text-sm text-text-muted">
					{m.home_why_subtitle()}
				</p>
			</div>
			<!-- Before Card -->
			<div
				class="bg-navy-card rounded-2xl border border-brand-red/40 p-4 flex flex-col gap-3 mb-3"
			>
				<div class="flex items-center gap-3">
					<div
						class="w-9 h-9 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red text-sm"
					>
						<i class="fa-solid fa-triangle-exclamation"></i>
					</div>
					<div>
						<span class="text-[10px] font-bold uppercase tracking-wider text-brand-red block"
							>{m.home_why_before_label()}</span
						>
						<p class="text-xs font-semibold text-white">{m.home_why_before_caption()}</p>
					</div>
				</div>
				<div class="flex flex-col gap-1.5">
					{#each mobileFields as field}
						<div
							class="flex items-center justify-between px-3 py-2 rounded-lg bg-navy-main/60 border border-border"
						>
							<span class="text-xs text-text-muted flex items-center gap-1.5">
								<i class="fa-solid {field.icon} text-brand-red text-[10px]"></i> {t(field.labelKey)}
							</span>
							<span class="text-xs font-mono text-white">{field.value}</span>
						</div>
					{/each}
				</div>
				<p class="text-xs text-brand-red/80 flex items-center gap-1.5">
					<i class="fa-solid fa-circle-exclamation text-[10px]"></i>{m.home_why_before_warning()}
				</p>
			</div>
			<!-- After Card -->
			<div
				class="bg-navy-card rounded-2xl border border-brand-green/40 p-4 flex flex-col gap-3 mb-6"
			>
				<div class="flex items-center gap-3">
					<div
						class="w-9 h-9 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green text-sm"
					>
						<i class="fa-solid fa-shield-halved"></i>
					</div>
					<div>
						<span class="text-[10px] font-bold uppercase tracking-wider text-brand-green block"
							>{m.home_why_after_label()}</span
						>
						<p class="text-xs font-semibold text-white">{m.home_why_after_caption()}</p>
					</div>
				</div>
				<div class="flex flex-col gap-1.5">
					{#each mobileCleanedFields as field}
						<div
							class="flex items-center justify-between px-3 py-2 rounded-lg bg-navy-main/60 border border-border"
						>
							<span class="text-xs text-text-muted flex items-center gap-1.5">
								<i class="fa-solid {field.icon} text-brand-green text-[10px]"></i>{t(field.labelKey)}
							</span>
							<span class="text-xs font-mono text-brand-green flex items-center gap-1">
								<i class="fa-solid fa-check text-[10px]"></i> {m.home_why_removed()}
							</span>
						</div>
					{/each}
				</div>
				<p class="text-xs text-brand-green/80 flex items-center gap-1.5">
					<i class="fa-solid fa-circle-check text-[10px]"></i>{m.home_why_after_note()}
				</p>
			</div>
			<!-- Stats -->
			<div class="grid grid-cols-3 gap-2">
				{#each stats as stat}
					{@const sc = statColorClasses[stat.color] ?? statColorClasses['brand-blue']}
					<div
						class="bg-navy-card rounded-xl border border-border p-3 flex flex-col items-center text-center gap-1.5"
					>
						<div
							class="w-9 h-9 rounded-full {sc.iconBg} flex items-center justify-center {sc.iconText} text-sm"
						>
							<i class="fa-solid {stat.icon}"></i>
						</div>
						<span class="text-xl font-black text-white">{stat.valueMobile ?? stat.value}</span>
						<p class="text-[10px] text-text-muted leading-tight">
							{t(stat.labelMobileKey ?? stat.labelKey)}
						</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- How It Works (Mobile) -->
		<section id="how-it-works-mobile" class="w-full">
			<div class="text-center mb-6">
				<span class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-2 block"
					>{m.home_steps_eyebrow()}</span
				>
				<h2 class="text-2xl font-bold mb-2">{m.home_steps_title()}</h2>
				<p class="text-sm text-text-muted">{m.home_steps_subtitle()}</p>
			</div>
			<div class="flex flex-col gap-3">
				{#each steps as step}
					<div
						class="bg-navy-card rounded-2xl border border-border p-5 flex items-start gap-4 relative overflow-hidden"
					>
						<span class="absolute top-3 right-4 text-4xl font-black text-gray-800 select-none leading-none">{step.number}</span>
						<div
							class="w-12 h-12 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue text-lg flex-shrink-0"
						>
							<i class="fa-solid {step.icon}"></i>
						</div>
						<div class="flex-1 z-10">
							<h3 class="font-bold text-base mb-1">{t(step.titleKey)}</h3>
							{#if step.descMobileKey}
								<p class="text-xs text-text-muted leading-relaxed">
									{t(step.descMobileKey)}
								</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Who It's For (Mobile) -->
		<section id="who-its-for-mobile" class="w-full">
			<div class="text-center mb-6">
				<span class="text-xs font-bold uppercase tracking-widest text-brand-orange mb-2 block"
					>{m.home_audience_eyebrow()}</span
				>
				<h2 class="text-2xl font-bold mb-2">{m.home_audience_title_mobile()}</h2>
				<p class="text-sm text-text-muted">
					{m.home_audience_subtitle_mobile()}
				</p>
			</div>
			<div class="flex flex-col gap-3">
				{#each audienceCompact as audience}
					{@const cc = audienceColorClasses[audience.color] ?? audienceColorClasses['brand-blue']}
					<div class="bg-navy-card rounded-2xl border border-border p-4 flex items-start gap-4">
						<div
							class="w-11 h-11 rounded-xl {cc.iconBg} flex items-center justify-center {cc.iconText} text-lg flex-shrink-0"
						>
							<i class="fa-solid {audience.icon}"></i>
						</div>
						<div>
							<h3 class="font-bold text-sm mb-1">{t(audience.titleKey)}</h3>
							<p class="text-xs text-text-muted leading-relaxed">
								{t(audience.descKey)}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- FAQ (Mobile) -->
		<section id="faq-mobile" class="w-full">
			<div class="text-center mb-6">
				<span class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-2 block"
					>{m.home_faq_eyebrow_mobile()}</span
				>
				<h2 class="text-2xl font-bold mb-2">{m.home_faq_title_mobile()}</h2>
				<p class="text-sm text-text-muted">{m.home_faq_subtitle_mobile()}</p>
			</div>
			<div class="flex flex-col gap-2">
				{#each faqMobile as item (item.id)}
					<div class="faq-item bg-navy-card rounded-2xl border border-border overflow-hidden">
						<button
							onclick={toggleFaq}
							class="w-full flex items-center justify-between p-4 text-left"
						>
							<span class="text-sm font-semibold text-white">{t(item.questionKey)}</span>
							<i class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform duration-300"></i>
						</button>
						<div class="faq-answer hidden px-4 pb-4">
							<p class="text-xs text-text-muted leading-relaxed">
								{t(item.answerKey)}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</main>

	<!-- Mobile Footer -->
	<footer class="md:hidden w-full max-w-md mx-auto px-4 pb-10 pt-8 border-t border-border mt-4">
		<div class="flex flex-col items-center gap-6">
			<div class="flex items-center gap-2">
				<div
					class="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue"
				>
					<i class="fa-solid fa-shield-halved text-base"></i>
				</div>
				<span class="text-lg font-bold tracking-tight">MetaCleaner</span>
			</div>
			<p class="text-xs text-text-muted text-center max-w-xs">
				{m.footer_tagline_mobile()}
			</p>
			<div class="flex flex-wrap justify-center gap-x-5 gap-y-2">
				<a href="#" class="text-xs text-text-muted hover:text-white transition-colors">{m.footer_short_privacy()}</a>
				<a href="#" class="text-xs text-text-muted hover:text-white transition-colors">{m.footer_short_terms()}</a>
				<a href="#" class="text-xs text-text-muted hover:text-white transition-colors">{m.footer_short_contact()}</a>
				<a href="#" class="text-xs text-text-muted hover:text-white transition-colors">{m.footer_short_about()}</a>
			</div>
			<p class="text-[10px] text-text-muted text-center">
				{m.footer_copyright()}
			</p>
		</div>
	</footer>
</div>
