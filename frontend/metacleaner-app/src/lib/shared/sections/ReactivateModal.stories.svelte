<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import ReactivateModal from './ReactivateModal.svelte';

	const { Story } = defineMeta({
		title: 'Sections/ReactivateModal',
		component: ReactivateModal,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Open">
	<ReactivateModal
		planId="pro"
		price="$9.99"
		billingPeriod="monthly"
		periodEndDate="2026-07-28"
		onConfirm={fn()}
		onCancel={fn()}
	/>
</Story>

<Story name="Loading">
	<ReactivateModal
		planId="pro"
		price="$9.99"
		billingPeriod="monthly"
		periodEndDate="2026-07-28"
		onConfirm={fn()}
		onCancel={fn()}
		isLoading={true}
	/>
</Story>

<Story name="Pro Plus — Yearly">
	<ReactivateModal
		planId="proplus"
		price="$24.99"
		billingPeriod="yearly"
		periodEndDate="2027-06-30"
		onConfirm={fn()}
		onCancel={fn()}
	/>
</Story>
