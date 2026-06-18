<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SectionHeading from '$lib/components/elements/SectionHeading.svelte';
	import MetadataComparisonCard from '../components/MetadataComparisonCard.svelte';
	import RiskStatCard from '../components/RiskStatCard.svelte';
	import { statsRepository, getMetadataFields, getCleanedFields } from '$lib/repositories';

	const stats = statsRepository();
	const desktopFields = getMetadataFields('desktop');
	const desktopCleanedFields = getCleanedFields('desktop');
	const mobileFields = getMetadataFields('mobile');
	const mobileCleanedFields = getCleanedFields('mobile');
</script>

<!-- Desktop Why It Matters -->
<section id="why-it-matters" class="hidden md:block w-full max-w-site mx-auto px-6 pb-12">
	<SectionHeading
		eyebrow={m.home_why_eyebrow()}
		eyebrowColor="brand-green"
		title={m.home_why_title()}
		subtitle={m.home_why_subtitle()}
	/>
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
		<MetadataComparisonCard variant="before" fields={desktopFields} />
		<MetadataComparisonCard variant="after" fields={desktopCleanedFields} />
	</div>
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
		{#each stats as stat, i (i)}
			<RiskStatCard {stat} />
		{/each}
	</div>
</section>

<!-- Mobile Why It Matters -->
<section id="why-it-matters-mobile" class="md:hidden w-full max-w-md mx-auto px-4">
	<SectionHeading
		eyebrow={m.home_why_eyebrow()}
		eyebrowColor="brand-green"
		title={m.home_why_title()}
		subtitle={m.home_why_subtitle()}
		size="sm"
	/>
	<div class="flex flex-col gap-3 mb-6">
		<MetadataComparisonCard variant="before" fields={mobileFields} size="mobile" />
		<MetadataComparisonCard variant="after" fields={mobileCleanedFields} size="mobile" />
	</div>
	<div class="grid grid-cols-3 gap-2">
		{#each stats as stat, i (i)}
			<RiskStatCard {stat} size="mobile" />
		{/each}
	</div>
</section>
