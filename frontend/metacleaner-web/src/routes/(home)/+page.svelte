<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import HeroSection from './sections/HeroSection.svelte';
	import WhyItMattersSection from './sections/WhyItMattersSection.svelte';
	import HowItWorksSection from './sections/HowItWorksSection.svelte';
	import AudienceSection from './sections/AudienceSection.svelte';
	import FaqSection from './sections/FaqSection.svelte';
	import HomeFooter from './sections/HomeFooter.svelte';
</script>

<svelte:head>
	<title>{m.meta_home_title()}</title>
</svelte:head>

<HeroSection />
<WhyItMattersSection />
<HowItWorksSection />
<AudienceSection />
<FaqSection />
<HomeFooter />
