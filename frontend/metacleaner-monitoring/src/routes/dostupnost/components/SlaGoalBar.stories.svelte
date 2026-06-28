<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SlaGoalBar from './SlaGoalBar.svelte';

	const { Story } = defineMeta({
		title: 'Availability/SlaGoalBar',
		component: SlaGoalBar,
		tags: ['autodocs']
	});
</script>

<Story
	name="GoalMet"
	args={{
		goal: { service: 'Frontend', actual: 99.99, target: 99.9, met: true, barClass: 'bg-success' }
	}}
/>

<Story
	name="GoalNotMet"
	args={{
		goal: {
			service: 'Edge CDN',
			actual: 99.82,
			target: 99.9,
			met: false,
			barClass: 'bg-secondary'
		}
	}}
/>

<Story
	name="NearTarget"
	args={{
		goal: {
			service: 'Backend API',
			actual: 99.95,
			target: 99.9,
			met: true,
			barClass: 'bg-success'
		}
	}}
/>
