<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import CancelSection from './CancelSection.svelte';

	const { Story } = defineMeta({
		title: 'Sections/CancelSection',
		component: CancelSection,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		},
		args: {
			onCancel: fn()
		}
	});
</script>

<Story name="Default">
	<div class="w-full max-w-2xl">
		<CancelSection periodEndDate="2026-07-30" onCancel={fn()} />
	</div>
</Story>
