<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PricingFooter from './PricingFooter.svelte';

	const { Story } = defineMeta({
		title: 'Pricing/Sections/PricingFooter',
		component: PricingFooter,
		tags: ['autodocs']
	});
</script>

<Story name="Default" />
