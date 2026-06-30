<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import UsageStatsCard from './UsageStatsCard.svelte';

	const { Story } = defineMeta({
		title: 'Sections/UsageStatsCard',
		component: UsageStatsCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Low Usage">
	<div class="w-full max-w-sm">
		<UsageStatsCard
			creditsConsumed={12}
			creditsRemaining={88}
			monthlyAllowance={100}
			renewalDate="2026-07-28"
		/>
	</div>
</Story>

<Story name="High Usage (Near Limit)">
	<div class="w-full max-w-sm">
		<UsageStatsCard
			creditsConsumed={94}
			creditsRemaining={6}
			monthlyAllowance={100}
			renewalDate="2026-07-28"
		/>
	</div>
</Story>

<Story name="Loading">
	<div class="w-full max-w-sm">
		<UsageStatsCard
			creditsConsumed={0}
			creditsRemaining={0}
			monthlyAllowance={0}
			renewalDate="2026-07-28"
			isLoading={true}
		/>
	</div>
</Story>

<Story name="With Error">
	<div class="w-full max-w-sm">
		<UsageStatsCard
			creditsConsumed={50}
			creditsRemaining={50}
			monthlyAllowance={100}
			renewalDate="2026-07-28"
			hasError={true}
		/>
	</div>
</Story>
