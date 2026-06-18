<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import FeaturesHeaderSection from './sections/FeaturesHeaderSection.svelte';
	import FeaturesShowcaseSection from './sections/FeaturesShowcaseSection.svelte';
	import FeaturesCtaSection from './sections/FeaturesCtaSection.svelte';
</script>

<svelte:head>
	<title>{m.meta_features_title()}</title>
</svelte:head>

<FeaturesHeaderSection />
<FeaturesShowcaseSection />
<FeaturesCtaSection />
