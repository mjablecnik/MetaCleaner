<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FiltersBar from './FiltersBar.svelte';

	const { Story } = defineMeta({
		title: 'Reports/Sections/FiltersBar',
		component: FiltersBar,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="No Filter Active">
	<div class="w-full max-w-4xl p-4">
		<FiltersBar activeFilter="all" onFilterChange={() => {}} />
	</div>
</Story>

<Story name="Filter Active — Successful">
	<div class="w-full max-w-4xl p-4">
		<FiltersBar activeFilter="success" onFilterChange={() => {}} />
	</div>
</Story>

<Story name="Filter Active — GPS">
	<div class="w-full max-w-4xl p-4">
		<FiltersBar activeFilter="gps" onFilterChange={() => {}} />
	</div>
</Story>

<Story name="Filter Active — Photos">
	<div class="w-full max-w-4xl p-4">
		<FiltersBar activeFilter="image" onFilterChange={() => {}} />
	</div>
</Story>

<Story name="Filter Active — Video">
	<div class="w-full max-w-4xl p-4">
		<FiltersBar activeFilter="video" onFilterChange={() => {}} />
	</div>
</Story>
