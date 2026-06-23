<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CostBadge from './CostBadge.svelte';

	const { Story } = defineMeta({
		title: 'Elements/CostBadge',
		component: CostBadge,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Standard (cost=1)">
	<CostBadge cost={1} />
</Story>
