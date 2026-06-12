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

<div class="mb-5 flex items-center gap-2 lg:mb-6">
	{#each { length: steps } as _, i (i)}
		{@const stepNum = i + 1}
		{@const isLast = stepNum === steps}
		<div class="flex {isLast ? '' : 'flex-1'} items-center gap-2">
			<div
				class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 lg:h-8 lg:w-8"
				style="background: {stepBg(stepNum)}; color: {stepColor(stepNum)};"
			>
				{#if currentStep > stepNum}
					<i class="fa-solid fa-check text-xs"></i>
				{:else}
					{stepNum}
				{/if}
			</div>
			{#if !isLast}
				<div class="h-1 flex-1 overflow-hidden rounded-full bg-navy-lighter">
					<div
						class="h-full rounded-full transition-all duration-500"
						style="width: {lineFill(stepNum)}; background: {lineBg(stepNum)};"
					></div>
				</div>
			{/if}
		</div>
	{/each}
</div>
