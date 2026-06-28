<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ConnectionPoolIndicator from './ConnectionPoolIndicator.svelte';

	const { Story } = defineMeta({
		title: 'databaze/components/ConnectionPoolIndicator',
		component: ConnectionPoolIndicator,
		tags: ['autodocs']
	});
</script>

<Story
	name="Normal"
	args={{
		value: 42,
		max: 100,
		barClass: 'bg-primary',
		labelClass: 'text-textMain'
	}}
/>

<Story
	name="Warning"
	args={{
		value: 87,
		max: 100,
		barClass: 'bg-secondary',
		labelClass: 'text-secondary'
	}}
/>

<Story
	name="Critical"
	args={{
		value: 98,
		max: 100,
		barClass: 'bg-error',
		labelClass: 'text-error'
	}}
/>
