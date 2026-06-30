<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import CreateKeyModal from './CreateKeyModal.svelte';

	const { Story } = defineMeta({
		title: 'Settings/Components/CreateKeyModal',
		component: CreateKeyModal,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Open (Form)">
	<CreateKeyModal onClose={fn()} onCreated={fn()} />
</Story>
