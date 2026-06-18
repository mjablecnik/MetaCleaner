<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BillingToggle from './BillingToggle.svelte';

	const { Story } = defineMeta({
		title: 'Pricing/BillingToggle',
		component: BillingToggle,
		tags: ['autodocs'],
		args: {
			value: 'monthly',
			onChange: (/** @type {'monthly'|'yearly'} */ v) => console.log('billing changed:', v)
		}
	});
</script>

<Story name="Monthly" args={{ value: 'monthly' }} />
<Story name="Yearly" args={{ value: 'yearly' }} />
