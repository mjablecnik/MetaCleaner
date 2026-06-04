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
				values: [{ name: 'dark', value: '#0a1628' }],
			},
		},
	});
</script>

<Story name="Closed">
	<AccordionCard title="Accordion Title" open={false}>
		{#snippet children()}
			<p class="text-text-muted text-sm">This content is hidden when closed.</p>
		{/snippet}
	</AccordionCard>
</Story>

<Story name="Open">
	<AccordionCard title="Accordion Title" open={true}>
		{#snippet children()}
			<p class="text-text-muted text-sm">This content is visible when open.</p>
		{/snippet}
	</AccordionCard>
</Story>

<Story name="With Icon Closed">
	<AccordionCard title="Activity Log" icon="fa-solid fa-list" open={false}>
		{#snippet children()}
			<p class="text-text-muted text-sm font-mono">Log entries go here.</p>
		{/snippet}
	</AccordionCard>
</Story>

<Story name="With Icon Open">
	<AccordionCard title="Activity Log" icon="fa-solid fa-list" open={true}>
		{#snippet children()}
			<p class="text-text-muted text-sm font-mono">Log entries go here.</p>
		{/snippet}
	</AccordionCard>
</Story>

<Story name="Red Border">
	<AccordionCard title="Error Details" icon="fa-solid fa-triangle-exclamation" borderColor="red" open={true}>
		{#snippet children()}
			<p class="text-text-muted text-sm">Error information displayed here.</p>
		{/snippet}
	</AccordionCard>
</Story>

<Story name="Blue Border">
	<AccordionCard title="Processing Status" icon="fa-solid fa-circle-info" borderColor="blue" open={true}>
		{#snippet children()}
			<p class="text-text-muted text-sm">Processing status details here.</p>
		{/snippet}
	</AccordionCard>
</Story>

<Story name="Green Border">
	<AccordionCard title="Success Info" icon="fa-solid fa-circle-check" borderColor="green" open={true}>
		{#snippet children()}
			<p class="text-text-muted text-sm">Success details here.</p>
		{/snippet}
	</AccordionCard>
</Story>

<Story name="With Header Content">
	<AccordionCard title="Risk Summary" open={true}>
		{#snippet headerContent()}
			<span class="ml-2 text-xs text-brand-red font-semibold">72</span>
		{/snippet}
		{#snippet children()}
			<p class="text-text-muted text-sm">Risk breakdown details here.</p>
		{/snippet}
	</AccordionCard>
</Story>
