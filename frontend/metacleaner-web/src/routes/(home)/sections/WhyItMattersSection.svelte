<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SectionHeading from '$lib/components/elements/SectionHeading.svelte';
	import MetadataComparisonCard from '../components/MetadataComparisonCard.svelte';
	import RiskStatCard from '../components/RiskStatCard.svelte';
	import { statsRepository, getMetadataFields, getCleanedFields } from '$lib/repositories';

	const stats = statsRepository();
	const fields = getMetadataFields();
	const cleanedFields = getCleanedFields();
</script>

<section id="why-it-matters" class="w-full max-w-site mx-auto px-6 pb-8 md:pb-12">
	<SectionHeading
		eyebrow={m.home_why_eyebrow()}
		eyebrowColor="brand-green"
		title={m.home_why_title()}
		subtitle={m.home_why_subtitle()}
	/>
	<div class="flex flex-col gap-3 mb-6 md:grid md:grid-cols-2 md:gap-6 md:mb-10">
		<MetadataComparisonCard variant="before" fields={fields} />
		<MetadataComparisonCard variant="after" fields={cleanedFields} />
	</div>
	<div class="grid grid-cols-3 gap-2 md:gap-6">
		{#each stats as stat, i (i)}
			<RiskStatCard {stat} />
		{/each}
	</div>
</section>
