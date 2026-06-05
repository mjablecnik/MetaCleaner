<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BottomSheet from './BottomSheet.svelte';

	const { Story } = defineMeta({
		title: 'Components/BottomSheet',
		component: BottomSheet,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			},
			layout: 'fullscreen'
		}
	});
</script>

<Story name="Closed">
	<BottomSheet open={false} title="Options" onClose={() => {}} />
</Story>

<Story name="Open With Content">
	<BottomSheet open={true} title="Options" onClose={() => {}}>
		<div class="flex flex-col gap-4 p-5">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-white">Remove GPS data</p>
					<p class="mt-0.5 text-xs text-text-muted">Strip location metadata from all files</p>
				</div>
				<div class="h-6 w-10 rounded-full bg-brand-green"></div>
			</div>
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-white">Remove EXIF data</p>
					<p class="mt-0.5 text-xs text-text-muted">Strip camera and device metadata</p>
				</div>
				<div class="h-6 w-10 rounded-full bg-brand-green"></div>
			</div>
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-white">Remove author info</p>
					<p class="mt-0.5 text-xs text-text-muted">Remove creator and software fields</p>
				</div>
				<div class="h-6 w-10 rounded-full border border-gray-700 bg-navy-lighter"></div>
			</div>
		</div>
	</BottomSheet>
</Story>

<Story name="Open Empty">
	<BottomSheet open={true} title="Upgrade Plan" onClose={() => {}}>
		<div class="p-5">
			<p class="text-sm text-text-muted">Sheet content goes here.</p>
		</div>
	</BottomSheet>
</Story>
