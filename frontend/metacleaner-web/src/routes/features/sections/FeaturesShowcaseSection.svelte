<script lang="ts">
	import { featuresRepository } from '$lib/repositories';
	import FeatureRow from '../components/FeatureRow.svelte';

	const features = featuresRepository();
</script>

<div class="w-full max-w-site mx-auto px-4 md:px-6 pb-12 md:pb-24 flex flex-col gap-12 md:gap-16">
	{#each features as feature, i (i)}
		<FeatureRow {feature} />
	{/each}
</div>
