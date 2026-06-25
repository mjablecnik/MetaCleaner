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

<Story name="Default">
	<div class="flex max-w-md flex-col gap-4 p-4">
		<ApiKeysSection />
	</div>
</Story>
