<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import ErrorTypeSelector from './ErrorTypeSelector.svelte';

	const { Story } = defineMeta({
		title: 'Step4/ErrorTypeSelector',
		component: ErrorTypeSelector,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }],
			},
		},
	});

	const allTypes = [
		{ id: 'cleaning', icon: 'fa-broom', title: 'Cleaning error', description: 'Metadata could not be completely removed.' },
		{ id: 'connection', icon: 'fa-wifi', title: 'Connection error', description: 'Communication with the processing service was interrupted.' },
		{ id: 'timeout', icon: 'fa-clock', title: 'Timeout', description: 'Processing exceeded the time limit.' },
	];
</script>

<Story name="Active — Single Type Selected">
	<div class="w-full max-w-xs p-4">
		<ErrorTypeSelector
			types={[allTypes[0]]}
			selected="cleaning"
			onSelect={fn()}
		/>
	</div>
</Story>

<Story name="Inactive — Single Type Unselected">
	<div class="w-full max-w-xs p-4">
		<ErrorTypeSelector
			types={[allTypes[0]]}
			selected=""
			onSelect={fn()}
		/>
	</div>
</Story>

<Story name="Multiple Types — First Active">
	<div class="w-full max-w-xs p-4">
		<ErrorTypeSelector
			types={allTypes}
			selected="cleaning"
			onSelect={fn()}
		/>
	</div>
</Story>

<Story name="Multiple Types — Last Active">
	<div class="w-full max-w-xs p-4">
		<ErrorTypeSelector
			types={allTypes}
			selected="timeout"
			onSelect={fn()}
		/>
	</div>
</Story>

<Story name="Multiple Types — None Active">
	<div class="w-full max-w-xs p-4">
		<ErrorTypeSelector
			types={allTypes}
			selected=""
			onSelect={fn()}
		/>
	</div>
</Story>
