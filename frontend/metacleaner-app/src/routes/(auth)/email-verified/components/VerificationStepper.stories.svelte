<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import VerificationStepper from './VerificationStepper.svelte';

	const { Story } = defineMeta({
		title: 'EmailVerified/VerificationStepper',
		component: VerificationStepper,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: 'var(--color-navy-main)' }]
			}
		}
	});
</script>

<Story name="Horizontal">
	<div class="p-8">
		<VerificationStepper currentStep={3} orientation="horizontal" />
	</div>
</Story>

<Story name="Vertical">
	<div class="p-8">
		<VerificationStepper currentStep={3} orientation="vertical" />
	</div>
</Story>

<Story name="Step1Active">
	<div class="p-8">
		<VerificationStepper currentStep={1} orientation="horizontal" />
	</div>
</Story>

<Story name="Step2Active">
	<div class="p-8">
		<VerificationStepper currentStep={2} orientation="horizontal" />
	</div>
</Story>

<Story name="AllDone">
	<div class="p-8">
		<VerificationStepper currentStep={4} orientation="horizontal" />
	</div>
</Story>
