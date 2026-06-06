<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ScanProgressIndicator from './ScanProgressIndicator.svelte';

	const { Story } = defineMeta({
		title: 'Step1/ScanProgressIndicator',
		component: ScanProgressIndicator,
		tags: ['autodocs']
	});
</script>

<Story name="Idle">
	<ScanProgressIndicator status="pending" />
</Story>

<Story name="Scanning">
	<ScanProgressIndicator status="scanning" />
</Story>

<Story name="Complete">
	<ScanProgressIndicator status="done" />
</Story>

<Story name="Error">
	<ScanProgressIndicator status="error" />
</Story>
