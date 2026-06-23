<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProOverlay from './ProOverlay.svelte';

	const { Story } = defineMeta({
		title: 'Components/ProOverlay',
		component: ProOverlay,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Full Overlay">
	<div class="relative h-96 w-80 overflow-hidden rounded-2xl border border-gray-800 bg-navy-card">
		<!-- Simulated blurred content behind -->
		<div class="flex h-full flex-col gap-3 p-4 blur-sm">
			<div class="h-4 w-24 rounded bg-gray-700"></div>
			<div class="h-20 w-full rounded-xl bg-gray-800"></div>
			<div class="h-4 w-32 rounded bg-gray-700"></div>
			<div class="h-16 w-full rounded-xl bg-gray-800"></div>
		</div>
		<ProOverlay />
	</div>
</Story>
