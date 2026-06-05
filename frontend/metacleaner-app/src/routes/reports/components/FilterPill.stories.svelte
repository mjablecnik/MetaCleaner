<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FilterPill from './FilterPill.svelte';

	const { Story } = defineMeta({
		title: 'Reports/FilterPill',
		component: FilterPill,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Active">
	<div class="p-4">
		<FilterPill label="All Files" active={true} />
	</div>
</Story>

<Story name="Inactive">
	<div class="p-4">
		<FilterPill label="All Files" active={false} />
	</div>
</Story>

<Story name="Active — with count">
	<div class="p-4">
		<FilterPill label="Images (24)" active={true} />
	</div>
</Story>

<Story name="Inactive — with count">
	<div class="p-4">
		<FilterPill label="Videos (7)" active={false} />
	</div>
</Story>

<Story name="Active — with icon">
	<div class="p-4">
		<FilterPill label="GPS Risk" icon="fa-solid fa-location-dot" active={true} />
	</div>
</Story>

<Story name="Inactive — with icon">
	<div class="p-4">
		<FilterPill label="GPS Risk" icon="fa-solid fa-location-dot" active={false} />
	</div>
</Story>

<Story name="Pill group — one active">
	<div class="flex flex-wrap gap-2 p-4">
		<FilterPill label="All" active={true} />
		<FilterPill label="Images (24)" active={false} />
		<FilterPill label="Videos (7)" active={false} />
		<FilterPill label="Documents (3)" active={false} />
	</div>
</Story>
