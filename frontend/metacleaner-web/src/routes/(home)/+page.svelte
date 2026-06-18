<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SiteNavbar from '$lib/components/shared/SiteNavbar.svelte';
	import MobileNavbar from '$lib/components/shared/MobileNavbar.svelte';
	import MobileMenu from '$lib/components/shared/MobileMenu.svelte';
	import HeroSection from './sections/HeroSection.svelte';
	import WhyItMattersSection from './sections/WhyItMattersSection.svelte';
	import HowItWorksSection from './sections/HowItWorksSection.svelte';
	import AudienceSection from './sections/AudienceSection.svelte';
	import FaqSection from './sections/FaqSection.svelte';
	import HomeFooter from './sections/HomeFooter.svelte';

	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<svelte:head>
	<title>{m.meta_home_title()}</title>
</svelte:head>

<MobileMenu variant="drawer" active="home" open={mobileMenuOpen} onClose={closeMobileMenu} />

<div class="flex flex-col items-center w-full">
	<SiteNavbar active="home" />
	<MobileNavbar open={mobileMenuOpen} onToggle={toggleMobileMenu} />
	<HeroSection />
	<WhyItMattersSection />
	<HowItWorksSection />
	<AudienceSection />
	<FaqSection />
	<HomeFooter />
</div>
