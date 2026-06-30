<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CurrentPlanCard from './CurrentPlanCard.svelte';

	const { Story } = defineMeta({
		title: 'Sections/CurrentPlanCard',
		component: CurrentPlanCard,
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
	const PROPLUS_FEATURES = [
		'Unlimited photos',
		'Priority processing',
		'EXIF cleaning',
		'GPS removal',
		'Batch upload',
		'API access',
		'Webhooks'
	];
</script>

<Story name="Pro — Monthly">
	<div class="w-full max-w-md pt-6">
		<CurrentPlanCard
			planId="pro"
			planStatus="active"
			billingPeriod="monthly"
			price="$9.99"
			monthlyAllowance={100}
			creditsUsed={30}
			creditsRemaining={70}
			renewalDate="2026-07-30"
			features={PRO_FEATURES}
			paymentMethod="Visa •••• 4242"
			nextPaymentDate="2026-07-30"
		/>
	</div>
</Story>

<Story name="Pro — Yearly">
	<div class="w-full max-w-md pt-6">
		<CurrentPlanCard
			planId="pro"
			planStatus="active"
			billingPeriod="yearly"
			price="$99.99"
			monthlyAllowance={100}
			creditsUsed={15}
			creditsRemaining={85}
			renewalDate="2027-06-30"
			features={PRO_FEATURES}
			paymentMethod="Mastercard •••• 1234"
			nextPaymentDate="2027-06-30"
		/>
	</div>
</Story>

<Story name="Free Plan (no billing period)">
	<div class="w-full max-w-md pt-6">
		<CurrentPlanCard
			planId="free"
			planStatus="active"
			billingPeriod={null}
			price=""
			monthlyAllowance={5}
			creditsUsed={3}
			creditsRemaining={2}
			renewalDate={null}
			features={['5 photos/month', 'EXIF cleaning']}
		/>
	</div>
</Story>

<Story name="Pro Plus — Monthly">
	<div class="w-full max-w-md pt-6">
		<CurrentPlanCard
			planId="proplus"
			planStatus="active"
			billingPeriod="monthly"
			price="$24.99"
			monthlyAllowance={500}
			creditsUsed={123}
			creditsRemaining={377}
			renewalDate="2026-07-30"
			features={PROPLUS_FEATURES}
			paymentMethod="Amex •••• 0005"
			nextPaymentDate="2026-07-30"
		/>
	</div>
</Story>

<Story name="Loading Skeleton">
	<div class="w-full max-w-md pt-6">
		<CurrentPlanCard
			planId="pro"
			planStatus="active"
			billingPeriod="monthly"
			price="$9.99"
			monthlyAllowance={100}
			creditsUsed={0}
			creditsRemaining={100}
			renewalDate={null}
			features={[]}
			isLoading={true}
		/>
	</div>
</Story>
