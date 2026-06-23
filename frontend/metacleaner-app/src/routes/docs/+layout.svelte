<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import MethodBadge from '$lib/shared/elements/MethodBadge.svelte';
	import {
		getDocsConfig,
		getSidebarSections,
		getSidebarEndpoints
	} from '$lib/repositories/docsRepository';

	let { children } = $props();

	const config = getDocsConfig();
	const sidebarSections = getSidebarSections();
	const sidebarEndpoints = getSidebarEndpoints();

	const sectionRouteMap: Record<string, string> = {
		'sec-intro': '/docs',
		'sec-auth': '/docs/auth',
		'sec-errors': '/docs/errors'
	};

	const activeId = $derived.by(() => {
		const path = page.url.pathname;
		if (path === '/docs/auth') return 'sec-auth';
		if (path === '/docs/errors') return 'sec-errors';
		if (path === '/docs/endpoints') return 'ep-endpoints';
		return 'sec-intro';
	});

	const mobileNavItems = $derived([
		...sidebarSections.map((s) => ({
			id: s.id,
			icon: s.icon,
			labelKey: s.labelKey,
			href: sectionRouteMap[s.id] ?? '/docs'
		})),
		{
			id: 'ep-endpoints',
			icon: 'fa-code',
			labelKey: 'docs.sidebar.endpointsHeading',
			href: '/docs/endpoints'
		}
	]);
</script>

<div class="mx-auto w-full max-w-[1200px] px-4 lg:px-6">
	<!-- Page header: API badge + version -->
	<div class="flex items-center gap-3 py-4 lg:py-6">
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

	<!-- Mobile navigation tabs (visible only on mobile/tablet) -->
	<div class="mb-4 flex gap-1 overflow-x-auto lg:hidden">
		{#each mobileNavItems as item (item.id)}
			<a
				href={resolve(item.href)}
				class="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200
					{activeId === item.id ? 'border border-brand-blue/30 bg-brand-blue/10 text-brand-blue' : 'border border-transparent text-text-muted hover:text-white'}"
			>
				<i class="fa-solid {item.icon} text-[10px]"></i>
				<span>{tx(item.labelKey)}</span>
			</a>
		{/each}
	</div>

	<!-- Desktop layout: sticky sidebar + scrollable content -->
	<div class="flex items-start gap-8">
		<!-- Sidebar (desktop only) — sticky so it stays visible during scroll -->
		<aside class="hidden lg:block">
			<nav class="sticky top-[88px] w-56 shrink-0">
				<ul class="flex flex-col gap-0.5">
					{#each sidebarSections as section (section.id)}
						<li>
							<a
								href={resolve(sectionRouteMap[section.id] ?? '/docs')}
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
						<a
							href={resolve('/docs/endpoints')}
							class="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors duration-200
								{activeId === 'ep-endpoints' ? 'font-semibold text-brand-blue' : 'text-text-muted hover:text-white'}"
						>
							<i class="fa-solid fa-code w-4 text-center text-xs"></i>
							<span>{tx('docs.sidebar.allEndpoints')}</span>
						</a>
						{#each sidebarEndpoints as ep (ep.id)}
							<a
								href={resolve('/docs/endpoints')}
								class="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors duration-200
									{activeId === 'ep-endpoints' ? 'text-text-muted/80' : 'text-text-muted hover:text-white'}"
							>
								<MethodBadge method={ep.method} size="sm" />
								<span class="truncate">{ep.label}</span>
							</a>
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
</div>
