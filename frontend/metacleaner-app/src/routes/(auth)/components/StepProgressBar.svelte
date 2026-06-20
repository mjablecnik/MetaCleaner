<script lang="ts">
	interface Props {
		steps: number;
		currentStep: number;
	}

	let { steps, currentStep }: Props = $props();

	function stepBg(stepNum: number): string {
		if (currentStep > stepNum) return 'var(--color-brand-green)';
		if (currentStep === stepNum) return 'var(--color-brand-blue)';
		return 'var(--color-navy-lighter)';
	}

	function stepColor(stepNum: number): string {
		if (currentStep >= stepNum) return 'white';
		return 'var(--color-text-muted)';
	}

	function lineFill(afterStep: number): string {
		return currentStep > afterStep ? '100%' : '0';
	}

	function lineBg(afterStep: number): string {
		return currentStep > afterStep ? 'var(--color-brand-green)' : 'var(--color-brand-blue)';
	}
</script>

<div class="mt-2 mb-8 flex items-center justify-center gap-2 lg:mt-0 lg:mb-6">
	{#each { length: steps } as _, i (i)}
		{@const stepNum = i + 1}
		{@const isLast = stepNum === steps}
		<div class="flex items-center gap-2">
			<div
				class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 lg:h-10 lg:w-10 lg:text-base"
				style="background: {stepBg(stepNum)}; color: {stepColor(stepNum)};"
			>
				{#if currentStep > stepNum}
					<i class="fa-solid fa-check text-sm"></i>
				{:else}
					{stepNum}
				{/if}
			</div>
			{#if !isLast}
				<div class="h-1 w-16 overflow-hidden rounded-full bg-navy-lighter lg:w-20">
					<div
						class="h-full rounded-full transition-all duration-500"
						style="width: {lineFill(stepNum)}; background: {lineBg(stepNum)};"
					></div>
				</div>
			{/if}
		</div>
	{/each}
</div>
