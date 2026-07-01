<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import UpgradeCard from './UpgradeCard.svelte';

	const { Story } = defineMeta({
		title: 'Sections/UpgradeCard',
		component: UpgradeCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		},
		args: {
			onUpgrade: fn()
		}
	});
</script>

<Story name="Default (Pro → Pro Plus)" exportName="DefaultProToProPlus">
	<div class="w-full max-w-md">
		<UpgradeCard
			targetPlanId="proplus"
			targetPlanName="Pro Plus"
			targetPrice="$24.99"
			differentialFeatures={['Unlimited photos', 'Priority processing', 'Webhooks', 'Advanced API']}
			onUpgrade={fn()}
		/>
	</div>
</Story>

<Story name="Free → Pro" exportName="FreeToPro">
	<div class="w-full max-w-md">
		<UpgradeCard
			targetPlanId="pro"
			targetPlanName="Pro"
			targetPrice="$9.99"
			differentialFeatures={['100 photos/month', 'EXIF cleaning', 'GPS removal', 'API access']}
			onUpgrade={fn()}
		/>
	</div>
</Story>

<Story name="No Differential Features">
	<div class="w-full max-w-md">
		<UpgradeCard
			targetPlanId="pro"
			targetPlanName="Pro"
			targetPrice="$9.99"
			differentialFeatures={[]}
			onUpgrade={fn()}
		/>
	</div>
</Story>
