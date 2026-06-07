<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MobileBottomCta from './MobileBottomCta.svelte';

	const { Story } = defineMeta({
		title: 'Components/MobileBottomCta',
		component: MobileBottomCta,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			},
			layout: 'fullscreen',
			viewport: {
				defaultViewport: 'mobile1'
			}
		}
	});
</script>

<Story name="With Button Content">
	<MobileBottomCta>
		<button
			class="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
		>
			Upload Files
		</button>
	</MobileBottomCta>
</Story>

<Story name="With Text Content">
	<MobileBottomCta>
		<p class="text-center text-sm text-gray-300">Processing your files, please wait…</p>
	</MobileBottomCta>
</Story>
