<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GoalProgressBar from './GoalProgressBar.svelte';

	const { Story } = defineMeta({
		title: 'Business/GoalProgressBar',
		component: GoalProgressBar,
		tags: ['autodocs']
	});
</script>

<Story
	name="MRR Goal (on track)"
	args={{
		goal: {
			id: 'okr-1',
			titleKey: 'business_okr_mrrTarget',
			current: 48320,
			target: 60000,
			unit: '$',
			progressPercent: 80.5,
			progressClass: 'bg-success',
			statusKey: 'business_okr_onTrack',
			statusClass: 'text-success'
		}
	}}
/>

<Story
	name="Churn Target (near target)"
	args={{
		goal: {
			id: 'okr-2',
			titleKey: 'business_okr_churnTarget',
			current: 2.1,
			target: 2.0,
			unit: '%',
			progressPercent: 95,
			progressClass: 'bg-secondary',
			statusKey: 'business_okr_nearTarget',
			statusClass: 'text-secondary'
		}
	}}
/>

<Story
	name="User Growth Goal"
	args={{
		goal: {
			id: 'okr-3',
			titleKey: 'business_okr_userTarget',
			current: 12842,
			target: 15000,
			unit: '',
			progressPercent: 85.6,
			progressClass: 'bg-blue',
			statusKey: 'business_okr_onTrack',
			statusClass: 'text-success'
		}
	}}
/>
