<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SectionHeading from '$lib/components/elements/SectionHeading.svelte';
	import StepCard from '../components/StepCard.svelte';
	import { stepsRepository } from '$lib/repositories';

	const steps = stepsRepository();
</script>

<!-- Desktop How It Works -->
<section id="how-it-works" class="hidden md:block w-full max-w-site mx-auto px-6 pb-16">
	<SectionHeading
		eyebrow={m.home_steps_eyebrow()}
		eyebrowColor="brand-blue"
		title={m.home_steps_title()}
		subtitle={m.home_steps_subtitle()}
	/>
	<div class="grid grid-cols-3 gap-6">
		{#each steps as step, i (i)}
			<StepCard {step} size="desktop" />
		{/each}
	</div>
</section>

<!-- Mobile How It Works -->
<section id="how-it-works-mobile" class="md:hidden w-full max-w-md mx-auto px-4">
	<SectionHeading
		eyebrow={m.home_steps_eyebrow()}
		eyebrowColor="brand-blue"
		title={m.home_steps_title()}
		subtitle={m.home_steps_subtitle()}
		size="sm"
	/>
	<div class="flex flex-col gap-3">
		{#each steps as step, i (i)}
			<StepCard {step} size="mobile" />
		{/each}
	</div>
</section>
