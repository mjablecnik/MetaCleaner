<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BeforeAfterScore from '../../(step1)/components/BeforeAfterScore.svelte';

	const { Story } = defineMeta({
		title: 'Step2/BeforeAfterScore',
		component: BeforeAfterScore,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Improved — high before, low after">
	<div class="w-full max-w-sm p-4">
		<BeforeAfterScore beforeScore={87} afterScore={12} />
	</div>
</Story>

<Story name="Improved — moderate reduction">
	<div class="w-full max-w-sm p-4">
		<BeforeAfterScore beforeScore={54} afterScore={8} />
	</div>
</Story>

<Story name="Unchanged — both scores equal">
	<div class="w-full max-w-sm p-4">
		<BeforeAfterScore beforeScore={42} afterScore={42} />
	</div>
</Story>

<Story name="Unchanged — zero risk">
	<div class="w-full max-w-sm p-4">
		<BeforeAfterScore beforeScore={0} afterScore={0} />
	</div>
</Story>
