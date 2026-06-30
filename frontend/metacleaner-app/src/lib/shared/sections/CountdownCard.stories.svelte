<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CountdownCard from './CountdownCard.svelte';

	const { Story } = defineMeta({
		title: 'Sections/CountdownCard',
		component: CountdownCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<!-- Monthly — start of period (28 days remaining) -->
<Story name="Monthly — Start of Period">
	<div class="w-full max-w-sm">
		<CountdownCard
			periodEndDate="2026-07-28"
			billingPeriod="monthly"
			currentPeriodStart="2026-06-28"
		/>
	</div>
</Story>

<!-- Monthly — near end (3 days remaining) -->
<Story name="Monthly — Near End">
	<div class="w-full max-w-sm">
		<CountdownCard
			periodEndDate="2026-07-03"
			billingPeriod="monthly"
			currentPeriodStart="2026-06-03"
		/>
	</div>
</Story>

<!-- Yearly — start of period (many days remaining) -->
<Story name="Yearly — Start of Period">
	<div class="w-full max-w-sm">
		<CountdownCard
			periodEndDate="2027-06-30"
			billingPeriod="yearly"
			currentPeriodStart="2026-06-30"
		/>
	</div>
</Story>

<!-- Yearly — near end (~2 weeks remaining) -->
<Story name="Yearly — Near End">
	<div class="w-full max-w-sm">
		<CountdownCard
			periodEndDate="2026-07-14"
			billingPeriod="yearly"
			currentPeriodStart="2025-07-14"
		/>
	</div>
</Story>
