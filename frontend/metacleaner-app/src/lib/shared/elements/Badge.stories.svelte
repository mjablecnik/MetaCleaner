<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Badge from './Badge.svelte';

	const { Story } = defineMeta({
		title: 'Elements/Badge',
		component: Badge,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Blue">
	<Badge color="blue" label="Processing" />
</Story>

<Story name="Green">
	<Badge color="green" label="Success" />
</Story>

<Story name="Red">
	<Badge color="red" label="Error" />
</Story>

<Story name="Orange">
	<Badge color="orange" label="Warning" />
</Story>

<Story name="With Dot">
	<Badge color="blue" label="Live" dot />
</Story>

<Story name="With Dot Green">
	<Badge color="green" label="Active" dot />
</Story>

<Story name="With Icon">
	<Badge color="blue" label="Scanning" icon="fa-solid fa-shield-halved" />
</Story>

<Story name="With Icon Red">
	<Badge color="red" label="Failed" icon="fa-solid fa-circle-exclamation" />
</Story>

<Story name="With Icon Orange">
	<Badge color="orange" label="Upgrade" icon="fa-solid fa-star" />
</Story>

<Story name="With Dot and Icon">
	<Badge color="green" label="Processing" dot icon="fa-solid fa-spinner" />
</Story>
