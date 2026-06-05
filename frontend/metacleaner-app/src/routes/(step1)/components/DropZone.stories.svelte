<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fireEvent } from 'storybook/test';
	import { fn } from 'storybook/test';
	import DropZone from './DropZone.svelte';

	const { Story } = defineMeta({
		title: 'Step1/DropZone',
		component: DropZone,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }],
			},
		},
		args: {
			onFiles: fn(),
		},
	});
</script>

<Story name="Idle">
	<DropZone onFiles={fn()} />
</Story>

<Story
	name="Dragover"
	play={async ({ canvasElement }) => {
		const dropzone = canvasElement.querySelector('.dashed-border-anim');
		if (dropzone) await fireEvent.dragOver(dropzone);
	}}
>
	<DropZone onFiles={fn()} />
</Story>
