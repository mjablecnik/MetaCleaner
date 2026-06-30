<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import ReactivateCard from './ReactivateCard.svelte';

	const { Story } = defineMeta({
		title: 'Sections/ReactivateCard',
		component: ReactivateCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		},
		args: {
			onReactivate: fn()
		}
	});
</script>

<Story name="Pro — Monthly">
	<div class="w-full max-w-md">
		<ReactivateCard
			planId="pro"
			price="$9.99"
			billingPeriod="monthly"
			periodEndDate="2026-07-30"
			onReactivate={fn()}
		/>
	</div>
</Story>

<Story name="Pro Plus — Yearly">
	<div class="w-full max-w-md">
		<ReactivateCard
			planId="proplus"
			price="$24.99"
			billingPeriod="yearly"
			periodEndDate="2027-06-30"
			onReactivate={fn()}
		/>
	</div>
</Story>
