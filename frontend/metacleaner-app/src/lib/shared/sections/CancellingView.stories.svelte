<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CancellingView from './CancellingView.svelte';

	const { Story } = defineMeta({
		title: 'Sections/CancellingView',
		component: CancellingView,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});

	const PRO_FEATURES = [
		'100 photos/month',
		'EXIF cleaning',
		'GPS removal',
		'Batch upload',
		'API access'
	];
</script>

<Story name="Monthly Period">
	<div class="w-full max-w-4xl">
		<CancellingView
			planId="pro"
			price="$9.99"
			billingPeriod="monthly"
			periodEndDate="2026-07-28"
			currentPeriodStart="2026-06-28"
			monthlyAllowance={100}
			creditsUsed={45}
			creditsRemaining={55}
			features={PRO_FEATURES}
		/>
	</div>
</Story>

<Story name="Yearly Period">
	<div class="w-full max-w-4xl">
		<CancellingView
			planId="proplus"
			price="$24.99"
			billingPeriod="yearly"
			periodEndDate="2027-06-30"
			currentPeriodStart="2026-06-30"
			monthlyAllowance={500}
			creditsUsed={200}
			creditsRemaining={300}
			features={['Unlimited photos', 'Priority processing', 'EXIF cleaning', 'GPS removal', 'Webhooks', 'API access']}
		/>
	</div>
</Story>
