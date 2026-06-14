<script lang="ts">
	import VerificationStepper from '../components/VerificationStepper.svelte';

	interface Props {
		currentStep: number;
	}

	const { currentStep }: Props = $props();
</script>

<!-- Mobile: horizontal stepper -->
<div class="lg:hidden">
	<VerificationStepper {currentStep} orientation="horizontal" />
</div>

<!-- Desktop: vertical stepper -->
<div class="hidden lg:block">
	<VerificationStepper {currentStep} orientation="vertical" />
</div>
