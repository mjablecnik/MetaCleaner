<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CancellingPlanCard from './CancellingPlanCard.svelte';

	const { Story } = defineMeta({
		title: 'Sections/CancellingPlanCard',
		component: CancellingPlanCard,
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

<!-- Early in period: lots of credits remaining, many days left -->
<Story name="Early in Period">
	<div class="w-full max-w-lg">
		<CancellingPlanCard
			planId="pro"
			price="$9.99"
			monthlyAllowance={100}
			creditsUsed={10}
			creditsRemaining={90}
			periodEndDate="2026-07-28"
			features={PRO_FEATURES}
		/>
	</div>
</Story>

<!-- Mid period: moderate credits used, ~2 weeks left -->
<Story name="Mid Period">
	<div class="w-full max-w-lg">
		<CancellingPlanCard
			planId="pro"
			price="$9.99"
			monthlyAllowance={100}
			creditsUsed={55}
			creditsRemaining={45}
			periodEndDate="2026-07-14"
			features={PRO_FEATURES}
		/>
	</div>
</Story>

<!-- Late in period: almost no credits, expiring soon -->
<Story name="Late in Period (Near End)">
	<div class="w-full max-w-lg">
		<CancellingPlanCard
			planId="pro"
			price="$9.99"
			monthlyAllowance={100}
			creditsUsed={96}
			creditsRemaining={4}
			periodEndDate="2026-07-03"
			features={PRO_FEATURES}
		/>
	</div>
</Story>

<Story name="Pro Plus — Mid Period">
	<div class="w-full max-w-lg">
		<CancellingPlanCard
			planId="proplus"
			price="$24.99"
			monthlyAllowance={500}
			creditsUsed={200}
			creditsRemaining={300}
			periodEndDate="2026-07-20"
			features={[
				'Unlimited photos',
				'Priority processing',
				'EXIF cleaning',
				'GPS removal',
				'Webhooks',
				'API access'
			]}
		/>
	</div>
</Story>
