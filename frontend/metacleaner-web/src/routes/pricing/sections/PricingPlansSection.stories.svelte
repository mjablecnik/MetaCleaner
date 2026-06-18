<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { pricingRepository, getEnterprise } from '$lib/repositories';
	import PricingPlansSection from './PricingPlansSection.svelte';

	const { Story } = defineMeta({
		title: 'Pricing/Sections/PricingPlansSection',
		component: PricingPlansSection,
		tags: ['autodocs'],
		args: {
			plans: pricingRepository(),
			enterprise: getEnterprise()
		}
	});
</script>

<Story name="Monthly" args={{ isYearly: false }} />

<Story name="Yearly" args={{ isYearly: true }} />
