<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Card from '$lib/shared/elements/Card.svelte';

	interface Props {
		class?: string;
	}

	const { class: extraClass = '' }: Props = $props();
</script>

<Card class="flex flex-col gap-4 lg:gap-5 {extraClass}">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h3 class="text-base font-semibold text-white lg:text-lg">{tx('step1.status.title')}</h3>
		<span
			class="rounded-full border border-gray-700 bg-navy-lighter px-2.5 py-1 text-[10px] font-bold tracking-wider text-text-muted uppercase lg:px-3 lg:text-xs"
		>
			{tx('step1.status.waiting')}
		</span>
	</div>

	<!-- Shield visual with subtle pulse -->
	<div class="flex flex-col items-center justify-center gap-4 py-4 lg:py-6">
		<div class="relative flex items-center justify-center">
			<div
				class="idle-pulse absolute h-20 w-20 rounded-full border border-brand-blue/10 lg:h-24 lg:w-24"
			></div>
			<div
				class="flex h-16 w-16 items-center justify-center rounded-full border border-brand-blue/20 bg-brand-blue/5 lg:h-20 lg:w-20"
			>
				<i class="fa-solid fa-shield-halved text-3xl text-brand-blue/40 lg:text-4xl"></i>
			</div>
		</div>
		<div class="text-center">
			<p class="text-sm font-medium text-text-muted">
				{tx('step1.status.uploadPrompt')}
			</p>
		</div>
	</div>

	<!-- Placeholder stats (preview of what processing shows) -->
	<div class="grid w-full grid-cols-3 gap-2 lg:gap-3">
		<div class="rounded-xl border border-gray-800/60 bg-navy-main/40 p-2.5 text-center lg:p-3">
			<p class="text-lg font-black text-gray-700 lg:text-xl">—</p>
			<p class="mt-0.5 text-[9px] text-gray-700 lg:text-[10px]">{tx('common.stats.files')}</p>
		</div>
		<div class="rounded-xl border border-gray-800/60 bg-navy-main/40 p-2.5 text-center lg:p-3">
			<p class="text-lg font-black text-gray-700 lg:text-xl">—</p>
			<p class="mt-0.5 text-[9px] text-gray-700 lg:text-[10px]">
				{tx('step1.status.statFields')}
			</p>
		</div>
		<div class="rounded-xl border border-gray-800/60 bg-navy-main/40 p-2.5 text-center lg:p-3">
			<p class="text-lg font-black text-gray-700 lg:text-xl">—</p>
			<p class="mt-0.5 text-[9px] text-gray-700 lg:text-[10px]">
				{tx('step1.status.statDone')}
			</p>
		</div>
	</div>

	<!-- Steps hint -->
	<div class="flex flex-col gap-2 border-t border-gray-800/60 pt-3 lg:pt-4">
		<div class="flex items-center gap-2.5">
			<div
				class="flex h-5 w-5 items-center justify-center rounded-full border border-gray-700 bg-navy-lighter"
			>
				<span class="text-[9px] font-bold text-text-muted">1</span>
			</div>
			<p class="text-xs text-text-muted">{tx('step1.status.hint1')}</p>
		</div>
		<div class="flex items-center gap-2.5">
			<div
				class="flex h-5 w-5 items-center justify-center rounded-full border border-gray-700 bg-navy-lighter"
			>
				<span class="text-[9px] font-bold text-text-muted">2</span>
			</div>
			<p class="text-xs text-text-muted">{tx('step1.status.hint2')}</p>
		</div>
		<div class="flex items-center gap-2.5">
			<div
				class="flex h-5 w-5 items-center justify-center rounded-full border border-gray-700 bg-navy-lighter"
			>
				<span class="text-[9px] font-bold text-text-muted">3</span>
			</div>
			<p class="text-xs text-text-muted">{tx('step1.status.hint3')}</p>
		</div>
	</div>
</Card>

<style>
	@keyframes idle-pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.3;
		}
		50% {
			transform: scale(1.06);
			opacity: 0.6;
		}
	}

	.idle-pulse {
		animation: idle-pulse 3s ease-in-out infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.idle-pulse {
			animation: none;
		}
	}
</style>
