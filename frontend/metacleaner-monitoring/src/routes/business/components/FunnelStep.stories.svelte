<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FunnelStep from './FunnelStep.svelte';

	const { Story } = defineMeta({
		title: 'Business/FunnelStep',
		component: FunnelStep,
		tags: ['autodocs']
	});
</script>

<Story
	name="First Step (no conversion)"
	args={{
		labelKey: 'business_funnel_visitors',
		value: 84210,
		color: '#3b82f6'
	}}
/>

<Story
	name="Mid Step (with conversion)"
	args={{
		labelKey: 'business_funnel_registrations',
		value: 12318,
		conversionPercent: '14.6%',
		color: '#8b5cf6'
	}}
/>

<Story
	name="High Conversion Step"
	args={{
		labelKey: 'business_funnel_activePaying',
		value: 1840,
		conversionPercent: '87.5%',
		color: '#f97316'
	}}
/>
