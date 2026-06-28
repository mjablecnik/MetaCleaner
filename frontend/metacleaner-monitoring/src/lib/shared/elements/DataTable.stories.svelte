<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DataTable from './DataTable.svelte';

	const { Story } = defineMeta({
		title: 'Elements/DataTable',
		component: DataTable,
		tags: ['autodocs']
	});
</script>

<Story name="Default" args={{ headers: ['Time', 'Type', 'Message', 'Status'] }}>
	<tr class="hover:bg-surface/30 transition-colors">
		<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">12:34:01</td>
		<td class="py-3 pr-4"
			><span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded font-medium">ERROR</span></td
		>
		<td class="py-3 pr-4 text-textMain max-w-xs truncate">Connection timeout to database</td>
		<td class="py-3"
			><span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded">UNRESOLVED</span></td
		>
	</tr>
	<tr class="hover:bg-surface/30 transition-colors">
		<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">12:31:45</td>
		<td class="py-3 pr-4"
			><span class="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded font-medium"
				>WARN</span
			></td
		>
		<td class="py-3 pr-4 text-textMain max-w-xs truncate">High memory usage detected</td>
		<td class="py-3"
			><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">RESOLVED</span></td
		>
	</tr>
</Story>

<Story name="Empty" args={{ headers: ['Time', 'Type', 'Message', 'Status'] }}>
	<tr>
		<td colspan="4" class="py-8 text-center text-textSec text-sm">No entries found.</td>
	</tr>
</Story>

<Story name="ManyRows" args={{ headers: ['Time', 'Endpoint', 'Method', 'Duration', 'Status'] }}>
	{#each Array.from({ length: 10 }, (_, i) => i) as i (i)}
		<tr class="hover:bg-surface/30 transition-colors">
			<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs"
				>12:{String(30 + i).padStart(2, '0')}:00</td
			>
			<td class="py-3 pr-4 text-textMain font-mono text-xs">/api/v1/endpoint-{i + 1}</td>
			<td class="py-3 pr-4"
				><span class="px-2 py-0.5 bg-blue/10 text-blue text-xs rounded font-medium">GET</span></td
			>
			<td class="py-3 pr-4 text-textSec font-mono text-xs">{120 + i * 15}ms</td>
			<td class="py-3"
				><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">200</span></td
			>
		</tr>
	{/each}
</Story>
