<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SectionHeading from '$lib/components/elements/SectionHeading.svelte';
	import StepCard from '../components/StepCard.svelte';
	import { stepsRepository } from '$lib/repositories';

	const steps = stepsRepository();
</script>

<section id="how-it-works" class="w-full max-w-site mx-auto px-6 pb-8 md:pb-16">
	<SectionHeading
		eyebrow={m.home_steps_eyebrow()}
		eyebrowColor="brand-blue"
		title={m.home_steps_title()}
		subtitle={m.home_steps_subtitle()}
	/>
	<div class="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-6">
		{#each steps as step, i (i)}
			<StepCard {step} />
		{/each}
	</div>
</section>
