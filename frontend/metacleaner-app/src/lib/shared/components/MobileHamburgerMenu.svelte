<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { page } from '$app/state';
	import { locale } from '$lib/locale.svelte';
	import type { Language } from '$lib/repositories/languageRepository';
	import type { User } from '$lib/repositories/userRepository';
	import { billingStore } from '$lib/stores/billingStore.svelte';
	import { getPlanStyle } from '$lib/shared/utils/planStyleMap';
	import { formatCreditCount, getCreditColorScheme } from '$lib/shared/utils/formatCredits';
	import { computeProgressRatio } from '$lib/shared/utils/creditCost';
	import { creditLabel } from '$lib/shared/utils/creditPlural';

	interface Props {
		user: User | null;
		langOptions: Language[];
		open?: boolean;
		onSelect: (code: string) => void;
		onLogout?: () => void;
		wrapperId?: string;
	}

	let {
		user,
		langOptions,
		open = $bindable(false),
		onSelect,
		onLogout,
		wrapperId = 'hamburgerDropdown'
	}: Props = $props();

	function handleSelect(code: string) {
		onSelect(code);
		open = false;
	}

	function handleClose() {
		open = false;
	}
</script>

<div id={wrapperId} class="flex items-center gap-2 lg:hidden">
	<button
		type="button"
		onclick={() => (open = !open)}
		aria-label={open ? tx('common.closeMenu') : tx('common.openMenu')}
		aria-expanded={open}
		class="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-700 bg-navy-lighter text-white"
	>
		<i class="fa-solid {open ? 'fa-xmark' : 'fa-bars'} text-base"></i>
	</button>

	<!-- Backdrop -->
	{#if open}
		<div
			class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
			onclick={handleClose}
			role="button"
			tabindex="-1"
			onkeydown={(e) => e.key === 'Escape' && handleClose()}
		></div>
	{/if}

	<!-- Full-screen drawer -->
	<div
		class="fixed top-0 right-0 z-40 flex h-full w-full flex-col border-l border-gray-800 bg-navy-card shadow-2xl transition-transform duration-300
			{open ? 'translate-x-0' : 'translate-x-full'}"
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-gray-800 px-6 py-4">
			<div class="flex items-center gap-2.5">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue"
				>
					<i class="fa-solid fa-shield-halved text-base"></i>
				</div>
				<span class="text-lg font-bold tracking-tight text-white">{tx('common.brandName')}</span>
			</div>
			<button
				onclick={handleClose}
				aria-label={tx('common.closeMenu')}
				class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 bg-navy-lighter text-white"
			>
				<i class="fa-solid fa-xmark text-sm"></i>
			</button>
		</div>

		<!-- Content -->
		<div class="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
			<!-- User info -->
			{#if user}
				{@const planStyle = getPlanStyle(billingStore.planId, billingStore.planStatus)}
				<div class="mb-3 rounded-xl border border-gray-800 bg-navy-main/60 px-4 py-3">
					<p class="text-xs text-text-muted">{tx('common.nav.loggedInAs')}</p>
					<p class="mt-0.5 truncate text-sm font-semibold text-white">{user.email}</p>
					<p class="mt-1.5 flex items-center gap-1 text-xs font-medium {planStyle.textColor}">
						<i class="fa-solid {planStyle.icon === 'lock' ? 'fa-lock' : 'fa-star'} text-[9px]"></i>
						{planStyle.label}
					</p>
				</div>
			{/if}

			<!-- Credit section -->
			{#if billingStore.credits !== null}
				{@const credits = billingStore.credits}
				{@const isWarning = getCreditColorScheme(credits) === 'warning'}
				{@const progressRatio = computeProgressRatio(credits, billingStore.monthlyAllowance)}
				{@const cardBorder = isWarning ? 'border-orange-500/40' : 'border-brand-green/30'}
				{@const cardBg = isWarning ? 'bg-orange-950/30' : 'bg-brand-green/[0.06]'}
				{@const dotClass = isWarning
					? 'bg-orange-400 shadow-orange-400/30'
					: 'bg-brand-green shadow-brand-green/30'}
				{@const textClass = isWarning ? 'text-orange-400' : 'text-brand-green'}
				{@const barClass = isWarning ? 'bg-orange-500' : 'bg-brand-green'}
				<div class="mb-3 rounded-xl border px-4 py-3 {cardBorder} {cardBg}">
					<div class="mb-2 flex items-center gap-2">
						<span class="relative flex h-1.5 w-1.5 flex-shrink-0">
							<span
								class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 {dotClass}"
								style="animation-duration: 2s"
							></span>
							<span class="relative inline-flex h-1.5 w-1.5 rounded-full {dotClass}"></span>
						</span>
						<i class="fa-solid fa-bolt text-[9px] {textClass}"></i>
						<span class="text-sm font-bold {textClass}">{formatCreditCount(credits)}</span>
						<span class="text-xs {textClass}"
							>{creditLabel(credits, locale.current as 'en' | 'cs')}
							{tx('credits.banner.remaining')}</span
						>
					</div>
					<div class="mb-1 h-1 w-full overflow-hidden rounded-full bg-navy-lighter">
						<div
							class="h-full rounded-full transition-all {barClass}"
							style="width: {Math.round(progressRatio * 100)}%"
						></div>
					</div>
					<p class="text-[10px] text-text-muted">
						{tx('credits.banner.of')}
						{billingStore.monthlyAllowance}
					</p>
				</div>
			{/if}

			<!-- Language section -->
			<p class="mb-2 px-2 text-[10px] font-bold tracking-widest text-text-muted uppercase">
				{tx('common.nav.language')}
			</p>
			{#each langOptions as lang (lang.code)}
				<button
					class="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-text-muted transition-all
						{locale.current === lang.code
						? 'bg-navy-lighter text-white'
						: 'hover:bg-navy-lighter hover:text-white'}"
					onclick={() => handleSelect(lang.code)}
				>
					<img src={lang.flag} alt={lang.label} class="h-5 w-7 rounded-sm object-cover" />
					<span class="text-sm font-medium">{lang.name}</span>
					{#if locale.current === lang.code}
						<i class="fa-solid fa-check ml-auto text-xs text-brand-blue"></i>
					{/if}
				</button>
			{/each}

			<div class="my-3 border-t border-gray-800"></div>

			<!-- Reports -->
			<a
				href={resolve('/reports' as Pathname)}
				onclick={handleClose}
				class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-text-muted transition-all hover:bg-navy-lighter hover:text-white"
			>
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue/10 text-sm text-brand-blue"
				>
					<i class="fa-solid fa-file-lines"></i>
				</div>
				<span class="text-sm font-medium">{tx('common.nav.reportHistory')}</span>
				<i class="fa-solid fa-chevron-right ml-auto text-[10px] opacity-40"></i>
			</a>

			<!-- Settings -->
			<a
				href={resolve('/settings' as Pathname)}
				onclick={handleClose}
				class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-text-muted transition-all hover:bg-navy-lighter hover:text-white"
			>
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-lighter text-sm text-text-muted"
				>
					<i class="fa-solid fa-gear"></i>
				</div>
				<span class="text-sm font-medium">{tx('common.nav.settings')}</span>
				<i class="fa-solid fa-chevron-right ml-auto text-[10px] opacity-40"></i>
			</a>

			<!-- Pricing -->
			<a
				href={resolve('/pricing' as Pathname)}
				onclick={handleClose}
				class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-text-muted transition-all hover:bg-navy-lighter hover:text-white"
			>
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-lighter text-sm text-text-muted"
				>
					<i class="fa-solid fa-tag"></i>
				</div>
				<span class="text-sm font-medium">{tx('common.nav.pricing')}</span>
				<i class="fa-solid fa-chevron-right ml-auto text-[10px] opacity-40"></i>
			</a>

			<!-- Docs -->
			<a
				href={resolve('/docs' as Pathname)}
				onclick={handleClose}
				class="flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-all hover:bg-navy-lighter
					{page.url.pathname === '/docs' ? 'text-brand-blue' : 'text-text-muted hover:text-white'}"
			>
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg text-sm
						{page.url.pathname === '/docs'
						? 'bg-brand-blue/10 text-brand-blue'
						: 'bg-navy-lighter text-text-muted'}"
				>
					<i class="fa-solid fa-book"></i>
				</div>
				<span class="text-sm font-medium {page.url.pathname === '/docs' ? 'font-semibold' : ''}"
					>{tx('docs.nav.docs')}</span
				>
				<i class="fa-solid fa-chevron-right ml-auto text-[10px] opacity-40"></i>
			</a>

			<div class="my-3 border-t border-gray-800"></div>

			<!-- Upgrade CTA (Free users only) -->
			{#if billingStore.isFreeUser}
				<a
					href={resolve('/pricing' as Pathname)}
					onclick={handleClose}
					class="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
				>
					<i class="fa-solid fa-arrow-right text-xs"></i>
					{tx('credits.banner.upgrade')}
				</a>
			{/if}

			<!-- Logout -->
			<button
				class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-brand-red transition-all hover:bg-brand-red/10"
				onclick={() => {
					onLogout?.();
					open = false;
				}}
			>
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red/10 text-sm text-brand-red"
				>
					<i class="fa-solid fa-right-from-bracket"></i>
				</div>
				<span class="text-sm font-medium">{tx('common.nav.logout')}</span>
			</button>
		</div>
	</div>
</div>
