<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn, fireEvent } from 'storybook/test';
	import DeleteKeyModal from './DeleteKeyModal.svelte';

	const { Story } = defineMeta({
		title: 'Settings/Components/DeleteKeyModal',
		component: DeleteKeyModal,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Open">
	<DeleteKeyModal keyName="My production key" onClose={fn()} onConfirm={fn()} />
</Story>

<Story
	name="Deleting"
	play={async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll('button');
		const confirmBtn = buttons[1];
		if (confirmBtn) await fireEvent.click(confirmBtn);
	}}
>
	<DeleteKeyModal
		keyName="My production key"
		onClose={fn()}
		onConfirm={() => new Promise(() => {})}
	/>
</Story>
