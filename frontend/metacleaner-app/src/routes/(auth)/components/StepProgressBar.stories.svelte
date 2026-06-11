<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StepProgressBar from './StepProgressBar.svelte';

	const { Story } = defineMeta({
		title: 'Auth/StepProgressBar',
		component: StepProgressBar,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: 'var(--color-navy-main)' }]
			}
		}
	});
</script>

<Story name="Step1Active">
	<div class="w-64 p-4">
		<StepProgressBar steps={3} currentStep={1} />
	</div>
</Story>

<Story name="Step2Active">
	<div class="w-64 p-4">
		<StepProgressBar steps={3} currentStep={2} />
	</div>
</Story>

<Story name="Step3Active">
	<div class="w-64 p-4">
		<StepProgressBar steps={3} currentStep={3} />
	</div>
</Story>

<Story name="AllComplete">
	<div class="w-64 p-4">
		<StepProgressBar steps={3} currentStep={4} />
	</div>
</Story>
