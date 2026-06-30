<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SeoHead from '$lib/components/shared/SeoHead.svelte';
	import FeaturesHeaderSection from './sections/FeaturesHeaderSection.svelte';
	import FeaturesShowcaseSection from './sections/FeaturesShowcaseSection.svelte';
	import FeaturesCtaSection from './sections/FeaturesCtaSection.svelte';
</script>

<SeoHead title={m.meta_features_title()} description={m.meta_features_description()} path="/features" />

<FeaturesHeaderSection />
<FeaturesShowcaseSection />
<FeaturesCtaSection />
