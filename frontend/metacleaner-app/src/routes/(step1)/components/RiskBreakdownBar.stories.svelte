<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RiskBreakdownBar from './RiskBreakdownBar.svelte';

	const { Story } = defineMeta({
		title: 'Step2/RiskBreakdownBar',
		component: RiskBreakdownBar,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Critical — GPS Location (high value)">
	<div class="w-full max-w-md p-4">
		<RiskBreakdownBar
			icon="fa-solid fa-location-dot"
			label="GPS Location"
			severity="critical"
			severityLabel="Critical"
			value={92}
		/>
	</div>
</Story>

<Story name="High — Device Info">
	<div class="w-full max-w-md p-4">
		<RiskBreakdownBar
			icon="fa-solid fa-mobile-screen"
			label="Device Info"
			severity="high"
			severityLabel="High Risk"
			value={68}
		/>
	</div>
</Story>

<Story name="Medium — Timestamps">
	<div class="w-full max-w-md p-4">
		<RiskBreakdownBar
			icon="fa-solid fa-clock"
			label="Timestamps"
			severity="medium"
			severityLabel="Medium"
			value={45}
		/>
	</div>
</Story>

<Story name="Low — Author Info">
	<div class="w-full max-w-md p-4">
		<RiskBreakdownBar
			icon="fa-solid fa-user"
			label="Author Info"
			severity="low"
			severityLabel="Low Risk"
			value={20}
		/>
	</div>
</Story>

<Story name="Multiple Categories">
	<div class="flex w-full max-w-md flex-col gap-3 p-4">
		<RiskBreakdownBar
			icon="fa-solid fa-location-dot"
			label="GPS Location"
			severity="critical"
			severityLabel="Critical"
			value={92}
		/>
		<RiskBreakdownBar
			icon="fa-solid fa-mobile-screen"
			label="Device Info"
			severity="high"
			severityLabel="High Risk"
			value={68}
		/>
		<RiskBreakdownBar
			icon="fa-solid fa-clock"
			label="Timestamps"
			severity="medium"
			severityLabel="Medium"
			value={45}
		/>
		<RiskBreakdownBar
			icon="fa-solid fa-user"
			label="Author Info"
			severity="low"
			severityLabel="Low Risk"
			value={20}
		/>
	</div>
</Story>
