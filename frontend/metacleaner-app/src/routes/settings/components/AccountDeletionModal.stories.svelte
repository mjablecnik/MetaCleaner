<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import AccountDeletionModal from './AccountDeletionModal.svelte';

	const { Story } = defineMeta({
		title: 'Settings/Components/AccountDeletionModal',
		component: AccountDeletionModal,
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
	<AccountDeletionModal onClose={fn()} />
</Story>
