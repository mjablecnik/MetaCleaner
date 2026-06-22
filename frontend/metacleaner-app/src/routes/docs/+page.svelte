<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { onMount } from 'svelte';
	import {
		getDocsConfig,
		getSidebarSections,
		getSidebarEndpoints
	} from '$lib/repositories/docsRepository';

	const config = getDocsConfig();
	const sidebarSections = getSidebarSections();
	const sidebarEndpoints = getSidebarEndpoints();

	let activeId = $state('sec-intro');
	let observer: IntersectionObserver | null = null;

	onMount(() => {
		const sections = document.querySelectorAll('[data-section-id]');
		observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible.length > 0) {
					activeId = visible[0].target.getAttribute('data-section-id') ?? activeId;
				}
			},
			{ rootMargin: '-80px 0px -60% 0px', threshold: 0 }
		);
		sections.forEach((s) => observer!.observe(s));
		return () => observer?.disconnect();
	});

	function scrollToSection(id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		const navbarHeight = 80;
		const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;
		window.scrollTo({ top, behavior: 'smooth' });
		activeId = id;
	}
</script>

<svelte:head>
	<title>{tx('docs.meta.title')}</title>
</svelte:head>

<div class="mx-auto w-full max-w-[1200px] px-4 pb-20 lg:px-6">
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

	<div class="flex gap-8">
		<!-- Sidebar (desktop only) -->
		<aside class="hidden lg:block">
			<nav class="sticky top-[88px] w-56 flex-shrink-0">
				<ul class="flex flex-col gap-0.5">
					{#each sidebarSections as section (section.id)}
						<li>
							<button
								onclick={() => scrollToSection(section.id)}
								class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-200
									{activeId === section.id ? 'font-semibold text-brand-blue' : 'text-text-muted hover:text-white'}"
							>
								<i class="fa-solid {section.icon} w-4 text-center text-xs"></i>
								<span>{tx(section.labelKey)}</span>
							</button>
						</li>
					{/each}

					<li class="mt-2">
						<p class="mb-1 px-3 text-[10px] font-bold tracking-widest text-text-muted/60 uppercase">
							{tx('docs.sidebar.endpointsHeading')}
						</p>
						{#each sidebarEndpoints as ep (ep.id)}
							<button
								onclick={() => scrollToSection(ep.id)}
								class="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors duration-200
									{activeId === ep.id ? 'font-semibold text-brand-blue' : 'text-text-muted hover:text-white'}"
							>
								<span
									class="w-8 text-center text-[10px] font-bold
										{ep.method === 'POST'
										? 'text-brand-blue'
										: ep.method === 'GET'
											? 'text-brand-green'
											: 'text-brand-red'}"
								>
									{ep.method === 'DEL' ? 'DEL' : ep.method}
								</span>
								<span class="truncate">{ep.label}</span>
							</button>
						{/each}
					</li>
				</ul>
			</nav>
		</aside>

		<!-- Main content area -->
		<main class="min-w-0 flex-1">
			<!-- Placeholder content: sections will be added in tasks 9.1–9.4 -->
			<div class="rounded-xl border border-gray-800 bg-navy-card p-8 text-center text-text-muted">
				<i class="fa-solid fa-book mb-3 text-3xl text-brand-blue/40"></i>
				<p class="text-sm">Documentation sections loading…</p>
			</div>
		</main>
	</div>
</div>
