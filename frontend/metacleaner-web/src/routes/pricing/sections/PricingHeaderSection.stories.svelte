<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PricingHeaderSection from './PricingHeaderSection.svelte';

	const { Story } = defineMeta({
		title: 'Pricing/Sections/PricingHeaderSection',
		component: PricingHeaderSection,
		tags: ['autodocs']
	});
</script>

<Story
	name="Monthly"
	args={{
		value: 'monthly',
		onChange: () => {}
	}}
/>

<Story
	name="Yearly"
	args={{
		value: 'yearly',
		onChange: () => {}
	}}
/>
