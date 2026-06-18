<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SectionHeading from '$lib/components/elements/SectionHeading.svelte';
	import FaqAccordionItem from '../components/FaqAccordionItem.svelte';
	import { getFaq } from '$lib/repositories';
	import { t } from '$lib/i18n';

	const faqDesktop = getFaq('desktop');
	const faqMobile = getFaq('mobile');
</script>

<!-- Desktop FAQ -->
<section id="faq" class="hidden md:block w-full max-w-site mx-auto px-6 pb-16">
	<SectionHeading
		eyebrow={m.home_faq_eyebrow()}
		eyebrowColor="brand-green"
		title={m.home_faq_title()}
		subtitle={m.home_faq_subtitle()}
	/>
	<div class="max-w-3xl mx-auto flex flex-col gap-3">
		{#each faqDesktop as item (item.id)}
			<FaqAccordionItem question={t(item.questionKey)} answer={t(item.answerKey)} />
		{/each}
	</div>
</section>

<!-- Mobile FAQ -->
<section id="faq-mobile" class="md:hidden w-full">
	<SectionHeading
		eyebrow={m.home_faq_eyebrow_mobile()}
		eyebrowColor="brand-blue"
		title={m.home_faq_title_mobile()}
		subtitle={m.home_faq_subtitle_mobile()}
		size="sm"
	/>
	<div class="flex flex-col gap-2">
		{#each faqMobile as item (item.id)}
			<FaqAccordionItem question={t(item.questionKey)} answer={t(item.answerKey)} size="mobile" />
		{/each}
	</div>
</section>
