<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EventLogTable from './EventLogTable.svelte';

	const sampleFilters = [
		{ label: 'All', value: '' },
		{ label: 'Error', value: 'error' },
		{ label: 'Warning', value: 'warning' },
		{ label: 'Info', value: 'info' }
	];

	const sampleHeaders = ['Time', 'Type', 'Message', 'Source', 'Status'];

	const sampleRows = [
		{ id: 1, time: '14:23:01', type: 'Error', typeClass: 'bg-error/20 text-error', message: 'Connection timeout on /api/users', source: '/api/users', statusClass: 'bg-error/20 text-error', status: 'Active' },
		{ id: 2, time: '14:21:45', type: 'Warning', typeClass: 'bg-secondary/20 text-secondary', message: 'Slow query detected (>500ms)', source: 'DB pool', statusClass: 'bg-secondary/20 text-secondary', status: 'Pending' },
		{ id: 3, time: '14:19:32', type: 'Info', typeClass: 'bg-blue/20 text-blue', message: 'Deploy v2.4.1 completed', source: 'CI/CD', statusClass: 'bg-success/20 text-success', status: 'Resolved' }
	];

	const { Story } = defineMeta({
		title: 'Components/EventLogTable',
		component: EventLogTable,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<EventLogTable title="Event Log" headers={sampleHeaders}>
		{#each sampleRows as row (row.id)}
			<tr class="hover:bg-surface/30 transition-colors">
				<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">{row.time}</td>
				<td class="py-3 pr-4"
					><span class="px-2 py-0.5 text-xs rounded font-medium {row.typeClass}">{row.type}</span></td
				>
				<td class="py-3 pr-4 text-textMain max-w-xs truncate text-xs">{row.message}</td>
				<td class="py-3 pr-4 text-textSec font-mono text-xs">{row.source}</td>
				<td class="py-3"
					><span class="px-2 py-0.5 text-xs rounded {row.statusClass}">{row.status}</span></td
				>
			</tr>
		{/each}
	</EventLogTable>
</Story>

<Story name="WithFilters">
	<EventLogTable
		title="Runtime Error Log"
		subtitle="Last 24 hours"
		headers={sampleHeaders}
		filters={sampleFilters}
		activeFilter=""
		searchPlaceholder="Search logs..."
	>
		{#each sampleRows as row (row.id)}
			<tr class="hover:bg-surface/30 transition-colors">
				<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">{row.time}</td>
				<td class="py-3 pr-4"
					><span class="px-2 py-0.5 text-xs rounded font-medium {row.typeClass}">{row.type}</span></td
				>
				<td class="py-3 pr-4 text-textMain max-w-xs truncate text-xs">{row.message}</td>
				<td class="py-3 pr-4 text-textSec font-mono text-xs">{row.source}</td>
				<td class="py-3"
					><span class="px-2 py-0.5 text-xs rounded {row.statusClass}">{row.status}</span></td
				>
			</tr>
		{/each}
	</EventLogTable>
</Story>

<Story name="Empty">
	<EventLogTable
		title="Security Log"
		subtitle="No events found"
		headers={sampleHeaders}
		filters={sampleFilters}
		activeFilter="error"
		searchPlaceholder="Search logs..."
	>
		<tr>
			<td colspan="5" class="py-8 text-center text-textSec text-sm">No log entries found.</td>
		</tr>
	</EventLogTable>
</Story>
