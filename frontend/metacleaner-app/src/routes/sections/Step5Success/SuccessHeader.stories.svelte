<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SuccessHeader from './SuccessHeader.svelte';

	const { Story } = defineMeta({
		title: 'Step5/SuccessHeader',
		component: SuccessHeader,
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
		<SuccessHeader fileCount={3} onUploadNew={() => {}} />
	</div>
</Story>

<Story name="Single File">
	<div class="w-full max-w-2xl p-4">
		<SuccessHeader fileCount={1} onUploadNew={() => {}} />
	</div>
</Story>
