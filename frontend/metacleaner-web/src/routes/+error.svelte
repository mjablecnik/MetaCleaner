<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages';
	import GradientText from '$lib/components/elements/GradientText.svelte';
	import CtaButton from '$lib/components/elements/CtaButton.svelte';
	import OrbitVisual from './error/sections/OrbitVisual.svelte';
	import TerminalCard from './error/sections/TerminalCard.svelte';
	import ActionButtons from './error/sections/ActionButtons.svelte';
	import QuickLinksGrid from './error/sections/QuickLinksGrid.svelte';

	const is404 = $derived($page.status === 404);
	const currentPath = $derived($page.url.pathname);
</script>

<svelte:head>
	<title>{is404 ? m.error_404_title() : m.error_generic_title()}</title>
</svelte:head>

<main class="w-full max-w-site mx-auto px-6 py-12 md:py-20">
	{#if is404}
		<!--
			Mobile order (flex-col): badge → visual → text/heading → buttons → links
			Desktop order (grid 2-col): left col [badge, text, buttons, links], right col [visual]
		-->
		<div class="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
			<!-- 1. Error badge — mobile: first; desktop: col 1, row 1 -->
			<div class="flex items-center gap-2 lg:col-start-1 lg:row-start-1">
				<span class="status-dot"></span>
				<span class="text-sm text-text-muted">{m.error_404_badge()}</span>
			</div>

			<!-- 2. Visual — mobile: second; desktop: col 2, rows 1–4 -->
			<div
				class="flex flex-col items-center gap-8 lg:col-start-2 lg:row-start-1 lg:row-end-5 lg:justify-center"
			>
				<OrbitVisual />
				<TerminalCard {currentPath} />
			</div>

			<!-- 3. 404 number + heading + description — mobile: third; desktop: col 1, row 2 -->
			<div class="flex flex-col gap-4 lg:col-start-1 lg:row-start-2">
				<p class="text-[5.5rem] md:text-[7rem] font-black leading-none four-zero-four">404</p>
				<h1 class="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white">
					{m.error_404_page_heading()}
				</h1>
				<p class="text-text-muted text-sm md:text-base leading-relaxed max-w-lg">
					{m.error_404_description()}
				</p>
			</div>

			<!-- 4. Action buttons — mobile: fourth; desktop: col 1, row 3 -->
			<div class="lg:col-start-1 lg:row-start-3">
				<ActionButtons />
			</div>

			<!-- 5. Quick links — mobile: fifth; desktop: col 1, row 4 -->
			<div class="lg:col-start-1 lg:row-start-4">
				<QuickLinksGrid />
			</div>
		</div>
	{:else}
		<!-- Non-404 fallback: status code, generic heading, home button -->
		<div class="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
			<p class="text-9xl font-black leading-none">
				<GradientText>{$page.status}</GradientText>
			</p>
			<h1 class="text-2xl font-semibold text-white">{m.error_generic_heading()}</h1>
			<CtaButton href="/" label={m.error_generic_back_home()} variant="primary" icon="fa-solid fa-house" />
		</div>
	{/if}
</main>

<style>
	@keyframes pulse-status {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(0.7);
		}
	}

	.status-dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #ef4444;
		box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
		animation: pulse-status 1.5s ease-in-out infinite;
		flex-shrink: 0;
	}

	.four-zero-four {
		background: linear-gradient(to bottom, #ffffff 0%, #9ca3af 60%, #3b82f6 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	@media (prefers-reduced-motion: reduce) {
		.status-dot {
			animation-duration: 0ms !important;
		}
	}
</style>
