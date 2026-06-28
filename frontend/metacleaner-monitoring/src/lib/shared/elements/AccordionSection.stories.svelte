<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AccordionSection from './AccordionSection.svelte';

	const { Story } = defineMeta({
		title: 'Elements/AccordionSection',
		component: AccordionSection,
		tags: ['autodocs']
	});
</script>

<Story name="Open">
	<AccordionSection title="Charts Overview" open={true} ontoggle={() => {}}>
		<div class="text-textSec text-sm py-2">
			Section content is visible when the accordion is open.
		</div>
	</AccordionSection>
</Story>

<Story name="Closed">
	<AccordionSection title="Charts Overview" open={false} ontoggle={() => {}}>
		<div class="text-textSec text-sm py-2">
			This content is hidden when the accordion is closed.
		</div>
	</AccordionSection>
</Story>

<Story name="WithIcon">
	<AccordionSection
		title="Performance Metrics"
		icon="fa-chart-line"
		open={true}
		ontoggle={() => {}}
	>
		<div class="text-textSec text-sm py-2">Section with an icon in the header area.</div>
	</AccordionSection>
</Story>
