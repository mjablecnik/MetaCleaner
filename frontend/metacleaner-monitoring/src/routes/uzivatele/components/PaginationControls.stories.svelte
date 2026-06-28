<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PaginationControls from './PaginationControls.svelte';

	const { Story } = defineMeta({
		title: 'Uzivatele/PaginationControls',
		component: PaginationControls,
		tags: ['autodocs']
	});
</script>

<Story
	name="Desktop Page 1"
	args={{
		variant: 'desktop',
		currentPage: 1,
		totalPages: 1285,
		totalItems: '12 847',
		from: '1',
		to: '10'
	}}
/>

<Story
	name="Desktop Page 2"
	args={{
		variant: 'desktop',
		currentPage: 2,
		totalPages: 1285,
		totalItems: '12 847',
		from: '11',
		to: '20'
	}}
/>

<Story
	name="Desktop Few Pages"
	args={{
		variant: 'desktop',
		currentPage: 1,
		totalPages: 3,
		totalItems: '25',
		from: '1',
		to: '10'
	}}
/>

<Story
	name="Mobile Page 1"
	args={{
		variant: 'mobile',
		currentPage: 1,
		totalPages: 1285,
		totalItems: '12 847',
		from: '1',
		to: '10'
	}}
/>

<Story
	name="Mobile Page 2"
	args={{
		variant: 'mobile',
		currentPage: 2,
		totalPages: 1285,
		totalItems: '12 847',
		from: '11',
		to: '20'
	}}
/>
