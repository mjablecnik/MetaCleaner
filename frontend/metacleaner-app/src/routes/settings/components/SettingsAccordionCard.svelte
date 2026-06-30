<script lang="ts">
	import type { Snippet } from 'svelte';

	type ColorVariant = 'blue' | 'green' | 'orange';

	interface Props {
		icon: string;
		colorVariant?: ColorVariant;
		title: string;
		subtitle: string;
		badge?: string;
		defaultOpen?: boolean;
		animationDelay?: string;
		disabled?: boolean;
		headerExtra?: Snippet;
		headerExtraMobile?: Snippet;
		children: Snippet;
	}

	let {
		icon,
		colorVariant = 'blue',
		title,
		subtitle,
		badge,
		defaultOpen = false,
		animationDelay,
		disabled = false,
		headerExtra,
		headerExtraMobile,
		children
	}: Props = $props();

	let isOpen = $state(defaultOpen);

	const iconContainerClass: Record<ColorVariant, string> = {
		blue: 'border-brand-blue/20 bg-brand-blue/10',
		green: 'border-brand-green/20 bg-brand-green/10',
		orange: 'border-brand-orange/20 bg-brand-orange/10'
	};

	const iconClass: Record<ColorVariant, string> = {
		blue: 'text-brand-blue',
		green: 'text-brand-green',
		orange: 'text-brand-orange'
	};

	const badgeClass: Record<ColorVariant, string> = {
		blue: 'border-brand-blue/30 bg-brand-blue/10 text-brand-blue',
		green: 'border-brand-green/30 bg-brand-green/10 text-brand-green',
		orange: 'border-brand-orange/30 bg-brand-orange/10 text-brand-orange'
	};
</script>

<div
	class="fade-in-up overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card {animationDelay ??
		''} {disabled ? 'pointer-events-none opacity-50' : ''}"
>
	<!-- Header: clickable on mobile, static on desktop -->
	<button
		type="button"
		class="acc-header w-full px-5 py-4 text-left lg:px-6"
		onclick={() => (isOpen = !isOpen)}
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border {iconContainerClass[
					colorVariant
				]}"
			>
				<i class="{icon} text-sm {iconClass[colorVariant]}"></i>
			</div>
			<div class="flex-1">
				<h3 class="text-sm font-semibold text-white lg:text-base">{title}</h3>
				<p class="text-[11px] text-text-muted">{subtitle}</p>
			</div>
			{#if badge}
				<span
					class="mr-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase lg:mr-0 {badgeClass[
						colorVariant
					]}">{badge}</span
				>
			{:else if headerExtra}
				<div class="pointer-events-auto mr-1 hidden items-center gap-1.5 lg:mr-0 lg:flex">
					{@render headerExtra()}
				</div>
				{#if headerExtraMobile}
					<div class="pointer-events-auto mr-1 flex items-center gap-1 lg:hidden">
						{@render headerExtraMobile()}
					</div>
				{/if}
			{/if}
			<i
				class="acc-chevron fa-solid fa-chevron-down text-xs text-text-muted transition-transform duration-200"
				class:rotate-180={isOpen}
			></i>
		</div>
	</button>

	<!-- Content: hidden on mobile unless open, always visible on desktop -->
	<div
		class="acc-content gap-4 border-t border-gray-800 px-5 pt-4 pb-5 lg:px-6 lg:py-5"
		class:open={isOpen}
	>
		{#if children}{@render children()}{/if}
	</div>
</div>

<style>
	.acc-content {
		display: none;
		flex-direction: column;
	}

	.acc-content.open {
		display: flex;
	}

	@media (min-width: 1024px) {
		.acc-content {
			display: flex !important;
		}

		.acc-chevron {
			display: none;
		}

		.acc-header {
			cursor: default;
			pointer-events: none;
		}
	}
</style>
