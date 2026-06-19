<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import BrandLogo from '$lib/components/elements/BrandLogo.svelte';
	import NavLink from '$lib/components/elements/NavLink.svelte';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

	interface Props {
		active?: 'home' | 'features' | 'pricing' | 'faq';
	}

	const { active = 'home' }: Props = $props();
</script>

<nav
	class="hidden md:flex w-full max-w-site mx-auto px-6 py-6 justify-between items-center z-50 sticky top-0 bg-navy-main"
>
	<BrandLogo size="lg" href="/" />
	<div class="flex items-center gap-8">
		<NavLink href="/#how-it-works" label={m.nav_how_it_works()} />
		<NavLink href="/features" label={m.nav_features()} active={active === 'features'} />
		<NavLink href="/pricing" label={m.nav_pricing()} active={active === 'pricing'} />
		<NavLink href="/#faq" label={m.nav_faq()} />
	</div>
	<div class="flex items-center gap-3">
		<LanguageSwitcher variant="desktop" />
		<a
			href="#"
			class="px-5 py-2.5 rounded-lg text-sm font-semibold text-text-main hover:bg-navy-lighter transition-colors"
		>
			{m.nav_login()}
		</a>
	</div>
</nav>
