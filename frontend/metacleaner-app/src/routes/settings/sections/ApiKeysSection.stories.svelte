<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ApiKeysSection from './ApiKeysSection.svelte';

	const { Story } = defineMeta({
		title: 'Settings/Sections/ApiKeysSection',
		component: ApiKeysSection,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<script>
	const mockApiKeys = {
		production: {
			key: 'sk_live_a8f3k2m9x1qw5e7r0tyu6io4p',
			label: 'Production Key',
			active: true,
			createdAt: '15. 4. 2025',
			lastUsed: '2. 6. 2025'
		},
		test: {
			key: 'sk_test_z9d4n7h2s6bv1cx3lm8poq0wr',
			label: 'Test Key',
			active: false,
			createdAt: '',
			lastUsed: ''
		}
	};
</script>

<Story name="Default">
	<div class="max-w-md p-4 flex flex-col gap-4">
		<ApiKeysSection apiKeys={mockApiKeys} />
	</div>
</Story>

<Story name="Keys Hidden">
	<div class="max-w-md p-4 flex flex-col gap-4">
		<ApiKeysSection apiKeys={mockApiKeys} />
	</div>
</Story>
