<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Chip from './Chip.svelte';

	const { Story } = defineMeta({
		title: 'Elements/Chip',
		component: Chip,
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
	<Chip color="blue" label="GPS Found" />
</Story>

<Story name="Green">
	<Chip color="green" label="Cleaned" />
</Story>

<Story name="Red">
	<Chip color="red" label="High Risk" />
</Story>

<Story name="Orange">
	<Chip color="orange" label="Warning" />
</Story>

<Story name="Muted">
	<Chip color="muted" label="Unknown" />
</Story>

<Story name="Without Border">
	<Chip color="blue" label="No Border" border={false} />
</Story>

<Story name="Rounded Shape">
	<Chip color="green" label="Rounded" shape="rounded" />
</Story>

<Story name="All Colors">
	<div class="flex flex-wrap gap-2">
		<Chip color="blue" label="Blue" />
		<Chip color="green" label="Green" />
		<Chip color="red" label="Red" />
		<Chip color="orange" label="Orange" />
		<Chip color="muted" label="Muted" />
	</div>
</Story>
