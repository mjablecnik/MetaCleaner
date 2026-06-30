<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import ConfirmationModal from './ConfirmationModal.svelte';

	const { Story } = defineMeta({
		title: 'Sections/ConfirmationModal',
		component: ConfirmationModal,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Primary Confirm">
	<ConfirmationModal
		title="Confirm Action"
		confirmStyle="primary"
		onConfirm={fn()}
		onCancel={fn()}
	>
		{#snippet content()}
			<p class="text-sm text-text-muted">Are you sure you want to proceed with this action?</p>
		{/snippet}
	</ConfirmationModal>
</Story>

<Story name="Danger Confirm">
	<ConfirmationModal
		title="Delete Account"
		confirmLabel="Delete"
		confirmStyle="danger"
		onConfirm={fn()}
		onCancel={fn()}
	>
		{#snippet content()}
			<p class="text-sm text-text-muted">
				This action is permanent and cannot be undone. All your data will be deleted.
			</p>
		{/snippet}
	</ConfirmationModal>
</Story>

<Story name="Secondary Confirm">
	<ConfirmationModal
		title="Downgrade Plan"
		confirmLabel="Downgrade"
		confirmStyle="secondary"
		onConfirm={fn()}
		onCancel={fn()}
	>
		{#snippet content()}
			<p class="text-sm text-text-muted">
				Your plan will be downgraded at the end of the billing period.
			</p>
		{/snippet}
	</ConfirmationModal>
</Story>

<Story name="Loading">
	<ConfirmationModal
		title="Processing"
		confirmStyle="primary"
		isLoading={true}
		onConfirm={fn()}
		onCancel={fn()}
	>
		{#snippet content()}
			<p class="text-sm text-text-muted">Please wait while we process your request.</p>
		{/snippet}
	</ConfirmationModal>
</Story>
