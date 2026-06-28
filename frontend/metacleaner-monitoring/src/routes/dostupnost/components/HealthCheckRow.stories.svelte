<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import HealthCheckRow from './HealthCheckRow.svelte';

	const { Story } = defineMeta({
		title: 'Availability/HealthCheckRow',
		component: HealthCheckRow,
		tags: ['autodocs']
	});
</script>

<Story
	name="Online"
	args={{
		healthCheck: {
			endpoint: '/health',
			service: 'Backend API',
			status: 'online',
			statusCode: '200 OK',
			latencyMs: 42
		}
	}}
/>

<Story
	name="Degraded"
	args={{
		healthCheck: {
			endpoint: '/api/db-health',
			service: 'Supabase',
			status: 'degraded',
			statusCode: '200 OK',
			latencyMs: 412
		}
	}}
/>

<Story
	name="Offline"
	args={{
		healthCheck: {
			endpoint: '/api/critical',
			service: 'Backend API',
			status: 'offline',
			statusCode: '503',
			latencyMs: 0
		}
	}}
/>
