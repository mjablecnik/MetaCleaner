<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CreditSummaryRow from './CreditSummaryRow.svelte';

	const { Story } = defineMeta({
		title: 'Components/CreditSummaryRow',
		component: CreditSummaryRow,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Normal (sufficient credits)">
	<CreditSummaryRow totalCost={3} fileCount={3} creditBalance={10} />
</Story>

<Story name="Warning (insufficient credits)">
	<CreditSummaryRow totalCost={6} fileCount={6} creditBalance={2} />
</Story>

<Story name="Neutral (balance unknown)">
	<CreditSummaryRow totalCost={4} fileCount={4} creditBalance={null} />
</Story>
