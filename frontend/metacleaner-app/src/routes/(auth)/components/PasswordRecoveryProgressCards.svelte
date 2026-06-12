<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';

	interface Props {
		/** 2 = step 1 done, step 2 active; 3 = steps 1–2 done, step 3 active; 4 = all done */
		currentStep: 2 | 3 | 4;
		/** Override description shown when step 1 is in done state */
		step1DoneDesc?: string;
		/** Override description shown when step 2 is in done state */
		step2DoneDesc?: string;
	}

	let { currentStep, step1DoneDesc, step2DoneDesc }: Props = $props();

	function stepState(stepNum: 1 | 2 | 3): 'done' | 'active' | 'pending' {
		if (currentStep > stepNum) return 'done';
		if (currentStep === stepNum) return 'active';
		return 'pending';
	}
</script>

<div class="flex flex-col gap-3">
	{#each [1, 2, 3] as stepNum (stepNum)}
		{@const state = stepState(stepNum as 1 | 2 | 3)}
		{@const icons = ['fa-solid fa-envelope', 'fa-solid fa-shield-halved', 'fa-solid fa-lock']}
		{@const titles = [
			'auth.forgotPassword.step1.title',
			'auth.forgotPassword.step2.title',
			'auth.forgotPassword.step3.title'
		]}
		{@const defaultDescs = [
			'auth.forgotPassword.step1.desc',
			'auth.forgotPassword.step2.desc',
			'auth.forgotPassword.step3.desc'
		]}
		{@const doneDescOverrides = [step1DoneDesc, step2DoneDesc, undefined]}
		{@const desc =
			state === 'done' && doneDescOverrides[stepNum - 1]
				? doneDescOverrides[stepNum - 1]!
				: tx(defaultDescs[stepNum - 1])}
		<div
			class="step-info-card flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4"
			class:done-card={state === 'done'}
			class:active-card={state === 'active'}
		>
			<div
				class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold {state ===
				'active'
					? 'ring-2 ring-brand-blue/30'
					: ''}"
				style={state === 'done'
					? 'background: var(--color-brand-green-15);'
					: state === 'active'
						? 'background: var(--color-brand-blue-20); color: var(--color-brand-blue);'
						: 'background: var(--color-brand-green-15); color: var(--color-brand-green);'}
			>
				{#if state === 'done'}
					<i class="fa-solid fa-check text-brand-green"></i>
				{:else}
					{stepNum}
				{/if}
			</div>
			<div>
				<p class="text-sm font-semibold text-white">{tx(titles[stepNum - 1])}</p>
				<p class="mt-0.5 text-xs text-text-muted">{desc}</p>
			</div>
			<div class="ml-auto">
				{#if state === 'done'}
					<i class="fa-solid fa-circle-check text-brand-green opacity-80"></i>
				{:else if state === 'active'}
					<i class="{icons[stepNum - 1]} text-brand-blue opacity-80"></i>
				{:else}
					<i class="{icons[stepNum - 1]} text-brand-green opacity-60"></i>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.step-info-card.done-card {
		border-color: var(--color-brand-green-30) !important;
		background: var(--color-brand-green-4) !important;
	}
	.step-info-card.active-card {
		border-color: var(--color-brand-blue-40) !important;
		background: var(--color-brand-blue-5) !important;
	}
</style>
