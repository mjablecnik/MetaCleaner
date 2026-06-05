<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AccordionCard from './AccordionCard.svelte';

	const { Story } = defineMeta({
		title: 'Elements/AccordionCard',
		component: AccordionCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Closed">
	<AccordionCard title="Accordion Title" open={false}>
		<p class="text-sm text-text-muted">This content is hidden when closed.</p>
	</AccordionCard>
</Story>

<Story name="Open">
	<AccordionCard title="Accordion Title" open={true}>
		<p class="text-sm text-text-muted">This content is visible when open.</p>
	</AccordionCard>
</Story>

<Story name="With Icon Closed">
	<AccordionCard title="Activity Log" icon="fa-solid fa-list" open={false}>
		<p class="font-mono text-sm text-text-muted">Log entries go here.</p>
	</AccordionCard>
</Story>

<Story name="With Icon Open">
	<AccordionCard title="Activity Log" icon="fa-solid fa-list" open={true}>
		<p class="font-mono text-sm text-text-muted">Log entries go here.</p>
	</AccordionCard>
</Story>

<Story name="Red Border">
	<AccordionCard
		title="Error Details"
		icon="fa-solid fa-triangle-exclamation"
		borderColor="red"
		open={true}
	>
		<p class="text-sm text-text-muted">Error information displayed here.</p>
	</AccordionCard>
</Story>

<Story name="Blue Border">
	<AccordionCard
		title="Processing Status"
		icon="fa-solid fa-circle-info"
		borderColor="blue"
		open={true}
	>
		<p class="text-sm text-text-muted">Processing status details here.</p>
	</AccordionCard>
</Story>

<Story name="Green Border">
	<AccordionCard
		title="Success Info"
		icon="fa-solid fa-circle-check"
		borderColor="green"
		open={true}
	>
		<p class="text-sm text-text-muted">Success details here.</p>
	</AccordionCard>
</Story>

<Story name="With Header Content">
	<AccordionCard title="Risk Summary" open={true}>
		{#snippet headerContent()}
			<span class="ml-2 text-xs font-semibold text-brand-red">72</span>
		{/snippet}
		<p class="text-sm text-text-muted">Risk breakdown details here.</p>
	</AccordionCard>
</Story>
