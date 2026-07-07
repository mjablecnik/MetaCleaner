<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { setContext, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Pathname } from '$app/types';
	import {
		getDocsConfig,
		getSidebarSections,
		getSidebarEndpoints
	} from '$lib/repositories/docsRepository';
	import { billingStore } from '$lib/stores/billingStore.svelte';
	import UpgradeModal from '$lib/shared/components/UpgradeModal.svelte';

	let { children } = $props();

	const config = getDocsConfig();
	const sidebarSections = getSidebarSections();
	const sidebarEndpoints = getSidebarEndpoints();

	const sectionRouteMap: Record<string, string> = {
		'sec-intro': '/docs',
		'sec-auth': '/docs/auth',
		'sec-errors': '/docs/errors',
		'sec-endpoints': '/docs/endpoints'
	};

	const activeId = $derived.by(() => {
		const path = page.url.pathname;
		if (path === '/docs/auth') return 'sec-auth';
		if (path === '/docs/errors') return 'sec-errors';
		if (path === '/docs/endpoints') return 'sec-endpoints';
		return 'sec-intro';
	});

	let openEndpointIds = $state<Set<string>>(new Set());

	setContext('openEndpoints', {
		get ids() {
			return openEndpointIds;
		},
		update(newIds: Set<string>) {
			openEndpointIds = newIds;
		}
	});

	$effect(() => {
		if (page.url.pathname !== '/docs/endpoints') {
			openEndpointIds = new Set();
		}
	});

	const mobileNavItems = $derived(
		sidebarSections.map((s) => ({
			id: s.id,
			icon: s.icon,
			labelKey: s.labelKey,
			href: sectionRouteMap[s.id] ?? '/docs'
		}))
	);

	const currentMobileNavItem = $derived(
		mobileNavItems.find((item) => item.id === activeId) ?? mobileNavItems[0]
	);

	let mobileNavOpen = $state(false);

	function handleMobileNavSelect() {
		mobileNavOpen = false;
	}

	function handleMobileNavKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			mobileNavOpen = false;
		}
	}

	const isBillingReady = $derived(
		!billingStore.isLoading && (billingStore.credits !== null || billingStore.hasError)
	);

	function handleUpgradeModalDismiss() {
		goto(resolve('/' as Pathname));
	}

	onMount(() => {
		if (billingStore.credits === null && !billingStore.isLoading) {
			billingStore.refresh();
		}
	});
</script>

<div class="mx-auto w-full max-w-[1100px] px-4 lg:px-6">
	<!-- Page header: API badge + version (desktop only) -->
	<div class="hidden items-center gap-3 py-6 lg:flex">
		<div
			class="flex items-center gap-1.5 rounded-lg border border-brand-blue/30 bg-brand-blue/10 px-2.5 py-1 text-xs font-bold tracking-wider text-brand-blue uppercase"
		>
			<i class="fa-solid fa-shield-halved text-[10px]"></i>
			<span>API</span>
		</div>
		<span
			class="rounded-md border border-gray-700 bg-navy-lighter px-2 py-0.5 text-[11px] font-medium text-text-muted"
		>
			{config.apiVersion}
		</span>
	</div>

	{#if !isBillingReady}
		<div class="flex items-center justify-center py-20">
			<i class="fa-solid fa-circle-notch spin-slow text-2xl text-brand-blue"></i>
		</div>
	{:else if !billingStore.isProPlusUser}
		<div class="flex items-center justify-center py-20">
			<div class="w-full max-w-sm rounded-2xl border border-gray-700 bg-navy-card shadow-2xl">
				<UpgradeModal onDismiss={handleUpgradeModalDismiss} variant="docs" />
			</div>
		</div>
	{:else}
		<!-- Mobile navigation dropdown (fixed below navbar, visible only on mobile/tablet) -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed top-[72px] right-0 left-0 z-30 border-b border-gray-700/50 bg-navy-main px-4 pt-3 pb-2 lg:hidden"
			onkeydown={handleMobileNavKeydown}
		>
			<button
				type="button"
				onclick={() => (mobileNavOpen = !mobileNavOpen)}
				aria-expanded={mobileNavOpen}
				aria-haspopup="listbox"
				class="flex w-full cursor-pointer items-center justify-between rounded-lg border border-brand-blue/30 bg-navy-card px-4 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-brand-blue/50"
			>
				<span class="flex items-center gap-2.5">
					<i class="fa-solid {currentMobileNavItem.icon} text-xs text-brand-blue"></i>
					<span>{tx(currentMobileNavItem.labelKey)}</span>
				</span>
				<i
					class="fa-solid fa-chevron-down text-xs text-text-muted transition-transform duration-200 {mobileNavOpen
						? 'rotate-180'
						: ''}"
				></i>
			</button>

			{#if mobileNavOpen}
				<div
					class="absolute right-4 left-4 z-20 mt-1 rounded-lg border border-gray-700 bg-navy-card shadow-dropdown"
					role="listbox"
				>
					{#each mobileNavItems as item (item.id)}
						<a
							href={resolve(item.href as Pathname)}
							onclick={handleMobileNavSelect}
							role="option"
							aria-selected={activeId === item.id}
							class="flex cursor-pointer items-center gap-2.5 px-4 py-3 text-sm transition-colors duration-200
								{activeId === item.id
								? 'bg-brand-blue/5 font-semibold text-brand-blue'
								: 'text-text-muted hover:bg-navy-lighter hover:text-white'}"
						>
							<i class="fa-solid {item.icon} w-4 text-center text-xs"></i>
							<span>{tx(item.labelKey)}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		{#if mobileNavOpen}
			<!-- Backdrop to close dropdown when clicking outside -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="fixed inset-0 z-10 lg:hidden"
				onclick={() => (mobileNavOpen = false)}
				onkeydown={handleMobileNavKeydown}
			></div>
		{/if}

		<!-- Spacer for fixed mobile nav (height matches the fixed dropdown) -->
		<div class="h-[76px] lg:hidden"></div>

		<!-- Desktop layout: sidebar + scrollable content -->
		<div class="flex gap-8">
			<!-- Sidebar (desktop only) — sticky so it stays visible during scroll -->
			<aside class="hidden lg:block">
				<nav class="sticky top-[88px] w-56 shrink-0">
					<ul class="flex flex-col gap-0.5">
						{#each sidebarSections as section (section.id)}
							<li>
								<a
									href={resolve((sectionRouteMap[section.id] ?? '/docs') as Pathname)}
									class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-200
										{activeId === section.id ? 'font-semibold text-brand-blue' : 'text-text-muted hover:text-white'}"
								>
									<i class="fa-solid {section.icon} w-4 text-center text-xs"></i>
									<span>{tx(section.labelKey)}</span>
								</a>
							</li>
						{/each}

						<li class="mt-2">
							<p
								class="mb-1 px-3 text-[10px] font-bold tracking-widest text-text-muted/60 uppercase"
							>
								{tx('docs.sidebar.endpointsHeading')}
							</p>
							{#each sidebarEndpoints as ep, i (ep.id)}
								{#if i === 0 || sidebarEndpoints[i - 1].group !== ep.group}
									<p
										class="mt-2 mb-0.5 px-3 text-[9px] font-bold tracking-widest text-text-muted/50 uppercase"
									>
										{tx('docs.sidebar.group.' + ep.group)}
									</p>
								{/if}
								<!-- eslint-disable svelte/no-navigation-without-resolve -->
								<a
									href={resolve('/docs/endpoints') + '#' + ep.id}
									class="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors duration-200
										{openEndpointIds.has(ep.id) ? 'font-semibold text-brand-blue' : 'text-text-muted hover:text-white'}"
								>
									<span class="truncate">{ep.label}</span>
								</a>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							{/each}
						</li>
					</ul>
				</nav>
			</aside>

			<!-- Main content area — this scrolls while sidebar stays fixed -->
			<main class="min-w-0 flex-1 pb-20">
				{@render children()}
			</main>
		</div>
	{/if}
</div>
