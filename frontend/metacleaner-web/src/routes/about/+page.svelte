<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SeoHead from '$lib/components/shared/SeoHead.svelte';
	import HeroSection from './sections/HeroSection.svelte';
	import StorySection from './sections/StorySection.svelte';
	import ValuesSection from './sections/ValuesSection.svelte';
	import ContactSection from './sections/ContactSection.svelte';
</script>

<SeoHead title={m.meta_about_title()} description={m.meta_about_description()} path="/about" />

<HeroSection />
<StorySection />
<ValuesSection />
<ContactSection />
