<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import HeroSection from './sections/HeroSection.svelte';
	import StorySection from './sections/StorySection.svelte';
	import ValuesSection from './sections/ValuesSection.svelte';
	import ContactSection from './sections/ContactSection.svelte';
</script>

<svelte:head>
	<title>{m.meta_about_title()}</title>
	<meta name="description" content={m.meta_about_description()} />
</svelte:head>

<HeroSection />
<StorySection />
<ValuesSection />
<ContactSection />
