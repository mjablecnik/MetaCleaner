<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import UpgradeModal from './UpgradeModal.svelte';

	const { Story } = defineMeta({
		title: 'Components/UpgradeModal',
		component: UpgradeModal,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Full Modal">
	<div class="mx-auto max-w-sm rounded-2xl border border-gray-800 bg-navy-card">
		<UpgradeModal onDismiss={() => console.log('dismissed')} />
	</div>
</Story>
