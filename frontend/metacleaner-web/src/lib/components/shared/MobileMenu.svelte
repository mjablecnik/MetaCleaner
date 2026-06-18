<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import BrandLogo from '$lib/components/elements/BrandLogo.svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

	interface Props {
		variant: 'drawer' | 'dropdown';
		active?: 'home' | 'features' | 'pricing' | 'faq';
		open: boolean;
		onClose: () => void;
	}

	const { variant, active = 'home', open, onClose }: Props = $props();
</script>

{#if variant === 'drawer'}
	{#if open}
		<div
			class="menu-overlay open fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
			onclick={onClose}
			role="button"
			tabindex="-1"
			onkeydown={(e) => e.key === 'Escape' && onClose()}
		></div>
	{/if}

	<div
		class="slide-menu {open
			? 'open'
			: ''} fixed top-0 right-0 h-full w-full z-40 bg-navy-card border-l border-border flex flex-col shadow-2xl md:hidden"
	>
		<div class="flex items-center justify-between px-5 py-5 border-b border-border">
			<BrandLogo size="md" href="/" />
			<button
				onclick={onClose}
				class="w-9 h-9 flex items-center justify-center rounded-lg bg-navy-lighter border border-border-strong text-white"
			>
				<i class="fa-solid fa-xmark text-sm"></i>
			</button>
		</div>

		<div class="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">
			<p class="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 mb-2">
				{m.nav_navigation()}
			</p>
			<a
				href="#how-it-works"
				onclick={onClose}
				class="flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-navy-lighter hover:text-white transition-all group"
			>
				<div
					class="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-sm group-hover:bg-brand-blue/20 transition-colors"
				>
					<i class="fa-solid fa-circle-play"></i>
				</div>
				<span class="text-sm font-medium">{m.nav_how_it_works()}</span>
				<i class="fa-solid fa-chevron-right text-[10px] ml-auto opacity-40"></i>
			</a>
			<a
				href="#why-it-matters"
				onclick={onClose}
				class="flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-navy-lighter hover:text-white transition-all group"
			>
				<div
					class="w-9 h-9 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange text-sm group-hover:bg-brand-orange/20 transition-colors"
				>
					<i class="fa-solid fa-shield-halved"></i>
				</div>
				<span class="text-sm font-medium">{m.nav_why_it_matters()}</span>
				<i class="fa-solid fa-chevron-right text-[10px] ml-auto opacity-40"></i>
			</a>
			<a
				href="#who-its-for"
				onclick={onClose}
				class="flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-navy-lighter hover:text-white transition-all group"
			>
				<div
					class="w-9 h-9 rounded-lg bg-brand-green/10 flex items-center justify-center text-brand-green text-sm group-hover:bg-brand-green/20 transition-colors"
				>
					<i class="fa-solid fa-users"></i>
				</div>
				<span class="text-sm font-medium">{m.nav_for_who()}</span>
				<i class="fa-solid fa-chevron-right text-[10px] ml-auto opacity-40"></i>
			</a>
			<a
				href="#faq"
				onclick={onClose}
				class="flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-navy-lighter hover:text-white transition-all group"
			>
				<div
					class="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-sm group-hover:bg-brand-blue/20 transition-colors"
				>
					<i class="fa-solid fa-circle-question"></i>
				</div>
				<span class="text-sm font-medium">{m.nav_faq()}</span>
				<i class="fa-solid fa-chevron-right text-[10px] ml-auto opacity-40"></i>
			</a>
			<div class="border-t border-border my-3"></div>
			<LanguageSwitcher variant="mobile" />
			<div class="border-t border-border my-3"></div>
		</div>

		<div class="px-4 pb-4">
			<div class="flex gap-2 mt-3">
				<a
					href="#"
					class="flex-1 py-3 rounded-xl bg-navy-lighter border border-border-strong text-white font-semibold text-xs flex items-center justify-center gap-1.5"
				>
					<i class="fa-solid fa-right-to-bracket text-text-muted"></i>
					{m.nav_login()}
				</a>
				<a
					href="#"
					class="flex-1 py-3 rounded-xl bg-brand-blue text-white font-semibold text-xs flex items-center justify-center gap-1.5"
				>
					<i class="fa-solid fa-user-plus"></i>
					{m.nav_register()}
				</a>
			</div>
		</div>
	</div>
{:else}
	<div
		class="mobile-menu {open
			? 'open'
			: ''} md:hidden w-full flex-col bg-navy-card border-b border-border px-4 py-4 gap-3 z-40"
	>
		<a
			href="/#how-it-works"
			onclick={onClose}
			class="text-sm font-medium text-text-muted py-3 border-b border-border flex items-center justify-between"
		>
			{m.nav_how_it_works()} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/features"
			onclick={onClose}
			class="text-sm font-medium {active === 'features'
				? 'text-white'
				: 'text-text-muted'} py-3 border-b border-border flex items-center justify-between"
		>
			{m.nav_features()} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/pricing"
			onclick={onClose}
			class="text-sm font-medium {active === 'pricing'
				? 'text-white'
				: 'text-text-muted'} py-3 border-b border-border flex items-center justify-between"
		>
			{m.nav_pricing()} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<a
			href="/#faq"
			onclick={onClose}
			class="text-sm font-medium {active === 'faq'
				? 'text-white'
				: 'text-text-muted'} py-3 border-b border-border flex items-center justify-between"
		>
			{m.nav_faq()} <i class="fa-solid fa-chevron-right text-xs"></i>
		</a>
		<div class="border-t border-border my-1"></div>
		<LanguageSwitcher variant="mobile" />
		<div class="border-t border-border my-1"></div>
		<a
			href="#"
			class="w-full mt-2 py-3 rounded-xl bg-brand-blue text-white text-sm font-semibold text-center block"
		>
			{m.nav_login()}
		</a>
	</div>
{/if}
