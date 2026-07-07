<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { deLocalizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import SiteNavbar from '$lib/components/shared/SiteNavbar.svelte';
	import MobileNavbar from '$lib/components/shared/MobileNavbar.svelte';
	import MobileMenu from '$lib/components/shared/MobileMenu.svelte';
	import SiteFooter from '$lib/shared/sections/SiteFooter.svelte';
	import CookieConsentBanner from '$lib/components/shared/CookieConsentBanner.svelte';
	import JsonLd from '$lib/components/shared/JsonLd.svelte';

	const supabaseOrigin = (() => {
		try {
			return new URL(import.meta.env.VITE_SUPABASE_URL ?? '').origin;
		} catch {
			return null;
		}
	})();

	const siteJsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				name: 'MetaCleaner',
				url: 'https://metacleaner.app',
				logo: 'https://metacleaner.app/og-default.png'
			},
			{
				'@type': 'WebSite',
				name: 'MetaCleaner',
				url: 'https://metacleaner.app'
			}
		]
	};

	let { children } = $props();

	onMount(() => {
		const savedScrollY = sessionStorage.getItem('__locale_scroll_y');
		if (savedScrollY !== null) {
			sessionStorage.removeItem('__locale_scroll_y');
			requestAnimationFrame(() => {
				window.scrollTo(0, parseInt(savedScrollY, 10));
			});
		}
	});

	let mobileMenuOpen = $state(false);

	const activePage = $derived.by(() => {
		const path = deLocalizeHref($page.url.pathname);
		if (path.startsWith('/features')) return 'features' as const;
		if (path.startsWith('/pricing')) return 'pricing' as const;
		if (path.startsWith('/about')) return 'about' as const;
		return 'home' as const;
	});

	const menuVariant = $derived('drawer' as const);

	$effect(() => {
		void $page.url.pathname;
		mobileMenuOpen = false;
	});

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link rel="dns-prefetch" href="https://app.metacleaner.com" />
	{#if supabaseOrigin}
		<link rel="preconnect" href={supabaseOrigin} crossorigin="anonymous" />
	{/if}
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-brand-blue focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
>
	Skip to main content
</a>

<JsonLd data={siteJsonLd} />

<MobileMenu
	variant={menuVariant}
	active={activePage}
	open={mobileMenuOpen}
	onClose={closeMobileMenu}
/>

<div class="flex flex-col items-center w-full min-h-screen">
	<SiteNavbar active={activePage} />
	<MobileNavbar open={mobileMenuOpen} onToggle={toggleMobileMenu} />
	<div id="main-content" tabindex="-1" class="contents">
		{@render children()}
	</div>
	<SiteFooter />
	<CookieConsentBanner />
</div>
