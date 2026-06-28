<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SlowEndpointRow from './SlowEndpointRow.svelte';

	const { Story } = defineMeta({
		title: 'Performance/SlowEndpointRow',
		component: SlowEndpointRow,
		tags: ['autodocs']
	});
</script>

<Story
	name="Slow POST Desktop"
	args={{
		endpoint: {
			id: 'checkout',
			method: 'POST',
			methodClass: 'bg-error/20 text-error',
			path: '/api/v1/checkout/process',
			callCount: '1,240',
			errorRate: '3.2%',
			avgMs: 1840,
			barWidth: '92%',
			timeColor: 'text-error',
			barColor: 'bg-error'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Medium GET Desktop"
	args={{
		endpoint: {
			id: 'users',
			method: 'GET',
			methodClass: 'bg-blue/20 text-blue',
			path: '/api/v1/users/recommendations',
			callCount: '8,420',
			errorRate: '0.4%',
			avgMs: 460,
			barWidth: '46%',
			timeColor: 'text-secondary',
			barColor: 'bg-secondary'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Fast GET Mobile"
	args={{
		endpoint: {
			id: 'products',
			method: 'GET',
			methodClass: 'bg-success/20 text-success',
			path: '/api/v1/products/list',
			callCount: '42,100',
			errorRate: '0.1%',
			avgMs: 120,
			barWidth: '12%',
			timeColor: 'text-success',
			barColor: 'bg-success'
		},
		variant: 'mobile'
	}}
/>
