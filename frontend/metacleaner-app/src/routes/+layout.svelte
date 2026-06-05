<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { initLocale, locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { page } from '$app/state';
	import NavBar from '$lib/shared/components/NavBar.svelte';
	import { getCurrentUser, type User } from '$lib/repositories/userRepository';
	import { getLanguages, type Language } from '$lib/repositories/languageRepository';

	let { children } = $props();

	let user = $state<User | null>(null);
	let langOptions = $state<Language[]>([]);

	function tx(key: string): string {
		locale.current;
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
	}

	const navProps = $derived.by(() => {
		const path = page.url.pathname;
		if (path === '/reports') {
			return {
				logoHref: '/' as string | undefined,
				compact: true,
				mobileStyle: 'avatar' as const,
				showLangDropdown: false,
				showBackButton: true,
				backHref: '/step5',
				backLabel: tx('reports.nav.backToCleaning'),
			};
		}
		if (path === '/report') {
			return {
				logoHref: '/' as string | undefined,
				compact: true,
				mobileStyle: 'avatar' as const,
				showLangDropdown: true,
				showBackButton: true,
				backHref: '/step5',
				backLabel: tx('report.nav.backToResults'),
				reducedDesktopPadding: true,
				noPrint: true,
			};
		}
		if (path !== '/') {
			return { logoHref: '/' as string | undefined };
		}
		return {};
	});

	onMount(() => {
		initLocale();
		Promise.all([getLanguages(), getCurrentUser()]).then(([langs, u]) => {
			langOptions = langs;
			user = u;
		});
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex flex-col min-h-screen bg-navy-main text-white font-sans">
	<NavBar {user} {langOptions} {...navProps} />
	{@render children()}
</div>
