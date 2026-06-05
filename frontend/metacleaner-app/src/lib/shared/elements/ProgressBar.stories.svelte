<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProgressBar from './ProgressBar.svelte';

	const { Story } = defineMeta({
		title: 'Elements/ProgressBar',
		component: ProgressBar,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Empty">
	<ProgressBar value={0} />
</Story>

<Story name="Half">
	<ProgressBar value={50} />
</Story>

<Story name="Full">
	<ProgressBar value={100} />
</Story>

<Story name="Blue">
	<ProgressBar value={65} color="blue" />
</Story>

<Story name="Green">
	<ProgressBar value={65} color="green" />
</Story>

<Story name="Red">
	<ProgressBar value={65} color="red" />
</Story>

<Story name="Orange">
	<ProgressBar value={65} color="orange" />
</Story>

<Story name="Gray">
	<ProgressBar value={65} color="gray" />
</Story>

<Story name="Height XS">
	<ProgressBar value={50} height="xs" />
</Story>

<Story name="Height SM">
	<ProgressBar value={50} height="sm" />
</Story>

<Story name="Height MD">
	<ProgressBar value={50} height="md" />
</Story>
