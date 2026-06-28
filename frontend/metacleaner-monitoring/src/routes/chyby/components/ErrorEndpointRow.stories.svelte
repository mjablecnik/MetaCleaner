<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorEndpointRow from './ErrorEndpointRow.svelte';

	const { Story } = defineMeta({
		title: 'Errors/ErrorEndpointRow',
		component: ErrorEndpointRow,
		tags: ['autodocs']
	});
</script>

<Story
	name="High Error Desktop"
	args={{
		endpoint: {
			method: 'POST',
			methodClass: 'bg-error/20 text-error',
			path: '/api/v1/checkout',
			errorCount: 24,
			barWidth: '85%',
			barClass: 'bg-error',
			countClass: 'text-error'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Medium Error Desktop"
	args={{
		endpoint: {
			method: 'GET',
			methodClass: 'bg-blue/20 text-blue',
			path: '/api/v1/users/profile',
			errorCount: 11,
			barWidth: '45%',
			barClass: 'bg-secondary',
			countClass: 'text-secondary'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Low Error Mobile"
	args={{
		endpoint: {
			method: 'PUT',
			methodClass: 'bg-success/20 text-success',
			path: '/api/v1/orders/update',
			errorCount: 4,
			barWidth: '15%',
			barClass: 'bg-blue',
			countClass: 'text-textSec'
		},
		variant: 'mobile'
	}}
/>
