<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RiskScoreRing from '../../(step1)/components/RiskScoreRing.svelte';

	const { Story } = defineMeta({
		title: 'Step2/RiskScoreRing',
		component: RiskScoreRing,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Low Risk (20)">
	<RiskScoreRing score={20} color="green" showLabel={true} />
</Story>

<Story name="Medium Risk (50)">
	<RiskScoreRing score={50} color="orange" showLabel={true} />
</Story>

<Story name="High Risk (72)">
	<RiskScoreRing score={72} color="red" showLabel={true} />
</Story>

<Story name="Small Size">
	<RiskScoreRing score={50} color="orange" size="sm" />
</Story>

<Story name="Large Size">
	<RiskScoreRing score={50} color="orange" size="lg" />
</Story>

<Story name="Blue Variant">
	<RiskScoreRing score={60} color="blue" showLabel={true} />
</Story>
