<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import DowngradeCard from './DowngradeCard.svelte';

	const { Story } = defineMeta({
		title: 'Sections/DowngradeCard',
		component: DowngradeCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		},
		args: {
			onDowngrade: fn()
		}
	});
</script>

<Story name="Default (Pro Plus → Pro)">
	<div class="w-full max-w-md">
		<DowngradeCard
			targetPlanId="pro"
			targetPlanName="Pro"
			targetPrice="$9.99"
			featuresLost={['Unlimited photos', 'Priority processing', 'Webhooks', 'Advanced API']}
			onDowngrade={fn()}
		/>
	</div>
</Story>

<Story name="Pro → Free">
	<div class="w-full max-w-md">
		<DowngradeCard
			targetPlanId="free"
			targetPlanName="Free"
			targetPrice="$0"
			featuresLost={['100 photos/month → 5', 'API access', 'Batch upload', 'GPS removal']}
			onDowngrade={fn()}
		/>
	</div>
</Story>

<Story name="No Features Lost">
	<div class="w-full max-w-md">
		<DowngradeCard
			targetPlanId="free"
			targetPlanName="Free"
			targetPrice="$0"
			featuresLost={[]}
			onDowngrade={fn()}
		/>
	</div>
</Story>
