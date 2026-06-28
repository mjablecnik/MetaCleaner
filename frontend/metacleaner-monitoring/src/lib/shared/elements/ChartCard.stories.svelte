<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ChartCard from './ChartCard.svelte';

	const { Story } = defineMeta({
		title: 'Elements/ChartCard',
		component: ChartCard,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<ChartCard title="Response Time">
		<div
			class="h-[200px] w-full bg-surface/30 rounded-lg flex items-center justify-center text-textSec text-sm"
		>
			Chart placeholder
		</div>
	</ChartCard>
</Story>

<Story name="WithSubtitle">
	<ChartCard title="Response Time" subtitle="Last 24 hours">
		<div
			class="h-[200px] w-full bg-surface/30 rounded-lg flex items-center justify-center text-textSec text-sm"
		>
			Chart placeholder
		</div>
	</ChartCard>
</Story>

<Story name="WithRightContent">
	<ChartCard title="Server Resources">
		{#snippet titleRight()}
			<div class="flex gap-4 text-sm bg-surface/50 p-2 rounded-lg">
				<div class="flex items-center gap-2">
					<span class="w-2.5 h-2.5 rounded-full bg-blue"></span>
					<span class="text-textSec">CPU</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="w-2.5 h-2.5 rounded-full bg-purple"></span>
					<span class="text-textSec">RAM</span>
				</div>
			</div>
		{/snippet}
		<div
			class="h-[200px] w-full bg-surface/30 rounded-lg flex items-center justify-center text-textSec text-sm"
		>
			Chart placeholder
		</div>
	</ChartCard>
</Story>

<Story name="Mobile">
	<div style="max-width: 375px">
		<ChartCard title="Response Time" subtitle="Last 24h">
			<div
				class="h-[180px] w-full bg-surface/30 rounded-lg flex items-center justify-center text-textSec text-sm"
			>
				Chart placeholder
			</div>
		</ChartCard>
	</div>
</Story>
