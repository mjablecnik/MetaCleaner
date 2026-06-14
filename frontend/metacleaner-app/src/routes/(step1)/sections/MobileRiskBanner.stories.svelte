<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { userEvent } from 'storybook/test';
	import MobileRiskBanner from './MobileRiskBanner.svelte';
	import { clearFiles } from '$lib/scanner/scannerStore.svelte';

	// Ensure a clean low-risk state (empty file list → score 0 → severity 'low')
	clearFiles();

	const { Story } = defineMeta({
		title: 'Step1/MobileRiskBanner',
		component: MobileRiskBanner,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Low Risk — Collapsed">
	<div class="w-full max-w-md">
		<MobileRiskBanner />
	</div>
</Story>

<Story
	name="Low Risk — Expanded"
	play={async ({ canvasElement }) => {
		const button = canvasElement.querySelector('button');
		if (button) await userEvent.click(button);
	}}
>
	<div class="w-full max-w-md">
		<MobileRiskBanner />
	</div>
</Story>
