<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FilterPill from './FilterPill.svelte';

	const { Story } = defineMeta({
		title: 'Elements/FilterPill',
		component: FilterPill,
		tags: ['autodocs'],
		argTypes: {
			active: { control: 'boolean' }
		}
	});
</script>

<Story
	name="Active"
	args={{
		label: 'All',
		active: true,
		activeClass: 'bg-primary/20 text-primary',
		onclick: () => {}
	}}
/>

<Story name="Inactive" args={{ label: 'Critical', active: false, onclick: () => {} }} />

<Story
	name="ActiveError"
	args={{ label: 'All', active: true, activeClass: 'bg-error/20 text-error', onclick: () => {} }}
/>

<Story
	name="ActiveAmber"
	args={{ label: 'All', active: true, activeClass: 'bg-amber/20 text-amber', onclick: () => {} }}
/>
