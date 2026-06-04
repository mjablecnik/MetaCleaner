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
				values: [{ name: 'dark', value: '#0a1628' }],
			},
			layout: 'fullscreen',
		},
	});
</script>

<Story name="Closed">
	<BottomSheet open={false} title="Options" onClose={() => {}} />
</Story>

<Story name="Open With Content">
	<BottomSheet open={true} title="Options" onClose={() => {}}>
		<div class="p-5 flex flex-col gap-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-white font-medium text-sm">Remove GPS data</p>
					<p class="text-text-muted text-xs mt-0.5">Strip location metadata from all files</p>
				</div>
				<div class="w-10 h-6 rounded-full bg-brand-green"></div>
			</div>
			<div class="flex items-center justify-between">
				<div>
					<p class="text-white font-medium text-sm">Remove EXIF data</p>
					<p class="text-text-muted text-xs mt-0.5">Strip camera and device metadata</p>
				</div>
				<div class="w-10 h-6 rounded-full bg-brand-green"></div>
			</div>
			<div class="flex items-center justify-between">
				<div>
					<p class="text-white font-medium text-sm">Remove author info</p>
					<p class="text-text-muted text-xs mt-0.5">Remove creator and software fields</p>
				</div>
				<div class="w-10 h-6 rounded-full bg-navy-lighter border border-gray-700"></div>
			</div>
		</div>
	</BottomSheet>
</Story>

<Story name="Open Empty">
	<BottomSheet open={true} title="Upgrade Plan" onClose={() => {}}>
		<div class="p-5">
			<p class="text-text-muted text-sm">Sheet content goes here.</p>
		</div>
	</BottomSheet>
</Story>
