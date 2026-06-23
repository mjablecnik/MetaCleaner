<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PlanPill from './PlanPill.svelte';

	const { Story } = defineMeta({
		title: 'Components/PlanPill',
		component: PlanPill,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Free">
	<PlanPill planId="free" planStatus="free" />
</Story>

<Story name="Pro (active)">
	<PlanPill planId="pro" planStatus="active" />
</Story>

<Story name="Pro+ (active)">
	<PlanPill planId="proplus" planStatus="active" />
</Story>

<Story name="Pro (trialing)">
	<PlanPill planId="pro" planStatus="trialing" />
</Story>

<Story name="Cancelled (shows Free)">
	<PlanPill planId="pro" planStatus="cancelled" />
</Story>
