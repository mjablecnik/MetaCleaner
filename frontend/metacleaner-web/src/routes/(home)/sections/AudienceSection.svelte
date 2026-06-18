<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SectionHeading from '$lib/components/elements/SectionHeading.svelte';
	import AudienceCard from '../components/AudienceCard.svelte';
	import { getAudience } from '$lib/repositories';

	const audienceFull = getAudience('full');
	const audienceCompact = getAudience('compact');
</script>

<!-- Desktop Who Is It For -->
<section id="who-its-for" class="hidden md:block w-full max-w-site mx-auto px-6 pb-16">
	<SectionHeading
		eyebrow={m.home_audience_eyebrow()}
		eyebrowColor="brand-blue"
		title={m.home_audience_title()}
		subtitle={m.home_audience_subtitle()}
	/>
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each audienceFull as audience}
			<AudienceCard {audience} />
		{/each}
	</div>
</section>

<!-- Mobile Who Is It For -->
<section id="who-its-for-mobile" class="md:hidden w-full max-w-md mx-auto px-4">
	<SectionHeading
		eyebrow={m.home_audience_eyebrow()}
		eyebrowColor="brand-orange"
		title={m.home_audience_title_mobile()}
		subtitle={m.home_audience_subtitle_mobile()}
		size="sm"
	/>
	<div class="flex flex-col gap-3">
		{#each audienceCompact as audience}
			<AudienceCard {audience} compact />
		{/each}
	</div>
</section>
