<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SectionHeading from '$lib/components/elements/SectionHeading.svelte';
	import AudienceCard from '../components/AudienceCard.svelte';
	import { getAudience } from '$lib/repositories';

	const audience = getAudience();
</script>

<section id="who-its-for" class="w-full max-w-site mx-auto px-6 pb-8 md:pb-16">
	<SectionHeading
		eyebrow={m.home_audience_eyebrow()}
		eyebrowColor="brand-blue"
		title={m.home_audience_title()}
		subtitle={m.home_audience_subtitle()}
	/>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
		{#each audience as item, i (i)}
			<AudienceCard audience={item} />
		{/each}
	</div>
</section>
