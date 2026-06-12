<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { locale, switchLocale } from '$lib/locale.svelte';
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
		/** If provided, back button calls this instead of navigating to backHref. */
		backAction?: () => void;
		backLabel?: string;
		showLangDropdown?: boolean;
		/** If provided, the logo is wrapped in an <a> tag with this href. */
		logoHref?: string;
		/** If provided (and logoHref is absent), the logo is a button with this click handler. */
		onLogoClick?: () => void;
		/** Compact mode: smaller mobile logo and icon sizes (reports pages). */
		compact?: boolean;
		/** Reduced desktop vertical padding — py-5 instead of py-6 (report detail page). */
		reducedDesktopPadding?: boolean;
		/** Add no-print CSS class to the nav element (report detail page). */
		noPrint?: boolean;
		onLogout?: () => void;
	}

	let {
		user,
		langOptions,
		showBackButton = false,
		backHref = '/',
		backAction,
		backLabel = '',
		showLangDropdown = true,
		logoHref,
		onLogoClick,
		compact = false,
		reducedDesktopPadding = false,
		noPrint = false,
		onLogout
	}: Props = $props();

	let langDropdownOpen = $state(false);
	let userDropdownOpen = $state(false);
	let hamburgerMenuOpen = $state(false);

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
				{#if backAction}
					<button
						onclick={backAction}
						aria-label={tx('common.goBack')}
						class="flex items-center justify-center rounded-lg border border-gray-700 bg-navy-lighter text-text-muted lg:hidden
							{compact ? 'h-8 w-8' : 'h-9 w-9'}"
					>
						<i class="fa-solid fa-arrow-left {compact ? 'text-xs' : 'text-sm'}"></i>
					</button>
				{:else}
					<a
						href={resolve(backHref as Pathname)}
						aria-label={tx('common.goBack')}
						class="flex items-center justify-center rounded-lg border border-gray-700 bg-navy-lighter text-text-muted lg:hidden
							{compact ? 'h-8 w-8' : 'h-9 w-9'}"
					>
						<i class="fa-solid fa-arrow-left {compact ? 'text-xs' : 'text-sm'}"></i>
					</a>
				{/if}
			{/if}
			{#if logoHref}
				<a href={resolve(logoHref as Pathname)} class="flex items-center gap-2 lg:gap-3">
					{@render logoContent()}
				</a>
			{:else if onLogoClick}
				<button
					onclick={onLogoClick}
					class="flex cursor-pointer items-center gap-2 bg-transparent p-0 lg:gap-3"
				>
					{@render logoContent()}
				</button>
			{:else}
				<div class="flex items-center gap-2.5 lg:gap-3">
					{@render logoContent()}
				</div>
			{/if}
		</div>

		<!-- Desktop right side -->
		<div class="hidden items-center gap-3 lg:flex">
			{#if showBackButton}
				{#if backAction}
					<button
						onclick={backAction}
						class="flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-lighter px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-gray-800 hover:text-white"
					>
						<i class="fa-solid fa-arrow-left text-xs"></i>
						<span>{backLabel}</span>
					</button>
				{:else}
					<a
						href={resolve(backHref as Pathname)}
						class="flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-lighter px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-gray-800 hover:text-white"
					>
						<i class="fa-solid fa-arrow-left text-xs"></i>
						<span>{backLabel}</span>
					</a>
				{/if}
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
			<UserDropdown {user} bind:open={userDropdownOpen} wrapperId="nav-userDropdown" {onLogout} />
		</div>

		<!-- Mobile hamburger menu (always shown on mobile) -->
		<MobileHamburgerMenu
			{user}
			{langOptions}
			bind:open={hamburgerMenuOpen}
			onSelect={handleLangSelect}
			wrapperId="nav-hamburgerDropdown"
			{onLogout}
		/>
	</div>
</nav>
