<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { onMount } from 'svelte';
	import {
		getDocsConfig,
		getSidebarSections,
		getSidebarEndpoints
	} from '$lib/repositories/docsRepository';
	import DocsSidebar from './components/DocsSidebar.svelte';

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
			<DocsSidebar
				sections={sidebarSections}
				endpoints={sidebarEndpoints}
				{activeId}
				onNavigate={scrollToSection}
			/>
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
