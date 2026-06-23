<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CreditBalanceIndicator from './CreditBalanceIndicator.svelte';

	const { Story } = defineMeta({
		title: 'Components/CreditBalanceIndicator',
		component: CreditBalanceIndicator,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Loaded (50 credits)">
	<CreditBalanceIndicator credits={50} isLoading={false} hasError={false} />
</Story>

<Story name="Loading (skeleton)">
	<CreditBalanceIndicator credits={null} isLoading={true} hasError={false} />
</Story>

<Story name="Zero Credits (warning)">
	<CreditBalanceIndicator credits={0} isLoading={false} hasError={false} />
</Story>

<Story name="High Count (99999+)">
	<CreditBalanceIndicator credits={100000} isLoading={false} hasError={false} />
</Story>

<Story name="Compact Mode">
	<CreditBalanceIndicator credits={42} isLoading={false} hasError={false} compact={true} />
</Story>

<Story name="Stale Data (warning icon)">
	<CreditBalanceIndicator credits={12} isLoading={false} hasError={true} />
</Story>

<Story name="Error No Cache (hidden)">
	<div class="flex items-center gap-2 text-text-muted">
		<span class="text-xs">Component hidden when error + no cached data:</span>
		<CreditBalanceIndicator credits={null} isLoading={false} hasError={true} />
		<span class="text-xs">(nothing here)</span>
	</div>
</Story>
