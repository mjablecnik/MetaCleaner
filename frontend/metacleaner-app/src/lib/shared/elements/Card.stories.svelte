<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Card from './Card.svelte';

	const { Story } = defineMeta({
		title: 'Elements/Card',
		component: Card,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Default">
	<Card>
		<p class="text-sm text-text-main">Default card with standard border</p>
	</Card>
</Story>

<Story name="Green Border">
	<Card borderColor="green">
		<p class="text-sm text-text-main">Card with green border — success state</p>
	</Card>
</Story>

<Story name="Red Border">
	<Card borderColor="red">
		<p class="text-sm text-text-main">Card with red border — error state</p>
	</Card>
</Story>

<Story name="Blue Border">
	<Card borderColor="blue">
		<p class="text-sm text-text-main">Card with blue border — processing state</p>
	</Card>
</Story>

<Story name="Orange Border">
	<Card borderColor="orange">
		<p class="text-sm text-text-main">Card with orange border — warning state</p>
	</Card>
</Story>

<Story name="Custom Padding">
	<Card padding="p-2">
		<p class="text-sm text-text-main">Card with compact padding</p>
	</Card>
</Story>
