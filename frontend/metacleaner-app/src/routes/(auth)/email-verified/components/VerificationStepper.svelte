<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';

	type Orientation = 'horizontal' | 'vertical';
	type StepState = 'completed' | 'active' | 'upcoming';

	interface Props {
		currentStep: number;
		orientation?: Orientation;
	}

	const { currentStep, orientation = 'horizontal' }: Props = $props();

	function getState(step: number): StepState {
		if (step < currentStep) return 'completed';
		if (step === currentStep) return 'active';
		return 'upcoming';
	}

	function circleClass(step: number): string {
		const s = getState(step);
		if (s === 'upcoming') return 'border-2 border-gray-700 bg-navy-lighter';
		if (step === 3 && s === 'active') return 'border-2 border-brand-blue bg-brand-blue';
		return 'border-2 border-brand-green bg-brand-green';
	}

	function iconClass(step: number): string {
		const s = getState(step);
		if (s === 'completed') return 'fa-solid fa-check text-xs text-white';
		if (step <= 2) {
			return s === 'active'
				? 'fa-solid fa-check text-xs text-white'
				: 'fa-solid fa-check text-xs text-text-muted opacity-40';
		}
		return s === 'upcoming'
			? 'fa-solid fa-rocket text-xs text-text-muted'
			: 'fa-solid fa-rocket text-xs text-white';
	}

	const s1 = $derived(getState(1));
	const s2 = $derived(getState(2));
	const s3 = $derived(getState(3));

	const connector1Class = $derived(s1 === 'completed' ? 'bg-brand-green/30' : 'bg-gray-700');
	const connector2Class = $derived(s2 === 'completed' ? 'bg-brand-blue/30' : 'bg-gray-700');
</script>

{#if orientation === 'vertical'}
	<div class="flex flex-col gap-0">
		<!-- Step 1: Account Created -->
		<div class="flex items-start gap-4">
			<div class="flex flex-col items-center">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full {circleClass(1)}"
				>
					<i class={iconClass(1)}></i>
				</div>
				<div class="mt-1 h-8 w-px bg-brand-green/25"></div>
			</div>
			<div class="pt-1">
				<p class="text-sm font-semibold {s1 === 'upcoming' ? 'text-text-muted' : 'text-white'}">
					{tx('auth.checkEmail.step.accountCreated')}
				</p>
				<p class="mt-0.5 text-xs text-text-muted">
					{tx('auth.checkEmail.step.accountCreatedDesc')}
				</p>
			</div>
		</div>

		<!-- Step 2: Email Verified -->
		<div class="flex items-start gap-4">
			<div class="flex flex-col items-center">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full {circleClass(2)}"
				>
					<i class={iconClass(2)}></i>
				</div>
				<div class="mt-1 h-8 w-px bg-brand-green/25"></div>
			</div>
			<div class="flex items-center gap-2 pt-1">
				<p class="text-sm font-semibold {s2 === 'upcoming' ? 'text-text-muted' : 'text-white'}">
					{tx('auth.emailVerified.step.emailVerified')}
				</p>
				{#if s2 === 'completed'}
					<span
						class="rounded bg-brand-green-15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-green"
					>
						{tx('auth.emailVerified.step.doneBadge')}
					</span>
				{:else if s2 === 'active'}
					<span
						class="rounded bg-brand-green-15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-green"
					>
						{tx('auth.emailVerified.step.currentBadge')}
					</span>
				{/if}
			</div>
		</div>

		<!-- Step 3: Start Cleaning -->
		<div class="flex items-start gap-4">
			<div
				class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full {circleClass(3)}"
			>
				<i class={iconClass(3)}></i>
			</div>
			<div class="flex items-center gap-2 pt-1">
				<p class="text-sm font-semibold {s3 === 'upcoming' ? 'text-text-muted' : 'text-white'}">
					{tx('auth.emailVerified.step.startCleaning')}
				</p>
				{#if s3 === 'active'}
					<span
						class="rounded bg-brand-blue-15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-blue"
					>
						{tx('auth.emailVerified.step.currentBadge')}
					</span>
				{:else if s3 === 'completed'}
					<span
						class="rounded bg-brand-green-15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-green"
					>
						{tx('auth.emailVerified.step.doneBadge')}
					</span>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<!-- Horizontal layout (mobile) -->
	<div
		class="flex items-center justify-between rounded-2xl border border-gray-800 bg-navy-card px-4 py-4 shadow-card"
	>
		<!-- Step 1: Account Created -->
		<div class="flex flex-1 flex-col items-center gap-1">
			<div class="flex h-8 w-8 items-center justify-center rounded-full {circleClass(1)}">
				<i class={iconClass(1)}></i>
			</div>
			<span
				class="text-center text-[10px] font-semibold leading-tight {s1 === 'upcoming'
					? 'text-text-muted'
					: 'text-brand-green'}"
			>
				{tx('auth.checkEmail.mobile.stepCreated')}
			</span>
		</div>

		<div class="mx-1 h-px flex-1 {connector1Class}"></div>

		<!-- Step 2: Email Verified -->
		<div class="flex flex-1 flex-col items-center gap-1">
			<div class="flex h-8 w-8 items-center justify-center rounded-full {circleClass(2)}">
				<i class={iconClass(2)}></i>
			</div>
			<div class="flex flex-col items-center gap-0.5">
				<span
					class="text-center text-[10px] font-semibold leading-tight {s2 === 'upcoming'
						? 'text-text-muted'
						: 'text-brand-green'}"
				>
					{tx('auth.emailVerified.step.emailVerified')}
				</span>
				{#if s2 === 'completed'}
					<span
						class="rounded bg-brand-green-15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-green"
					>
						{tx('auth.emailVerified.step.doneBadge')}
					</span>
				{:else if s2 === 'active'}
					<span
						class="rounded bg-brand-green-15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-green"
					>
						{tx('auth.emailVerified.step.currentBadge')}
					</span>
				{/if}
			</div>
		</div>

		<div class="mx-1 h-px flex-1 {connector2Class}"></div>

		<!-- Step 3: Start Cleaning -->
		<div class="flex flex-1 flex-col items-center gap-1">
			<div class="flex h-8 w-8 items-center justify-center rounded-full {circleClass(3)}">
				<i class={iconClass(3)}></i>
			</div>
			<div class="flex flex-col items-center gap-0.5">
				<span
					class="text-center text-[10px] font-semibold leading-tight {s3 === 'completed'
						? 'text-brand-green'
						: 'text-text-muted'}"
				>
					{tx('auth.emailVerified.step.startCleaning')}
				</span>
				{#if s3 === 'active'}
					<span
						class="rounded bg-brand-blue-15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-blue"
					>
						{tx('auth.emailVerified.step.nextBadge')}
					</span>
				{:else if s3 === 'completed'}
					<span
						class="rounded bg-brand-green-15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-green"
					>
						{tx('auth.emailVerified.step.doneBadge')}
					</span>
				{/if}
			</div>
		</div>
	</div>
{/if}
