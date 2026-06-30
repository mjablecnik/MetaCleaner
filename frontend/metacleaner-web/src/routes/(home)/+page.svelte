<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SeoHead from '$lib/components/shared/SeoHead.svelte';
	import JsonLd from '$lib/components/shared/JsonLd.svelte';
	import HeroSection from './sections/HeroSection.svelte';
	import WhyItMattersSection from './sections/WhyItMattersSection.svelte';
	import HowItWorksSection from './sections/HowItWorksSection.svelte';
	import AudienceSection from './sections/AudienceSection.svelte';
	import FaqSection from './sections/FaqSection.svelte';

	const faqJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: m.home_faq_1_question(),
				acceptedAnswer: { '@type': 'Answer', text: m.home_faq_1_answer() }
			},
			{
				'@type': 'Question',
				name: m.home_faq_2_question(),
				acceptedAnswer: { '@type': 'Answer', text: m.home_faq_2_answer() }
			},
			{
				'@type': 'Question',
				name: m.home_faq_3_question(),
				acceptedAnswer: { '@type': 'Answer', text: m.home_faq_3_answer() }
			},
			{
				'@type': 'Question',
				name: m.home_faq_4_question(),
				acceptedAnswer: { '@type': 'Answer', text: m.home_faq_4_answer() }
			},
			{
				'@type': 'Question',
				name: m.home_faq_5_question(),
				acceptedAnswer: { '@type': 'Answer', text: m.home_faq_5_answer() }
			},
			{
				'@type': 'Question',
				name: m.home_faq_6_question(),
				acceptedAnswer: { '@type': 'Answer', text: m.home_faq_6_answer() }
			},
			{
				'@type': 'Question',
				name: m.home_faq_8_question(),
				acceptedAnswer: { '@type': 'Answer', text: m.home_faq_8_answer() }
			}
		]
	};
</script>

<SeoHead title={m.meta_home_title()} description={m.meta_home_description()} path="" />
<JsonLd data={faqJsonLd} />

<HeroSection />
<WhyItMattersSection />
<HowItWorksSection />
<AudienceSection />
<FaqSection />
