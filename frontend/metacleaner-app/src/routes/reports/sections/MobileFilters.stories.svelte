<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MobileFilters from './MobileFilters.svelte';

	const { Story } = defineMeta({
		title: 'Reports/Sections/MobileFilters',
		component: MobileFilters,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			},
			viewport: {
				defaultViewport: 'mobile1'
			}
		}
	});
</script>

<Story name="No Filter Active">
	<div class="w-full max-w-sm p-4">
		<MobileFilters activeFilter="all" onFilterChange={() => {}} />
	</div>
</Story>

<Story name="Filter Active — Successful">
	<div class="w-full max-w-sm p-4">
		<MobileFilters activeFilter="success" onFilterChange={() => {}} />
	</div>
</Story>

<Story name="Filter Active — GPS">
	<div class="w-full max-w-sm p-4">
		<MobileFilters activeFilter="gps" onFilterChange={() => {}} />
	</div>
</Story>

<Story name="Filter Active — Photos">
	<div class="w-full max-w-sm p-4">
		<MobileFilters activeFilter="image" onFilterChange={() => {}} />
	</div>
</Story>

<Story name="Filter Active — Video">
	<div class="w-full max-w-sm p-4">
		<MobileFilters activeFilter="video" onFilterChange={() => {}} />
	</div>
</Story>
