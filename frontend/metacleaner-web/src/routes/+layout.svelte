<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import './layout.css';
	import SiteNavbar from '$lib/components/shared/SiteNavbar.svelte';
	import MobileNavbar from '$lib/components/shared/MobileNavbar.svelte';
	import MobileMenu from '$lib/components/shared/MobileMenu.svelte';
	import SiteFooter from '$lib/shared/sections/SiteFooter.svelte';

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
		const path = $page.url.pathname;
		if (path.startsWith('/features')) return 'features' as const;
		if (path.startsWith('/pricing')) return 'pricing' as const;
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
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"
		rel="stylesheet"
	/>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
		crossorigin="anonymous"
	/>
</svelte:head>

<MobileMenu
	variant={menuVariant}
	active={activePage}
	open={mobileMenuOpen}
	onClose={closeMobileMenu}
/>

<div class="flex flex-col items-center w-full">
	<SiteNavbar active={activePage} />
	<MobileNavbar open={mobileMenuOpen} onToggle={toggleMobileMenu} />
	{@render children()}
	<SiteFooter />
</div>
