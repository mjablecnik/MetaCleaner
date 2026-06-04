<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageHeader from './PageHeader.svelte';
	import Badge from '$lib/shared/elements/Badge.svelte';

	const { Story } = defineMeta({
		title: 'Components/PageHeader',
		component: PageHeader,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }],
			},
		},
	});
</script>

<Story name="Without Badge">
	<PageHeader
		title="Clean Your Files"
		description="Upload photos, videos and documents to remove hidden metadata."
	/>
</Story>

<Story name="With Blue Badge">
	<PageHeader
		title="Scanning Files"
		description="Analyzing metadata risk across your uploaded files."
	>
		{#snippet badge()}
			<Badge color="blue" label="Scanning" icon="fa-solid fa-shield-halved" dot />
		{/snippet}
	</PageHeader>
</Story>

<Story name="With Orange Badge">
	<PageHeader
		title="Processing Files"
		description="Removing metadata from your files. Please wait."
	>
		{#snippet badge()}
			<Badge color="orange" label="Processing" dot />
		{/snippet}
	</PageHeader>
</Story>

<Story name="With Red Badge">
	<PageHeader
		title="Processing Error"
		description="An error occurred while cleaning one or more files."
	>
		{#snippet badge()}
			<Badge color="red" label="Failed" icon="fa-solid fa-circle-exclamation" />
		{/snippet}
	</PageHeader>
</Story>
