<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import CancellationBanner from './CancellationBanner.svelte';

	const { Story } = defineMeta({
		title: 'Sections/CancellationBanner',
		component: CancellationBanner,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		},
		args: {
			onReactivate: fn()
		}
	});
</script>

<Story name="With Plan ID (Pro)">
	<div class="w-full max-w-3xl">
		<CancellationBanner periodEndDate="2026-07-30" planId="pro" onReactivate={fn()} />
	</div>
</Story>

<Story name="Without Plan ID">
	<div class="w-full max-w-3xl">
		<CancellationBanner periodEndDate="2026-07-30" onReactivate={fn()} />
	</div>
</Story>

<Story name="Pro Plus">
	<div class="w-full max-w-3xl">
		<CancellationBanner periodEndDate="2027-06-30" planId="proplus" onReactivate={fn()} />
	</div>
</Story>
