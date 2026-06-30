<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FeatureCard from './FeatureCard.svelte';

	const { Story } = defineMeta({
		title: 'Elements/FeatureCard',
		component: FeatureCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Security (blue)">
	<FeatureCard
		icon="fa-solid fa-shield-halved"
		iconColor="text-brand-blue"
		title="End-to-End Security"
		description="All files are encrypted in transit and processed in an isolated environment."
	/>
</Story>

<Story name="Speed (green)">
	<FeatureCard
		icon="fa-solid fa-bolt"
		iconColor="text-brand-green"
		title="Lightning Fast"
		description="Process hundreds of files in seconds with our optimised cleaning pipeline."
	/>
</Story>

<Story name="Privacy (orange)">
	<FeatureCard
		icon="fa-solid fa-user-shield"
		iconColor="text-brand-orange"
		title="Privacy First"
		description="No metadata is ever stored. Your files are cleaned and immediately discarded."
	/>
</Story>

<Story name="All Three">
	<div class="flex w-72 flex-col gap-3">
		<FeatureCard
			icon="fa-solid fa-shield-halved"
			iconColor="text-brand-blue"
			title="End-to-End Security"
			description="All files are encrypted in transit and processed in an isolated environment."
		/>
		<FeatureCard
			icon="fa-solid fa-bolt"
			iconColor="text-brand-green"
			title="Lightning Fast"
			description="Process hundreds of files in seconds with our optimised cleaning pipeline."
		/>
		<FeatureCard
			icon="fa-solid fa-user-shield"
			iconColor="text-brand-orange"
			title="Privacy First"
			description="No metadata is ever stored. Your files are cleaned and immediately discarded."
		/>
	</div>
</Story>
