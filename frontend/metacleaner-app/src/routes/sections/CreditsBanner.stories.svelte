<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CreditsBanner from './CreditsBanner.svelte';

	const { Story } = defineMeta({
		title: 'Sections/CreditsBanner',
		component: CreditsBanner,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Free with low credits">
	<CreditsBanner
		credits={1}
		subscriptionCredits={1}
		monthlyAllowance={3}
		planId="free"
		planStatus="free"
		isPaidPlan={false}
	/>
</Story>

<Story name="Pro (no CTA)">
	<CreditsBanner
		credits={85}
		subscriptionCredits={85}
		monthlyAllowance={100}
		planId="pro"
		planStatus="active"
		isPaidPlan={true}
	/>
</Story>

<Story name="Zero Credits">
	<CreditsBanner
		credits={0}
		subscriptionCredits={0}
		monthlyAllowance={3}
		planId="free"
		planStatus="free"
		isPaidPlan={false}
	/>
</Story>

<Story name="Full Credits">
	<CreditsBanner
		credits={3}
		subscriptionCredits={3}
		monthlyAllowance={3}
		planId="free"
		planStatus="free"
		isPaidPlan={false}
	/>
</Story>
