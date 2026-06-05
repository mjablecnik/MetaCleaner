<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { locale, switchLocale } from '$lib/locale.svelte';
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
		noPrint = false
	}: Props = $props();

	let langDropdownOpen = $state(false);
	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);

	function tx(key: string): string {
		void locale.current; // reactive dependency
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
		class="flex items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue
			{compact ? 'h-8 w-8 lg:h-10 lg:w-10' : 'h-9 w-9 lg:h-10 lg:w-10'}"
	>
		<i class="fa-solid fa-shield-halved {compact ? 'text-sm lg:text-xl' : 'text-base lg:text-xl'}"
		></i>
	</div>
	<span class="font-bold tracking-tight {compact ? 'text-base lg:text-xl' : 'text-lg lg:text-xl'}">
		{tx('common.brandName')}
	</span>
{/snippet}

<nav
	class="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-navy-main lg:static lg:border-0"
	class:no-print={noPrint}
>
	<div
		class="mx-auto flex max-w-[1100px] items-center justify-between px-4 lg:px-6
			{reducedDesktopPadding ? 'py-4 lg:py-5' : 'py-4 lg:py-6'}"
	>
		<!-- Logo area -->
		<div class="flex items-center {showBackButton ? 'gap-2 lg:gap-3' : 'gap-2.5 lg:gap-3'}">
			{#if showBackButton}
				<a
					href={resolve(backHref as Pathname)}
					class="flex items-center justify-center rounded-lg border border-gray-700 bg-navy-lighter text-text-muted lg:hidden
						{compact ? 'h-8 w-8' : 'h-9 w-9'}"
				>
					<i class="fa-solid fa-arrow-left {compact ? 'text-xs' : 'text-sm'}"></i>
				</a>
			{/if}
			{#if logoHref}
				<a href={resolve(logoHref as Pathname)} class="flex items-center gap-2 lg:gap-3">
					{@render logoContent()}
				</a>
			{:else}
				<div class="flex items-center gap-2.5 lg:gap-3">
					{@render logoContent()}
				</div>
			{/if}
		</div>

		<!-- Desktop right side -->
		<div class="hidden items-center gap-3 lg:flex">
			{#if showBackButton}
				<a
					href={resolve(backHref as Pathname)}
					class="flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-lighter px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-gray-800 hover:text-white"
				>
					<i class="fa-solid fa-arrow-left text-xs"></i>
					<span>{backLabel}</span>
				</a>
			{/if}
			{#if showLangDropdown}
				<LanguageDropdown
					{langOptions}
					currentLocale={locale.current}
					bind:open={langDropdownOpen}
					onSelect={handleLangSelect}
					wrapperId="nav-langDropdown"
				/>
			{/if}
			<UserDropdown {user} bind:open={userDropdownOpen} wrapperId="nav-userDropdown" />
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
						class="flex h-10 w-10 items-center justify-center rounded-full border border-brand-blue/40 bg-brand-blue/20"
					>
						<i class="fa-solid fa-user text-sm text-brand-blue"></i>
					</button>
					<div class="lang-dropdown-menu" class:open={hamburgerMenuOpen} style="min-width:220px">
						<div class="border-b border-gray-700 px-4 py-3">
							<p class="text-xs text-text-muted">{tx('common.nav.loggedInAs')}</p>
							<p class="mt-0.5 truncate text-sm font-semibold text-white">{user?.email ?? ''}</p>
						</div>
						{#if showLangDropdown}
							<div class="border-b border-gray-700 px-4 py-2">
								<p class="mb-1 text-[10px] tracking-wider text-text-muted uppercase">
									{tx('common.nav.language')}
								</p>
								<div class="flex flex-col gap-0.5">
									{#each langOptions as lang (lang.code)}
										<div
											class="lang-option rounded-lg"
											class:active={locale.current === lang.code}
											onclick={() => handleLangSelect(lang.code)}
											role="button"
											tabindex="0"
											onkeydown={(e) => e.key === 'Enter' && handleLangSelect(lang.code)}
										>
											<img src={lang.flag} alt={lang.label} class="h-4 w-6 rounded-sm object-cover" />
											{lang.name}
											{#if locale.current === lang.code}
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
							<i class="fa-solid fa-gear text-sm text-text-muted"></i>
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
