<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import ErrorBanner from './ErrorBanner.svelte';

	const { Story } = defineMeta({
		title: 'Step4/ErrorBanner',
		component: ErrorBanner,
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
	<div class="w-full max-w-2xl p-4">
		<ErrorBanner
			code="ERR_CLEAN_001"
			description="The file could not be processed due to an unexpected error during the metadata cleaning phase."
			onDismiss={fn()}
		/>
	</div>
</Story>

<Story name="Dismissed — Before Removal">
	<div class="w-full max-w-2xl p-4">
		<ErrorBanner
			code="ERR_TIMEOUT_003"
			description="Operation timed out after 30 seconds. Please check your connection and try again."
			onDismiss={fn()}
		/>
	</div>
</Story>
