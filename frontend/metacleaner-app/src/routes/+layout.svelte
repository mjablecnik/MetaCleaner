<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { initLocale } from '$lib/locale.svelte';
	import { page } from '$app/state';
	import { App } from '@capacitor/app';
	import NavBar from '$lib/shared/components/NavBar.svelte';
	import { getCurrentUser, type User } from '$lib/repositories/userRepository';
	import { getLanguages, type Language } from '$lib/repositories/languageRepository';
	import { appState } from '$lib/stores/appState.svelte';
	import { authStore } from '$lib/auth/auth.svelte.js';

	let { children } = $props();

	let user = $state<User | null>(null);
	let langOptions = $state<Language[]>([]);

	// Reactively load user profile when auth state changes (e.g., after login navigates here)
	$effect(() => {
		if (authStore.isAuthReady && authStore.isAuthenticated) {
			getCurrentUser().then((u) => {
				user = u;
			});
		} else if (authStore.isAuthReady && !authStore.isAuthenticated) {
			user = null;
		}
	});

	const navProps = $derived.by(() => {
		const path = page.url.pathname;
		if (path === '/reports') {
			return {
				logoHref: '/' as string | undefined,
				compact: true,
				showLangDropdown: true,
				showBackButton: true,
				backHref: '/',
				backLabel: tx('reports.nav.backToCleaning')
			};
		}
		if (path.startsWith('/report/') || path === '/report') {
			return {
				logoHref: '/' as string | undefined,
				compact: true,
				showLangDropdown: true,
				showBackButton: true,
				backAction: () => history.back(),
				backLabel: tx('report.nav.backToResults'),
				reducedDesktopPadding: true,
				noPrint: true
			};
		}
		if (path !== '/') {
			return { logoHref: '/' as string | undefined };
		}
		if (appState.current === 'success') {
			return { onLogoClick: () => appState.reset() };
		}
		return {};
	});

	onMount(() => {
		initLocale();
		getLanguages().then((langs) => {
			langOptions = langs;
		});

		// Handle Android hardware back button
		App.addListener('backButton', ({ canGoBack }) => {
			if (canGoBack) {
				window.history.back();
			}
			// If can't go back, do nothing (don't close the app)
		});
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col bg-navy-main font-sans text-white">
	{#if !authStore.isAuthReady}
		<div class="flex flex-1 items-center justify-center">
			<i class="fa-solid fa-spinner fa-spin text-2xl text-brand-blue"></i>
		</div>
	{:else}
		{#if !page.route.id?.startsWith('/(auth)')}
			<NavBar {user} {langOptions} {...navProps} onLogout={() => authStore.logout()} />
		{/if}
		{@render children()}
	{/if}
</div>
