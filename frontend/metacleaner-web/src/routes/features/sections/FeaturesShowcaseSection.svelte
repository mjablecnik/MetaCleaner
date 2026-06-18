<script lang="ts">
	import { featuresRepository } from '$lib/repositories';
	import FeatureRow from '../components/FeatureRow.svelte';
	import FeatureCard from '../components/FeatureCard.svelte';

	const features = featuresRepository();
</script>

<!-- Desktop Feature List -->
<div class="hidden md:flex w-full max-w-site mx-auto px-6 pb-24 flex-col gap-16">
	{#each features as feature}
		<FeatureRow {feature} />
	{/each}
</div>

<!-- Mobile Feature List -->
<div class="md:hidden w-full px-4 flex flex-col gap-2">
	{#each features as feature}
		<section class="w-full mb-3">
			<FeatureCard {feature} />
		</section>
	{/each}
</div>
