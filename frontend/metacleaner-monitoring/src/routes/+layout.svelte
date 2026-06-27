<script lang="ts">
	import type { Pathname } from '$app/types';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { t } from '$lib/i18n';
	import { initLocale } from '$lib/locale.svelte';
	import { getNavSections } from '$lib/repositories/navigationRepository';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

	let { children } = $props();
	let drawerOpen = $state(false);

	const pathname = $derived(page.url.pathname);
	const navSections = getNavSections(base);

	onMount(() => {
		initLocale();
	});

	function isActive(href: string): boolean {
		const root = `${base}/`;
		if (href === root) return pathname === root || pathname === base;
		return pathname.startsWith(href);
	}

	function toggleDrawer() {
		drawerOpen = !drawerOpen;
	}

	function closeDrawer() {
		drawerOpen = false;
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen">
	<!-- Desktop Sidebar -->
	<aside class="hidden lg:flex w-64 flex-col flex-shrink-0 bg-card border-r border-surface">
		<div class="p-6 border-b border-surface flex items-center gap-3">
			<div
				class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold"
			>
				M
			</div>
			<span class="text-xl font-bold text-textMain tracking-tight">Monitorly</span>
		</div>

		<nav class="p-4 flex-1 overflow-y-auto space-y-1">
			{#each navSections as section}
				<p class="text-xs font-semibold text-textSec uppercase tracking-wider mb-2 px-3 mt-6 first:mt-0">
					{t(section.labelKey)}
				</p>
				{#each section.items as item}
					<a
						href={item.href}
						class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors {isActive(item.href)
							? 'bg-surface/50 text-textMain font-medium'
							: 'text-textSec hover:text-textMain hover:bg-surface/50'}"
					>
						<i
							class="fa-solid {item.icon} w-5 text-center {isActive(item.href) ? 'text-primary' : ''}"
						></i>
						{t(item.labelKey)}
					</a>
				{/each}
			{/each}
		</nav>

		<div class="p-4 border-t border-surface space-y-1">
			<LanguageSwitcher />
			<a
				href={`${base}/nastaveni`}
				class="flex items-center gap-3 px-3 py-2 text-textSec hover:text-textMain hover:bg-surface/50 rounded-lg transition-colors"
			>
				<i class="fa-solid fa-gear w-5 text-center"></i>
				{t('layout_nav_settings')}
			</a>
		</div>
	</aside>

	<!-- Right side: mobile bar + content -->
	<div class="flex-1 flex flex-col min-w-0 overflow-hidden">
		<!-- Mobile Top Bar -->
		<header
			class="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-surface px-4 py-3 flex items-center justify-between"
		>
			<div class="flex items-center gap-3">
				<button
					onclick={toggleDrawer}
					class="touch-target flex items-center justify-center text-textSec hover:text-textMain rounded-lg border border-surface bg-card transition-colors"
					aria-label={t('common_actions_menu')}
				>
					<i class="fa-solid fa-bars text-lg"></i>
				</button>
				<div class="flex items-center gap-2">
					<div
						class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm"
					>
						M
					</div>
					<span class="text-lg font-bold text-textMain tracking-tight">Monitorly</span>
				</div>
			</div>
			<button
				class="touch-target flex items-center justify-center bg-surface text-white rounded-lg border border-border transition-colors"
				aria-label={t('common_actions_export')}
			>
				<i class="fa-solid fa-download"></i>
			</button>
		</header>

		<!-- Main scrollable content -->
		<main class="flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</div>
</div>

<!-- Mobile Drawer Overlay -->
{#if drawerOpen}
	<div
		class="fixed inset-0 bg-black/60 z-40 lg:hidden"
		onclick={closeDrawer}
		aria-hidden="true"
	></div>
{/if}

<!-- Mobile Drawer -->
<aside
	class="fixed inset-y-0 left-0 w-[280px] bg-card z-50 flex flex-col border-r border-surface shadow-2xl transition-transform duration-300 ease-in-out lg:hidden {drawerOpen
		? 'translate-x-0'
		: '-translate-x-full'}"
>
	<div class="p-4 border-b border-surface flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div
				class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold"
			>
				M
			</div>
			<span class="text-lg font-bold text-textMain tracking-tight">Monitorly</span>
		</div>
		<button
			onclick={closeDrawer}
			class="touch-target flex items-center justify-center text-textSec hover:text-textMain rounded-lg"
			aria-label={t('common_actions_closeMenu')}
		>
			<i class="fa-solid fa-xmark text-xl"></i>
		</button>
	</div>

	<nav class="p-3 flex-1 overflow-y-auto space-y-1">
		{#each navSections as section}
			<p class="text-xs font-semibold text-textSec uppercase tracking-wider mb-2 px-3 pt-4 first:pt-2">
				{t(section.labelKey)}
			</p>
			{#each section.items as item}
				<a
					href={item.href}
					onclick={closeDrawer}
					class="touch-target flex items-center gap-3 px-3 py-3 rounded-xl transition-colors {isActive(item.href)
						? 'bg-surface/50 text-textMain font-medium'
						: 'text-textSec hover:text-textMain hover:bg-surface/50'}"
				>
					<i
						class="fa-solid {item.icon} w-6 text-center text-lg {isActive(item.href) ? 'text-primary' : ''}"
					></i>
					{t(item.labelKey)}
				</a>
			{/each}
		{/each}
	</nav>

	<div class="p-3 border-t border-surface space-y-1">
		<LanguageSwitcher />
		<a
			href={`${base}/nastaveni`}
			onclick={closeDrawer}
			class="touch-target flex items-center gap-3 px-3 py-3 text-textSec hover:text-textMain hover:bg-surface/50 rounded-xl transition-colors"
		>
			<i class="fa-solid fa-gear w-6 text-center text-lg"></i>
			{t('layout_nav_settings')}
		</a>
	</div>
</aside>

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={localizeHref(page.url.pathname, { locale }) as Pathname}>{locale}</a>
	{/each}
</div>
