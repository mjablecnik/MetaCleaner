<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatCard from './StatCard.svelte';

	const { Story } = defineMeta({
		title: 'Components/StatCard',
		component: StatCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Blue (default)">
	<StatCard
		icon="fa-solid fa-shield"
		iconColor="blue"
		value="1,248"
		label="Metadata Fields Removed"
	/>
</Story>

<Story name="Green">
	<StatCard icon="fa-solid fa-check-circle" iconColor="green" value="47" label="Files Cleaned" />
</Story>

<Story name="Red">
	<StatCard icon="fa-solid fa-location-dot" iconColor="red" value="12" label="GPS Tags Removed" />
</Story>

<Story name="Orange">
	<StatCard
		icon="fa-solid fa-triangle-exclamation"
		iconColor="orange"
		value="3"
		label="Files With Warnings"
	/>
</Story>

<Story name="Blue Highlighted">
	<StatCard
		icon="fa-solid fa-shield"
		iconColor="blue"
		value="1,248"
		label="Metadata Fields Removed"
		highlight
	/>
</Story>

<Story name="Green Highlighted">
	<StatCard
		icon="fa-solid fa-check-circle"
		iconColor="green"
		value="47"
		label="Files Cleaned"
		highlight
	/>
</Story>

<Story name="Red Highlighted">
	<StatCard
		icon="fa-solid fa-location-dot"
		iconColor="red"
		value="12"
		label="GPS Tags Removed"
		highlight
	/>
</Story>

<Story name="Orange Highlighted">
	<StatCard
		icon="fa-solid fa-triangle-exclamation"
		iconColor="orange"
		value="3"
		label="Files With Warnings"
		highlight
	/>
</Story>

<Story name="With Mobile Label">
	<StatCard
		icon="fa-solid fa-shield"
		iconColor="blue"
		value="1,248"
		label="Metadata Fields Removed"
		labelMobile="Fields"
	/>
</Story>
