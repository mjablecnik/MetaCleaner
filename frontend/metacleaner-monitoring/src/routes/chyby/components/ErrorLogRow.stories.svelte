<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorLogRow from './ErrorLogRow.svelte';

	const { Story } = defineMeta({
		title: 'Errors/ErrorLogRow',
		component: ErrorLogRow,
		tags: ['autodocs']
	});
</script>

<Story
	name="500 Error Desktop"
	args={{
		entry: {
			id: 'err-1',
			time: '14:32:11',
			type: '500',
			typeClass: 'bg-error/15 text-error',
			message: 'Internal Server Error – DB connection pool exhausted',
			source: '/api/v1/checkout',
			statusKey: 'common_status_active',
			statusClass: 'bg-error/10 text-error'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="JS Error Desktop"
	args={{
		entry: {
			id: 'err-2',
			time: '14:28:45',
			type: 'JS',
			typeClass: 'bg-secondary/15 text-secondary',
			message: "TypeError: Cannot read property 'id' of undefined",
			source: 'cart.component.js:142',
			statusKey: 'common_status_warning',
			statusClass: 'bg-secondary/10 text-secondary'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="Resolved Mobile"
	args={{
		entry: {
			id: 'err-4',
			time: '13:50:33',
			type: 'EXC',
			typeClass: 'bg-purple/15 text-purple',
			message: 'NullPointerException in OrderService.processPayment()',
			source: 'OrderService.java:87',
			statusKey: 'common_status_resolved',
			statusClass: 'bg-success/10 text-success'
		},
		variant: 'mobile'
	}}
/>
