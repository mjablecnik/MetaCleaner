<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AffiliateProgramSection from './AffiliateProgramSection.svelte';

	const { Story } = defineMeta({
		title: 'Settings/Sections/AffiliateProgramSection',
		component: AffiliateProgramSection,
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
	const mockStats = {
		referrals: 7,
		conversions: 3,
		earnings: '€12',
		affiliateLink: 'https://settiq.io/ref/jana-novakova'
	};

	const highStats = {
		referrals: 142,
		conversions: 89,
		earnings: '€1 340',
		affiliateLink: 'https://settiq.io/ref/jana-novakova'
	};
</script>

<Story name="Default">
	<div class="flex max-w-md flex-col gap-4 p-4">
		<AffiliateProgramSection affiliateStats={mockStats} />
	</div>
</Story>

<Story name="High Activity">
	<div class="flex max-w-md flex-col gap-4 p-4">
		<AffiliateProgramSection affiliateStats={highStats} />
	</div>
</Story>

<Story name="With Copy Handler">
	<div class="flex max-w-md flex-col gap-4 p-4">
		<AffiliateProgramSection affiliateStats={mockStats} onCopy={() => {}} />
	</div>
</Story>
