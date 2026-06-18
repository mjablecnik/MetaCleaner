<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SectionHeading from '$lib/components/elements/SectionHeading.svelte';
	import FaqAccordionItem from '../components/FaqAccordionItem.svelte';
	import { getFaq } from '$lib/repositories';
	import { t } from '$lib/i18n';

	const faq = getFaq();
</script>

<section id="faq" class="w-full max-w-site mx-auto px-4 md:px-6 pb-8 md:pb-16">
	<SectionHeading
		eyebrow={m.home_faq_eyebrow()}
		eyebrowColor="brand-green"
		title={m.home_faq_title()}
		subtitle={m.home_faq_subtitle()}
	/>
	<div class="max-w-3xl mx-auto flex flex-col gap-2 md:gap-3">
		{#each faq as item (item.id)}
			<FaqAccordionItem question={t(item.questionKey)} answer={t(item.answerKey)} />
		{/each}
	</div>
</section>
