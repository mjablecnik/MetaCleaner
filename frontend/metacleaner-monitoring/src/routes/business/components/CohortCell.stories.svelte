<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CohortCell from './CohortCell.svelte';

	const { Story } = defineMeta({
		title: 'Business/CohortCell',
		component: CohortCell,
		tags: ['autodocs']
	});
</script>

<Story
	name="100 percent (M0)"
	args={{
		percent: 100
	}}
/>

<Story
	name="High Retention (above 70)"
	args={{
		percent: 84
	}}
/>

<Story
	name="Low Retention (below 70)"
	args={{
		percent: 52
	}}
/>

<Story
	name="Empty (no data)"
	args={{
		percent: null
	}}
/>
