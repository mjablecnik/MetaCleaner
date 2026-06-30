<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fireEvent } from 'storybook/test';
	import CopyButton from './CopyButton.svelte';

	const { Story } = defineMeta({
		title: 'Elements/CopyButton',
		component: CopyButton,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Idle">
	<CopyButton text="npm install metacleaner" />
</Story>

<Story
	name="Copied"
	play={async ({ canvasElement }) => {
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: () => Promise.resolve() },
			configurable: true,
			writable: true
		});
		const btn = canvasElement.querySelector('button');
		if (btn) await fireEvent.click(btn);
	}}
>
	<CopyButton text="npm install metacleaner" />
</Story>
