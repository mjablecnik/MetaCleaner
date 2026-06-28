<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TableSizeRow from './TableSizeRow.svelte';

	const { Story } = defineMeta({
		title: 'databaze/components/TableSizeRow',
		component: TableSizeRow,
		tags: ['autodocs']
	});
</script>

<Story
	name="Default"
	args={{
		tableSize: {
			name: 'orders',
			sizeLabel: '1.5 GB',
			barWidth: '60%',
			barClass: 'bg-green-muted'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="LargeTable"
	args={{
		tableSize: {
			name: 'events',
			sizeLabel: '2.1 GB',
			barWidth: '82%',
			barClass: 'bg-blue'
		},
		variant: 'desktop'
	}}
/>

<Story
	name="SmallTable"
	args={{
		tableSize: {
			name: 'products',
			sizeLabel: '210 MB',
			barWidth: '8%',
			barClass: 'bg-blue'
		},
		variant: 'mobile'
	}}
/>
