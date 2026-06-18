<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SiteNavbar from '$lib/components/shared/SiteNavbar.svelte';
	import MobileNavbar from '$lib/components/shared/MobileNavbar.svelte';
	import MobileMenu from '$lib/components/shared/MobileMenu.svelte';
	import FeaturesHeaderSection from './sections/FeaturesHeaderSection.svelte';
	import FeaturesShowcaseSection from './sections/FeaturesShowcaseSection.svelte';
	import FeaturesCtaSection from './sections/FeaturesCtaSection.svelte';
	import FeaturesFooter from './sections/FeaturesFooter.svelte';

	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<svelte:head>
	<title>{m.meta_features_title()}</title>
</svelte:head>

<div class="flex flex-col items-center w-full">
	<SiteNavbar active="features" />
	<MobileNavbar open={mobileMenuOpen} onToggle={toggleMobileMenu} />
	<MobileMenu
		variant="dropdown"
		active="features"
		open={mobileMenuOpen}
		onClose={closeMobileMenu}
	/>
	<FeaturesHeaderSection />
	<FeaturesShowcaseSection />
	<FeaturesCtaSection />
	<FeaturesFooter />
</div>
