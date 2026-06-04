<script lang="ts">
	import { onMount } from 'svelte';
	import { currentLocale, switchLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Language } from '$lib/repositories/languageRepository';
	import type { User } from '$lib/repositories/userRepository';
	import LanguageDropdown from './LanguageDropdown.svelte';
	import UserDropdown from './UserDropdown.svelte';
	import MobileHamburgerMenu from './MobileHamburgerMenu.svelte';

	interface Props {
		user: User | null;
		langOptions: Language[];
		showBackButton?: boolean;
		backHref?: string;
		backLabel?: string;
		showLangDropdown?: boolean;
		/** If provided, the logo is wrapped in an <a> tag with this href. */
		logoHref?: string;
		/** 'hamburger' = bars icon (steps 1-5), 'avatar' = user circle (reports pages). */
		mobileStyle?: 'hamburger' | 'avatar';
		/** Compact mode: smaller mobile logo and icon sizes (reports pages). */
		compact?: boolean;
		/** Reduced desktop vertical padding — py-5 instead of py-6 (report detail page). */
		reducedDesktopPadding?: boolean;
		/** Add no-print CSS class to the nav element (report detail page). */
		noPrint?: boolean;
	}

	let {
		user,
		langOptions,
		showBackButton = false,
		backHref = '/',
		backLabel = '',
		showLangDropdown = true,
		logoHref,
		mobileStyle = 'hamburger',
		compact = false,
		reducedDesktopPadding = false,
		noPrint = false,
	}: Props = $props();

	let langDropdownOpen = $state(false);
	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);

	function tx(key: string): string {
		currentLocale; // reactive dependency
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
	}

	function handleLangSelect(code: string) {
		switchLocale(code);
		langDropdownOpen = false;
		hamburgerMenuOpen = false;
	}

	function handleClickOutside(e: MouseEvent) {
		const t = e.target as Element;
		if (!t.closest('#nav-langDropdown')) langDropdownOpen = false;
		if (!t.closest('#nav-userDropdown')) userDropdownOpen = false;
		if (!t.closest('#nav-hamburgerDropdown')) hamburgerMenuOpen = false;
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

{#snippet logoContent()}
	<div
		class="rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-glow-blue
			{compact ? 'w-8 h-8 lg:w-10 lg:h-10' : 'w-9 h-9 lg:w-10 lg:h-10'}"
	>
		<i class="fa-solid fa-shield-halved {compact ? 'text-sm lg:text-xl' : 'text-base lg:text-xl'}"
		></i>
	</div>
	<span class="font-bold tracking-tight {compact ? 'text-base lg:text-xl' : 'text-lg lg:text-xl'}">
		{tx('common.brandName')}
	</span>
{/snippet}

<nav
	class="w-full sticky lg:static top-0 bg-navy-main border-b border-gray-800/50 lg:border-0 z-50"
	class:no-print={noPrint}
>
	<div
		class="max-w-[1100px] mx-auto px-4 lg:px-6 flex justify-between items-center
			{reducedDesktopPadding ? 'py-4 lg:py-5' : 'py-4 lg:py-6'}"
	>
		<!-- Logo area -->
		<div class="flex items-center {showBackButton ? 'gap-2 lg:gap-3' : 'gap-2.5 lg:gap-3'}">
			{#if showBackButton}
				<a
					href={backHref}
					class="flex lg:hidden items-center justify-center rounded-lg bg-navy-lighter border border-gray-700 text-text-muted
						{compact ? 'w-8 h-8' : 'w-9 h-9'}"
				>
					<i class="fa-solid fa-arrow-left {compact ? 'text-xs' : 'text-sm'}"></i>
				</a>
			{/if}
			{#if logoHref}
				<a href={logoHref} class="flex items-center gap-2 lg:gap-3">
					{@render logoContent()}
				</a>
			{:else}
				<div class="flex items-center gap-2.5 lg:gap-3">
					{@render logoContent()}
				</div>
			{/if}
		</div>

		<!-- Desktop right side -->
		<div class="hidden lg:flex items-center gap-3">
			{#if showBackButton}
				<a
					href={backHref}
					class="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-lighter border border-gray-700 text-sm font-semibold text-text-muted hover:text-white hover:bg-gray-800 transition-colors"
				>
					<i class="fa-solid fa-arrow-left text-xs"></i>
					<span>{backLabel}</span>
				</a>
			{/if}
			{#if showLangDropdown}
				<LanguageDropdown
					{langOptions}
					currentLocale={currentLocale}
					bind:open={langDropdownOpen}
					onSelect={handleLangSelect}
					wrapperId="nav-langDropdown"
				/>
			{/if}
			<UserDropdown
				{user}
				bind:open={userDropdownOpen}
				wrapperId="nav-userDropdown"
			/>
		</div>

		<!-- Mobile menu -->
		{#if mobileStyle === 'hamburger'}
			<MobileHamburgerMenu
				{user}
				{langOptions}
				bind:open={hamburgerMenuOpen}
				onSelect={handleLangSelect}
				wrapperId="nav-hamburgerDropdown"
			/>
		{:else}
			<!-- Avatar-style mobile menu (reports pages) -->
			<div id="nav-hamburgerDropdown" class="flex lg:hidden">
				<div class="relative inline-block">
					<button
						type="button"
						onclick={() => (hamburgerMenuOpen = !hamburgerMenuOpen)}
						class="w-10 h-10 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center"
					>
						<i class="fa-solid fa-user text-brand-blue text-sm"></i>
					</button>
					<div class="lang-dropdown-menu" class:open={hamburgerMenuOpen} style="min-width:220px">
						<div class="px-4 py-3 border-b border-gray-700">
							<p class="text-xs text-text-muted">{tx('common.nav.loggedInAs')}</p>
							<p class="text-sm font-semibold text-white mt-0.5 truncate">{user?.email ?? ''}</p>
						</div>
						{#if showLangDropdown}
							<div class="px-4 py-2 border-b border-gray-700">
								<p class="text-[10px] text-text-muted uppercase tracking-wider mb-1">
									{tx('common.nav.language')}
								</p>
								<div class="flex flex-col gap-0.5">
									{#each langOptions as lang}
										<div
											class="lang-option rounded-lg"
											class:active={currentLocale === lang.code}
											onclick={() => handleLangSelect(lang.code)}
											role="button"
											tabindex="0"
											onkeydown={(e) => e.key === 'Enter' && handleLangSelect(lang.code)}
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
						{/if}
						<div
							class="lang-option"
							role="button"
							tabindex="0"
							onkeydown={(e) => e.key === 'Enter' && e.currentTarget.click()}
						>
							<i class="fa-solid fa-gear text-text-muted text-sm"></i>
							<span>{tx('common.nav.settings')}</span>
						</div>
						<div
							class="lang-option lang-option-danger"
							role="button"
							tabindex="0"
							onkeydown={(e) => e.key === 'Enter' && e.currentTarget.click()}
						>
							<i class="fa-solid fa-right-from-bracket text-sm text-brand-red"></i>
							<span>{tx('common.nav.logout')}</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</nav>
